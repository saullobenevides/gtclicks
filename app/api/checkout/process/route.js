import { MercadoPagoConfig, Payment, Customer } from "mercadopago";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { NextResponse } from "next/server";

// Initialize Mercado Pago client
const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
if (!accessToken) {
  console.error(
    "CRITICAL: MERCADOPAGO_ACCESS_TOKEN is missing in environment variables.",
  );
}

const client = new MercadoPagoConfig({
  accessToken: accessToken || "TEST-00000000-0000-0000-0000-000000000000", // Preventing crash, but WILL fail payment
});

/**
 * Helper to get or create a Mercado Pago Customer
 */
async function getOrCreateCustomer(user) {
  const customerClient = new Customer(client);

  // 1. If user already has a customer ID, return it
  if (user.mercadopagoCustomerId) {
    return user.mercadopagoCustomerId;
  }

  try {
    // 2. Search by email to avoid duplicates if DB is out of sync
    const searchResult = await customerClient.search({
      options: { email: user.email },
    });

    if (searchResult.results && searchResult.results.length > 0) {
      const existingCustomer = searchResult.results[0];
      // Update local DB
      await prisma.user.update({
        where: { id: user.id },
        data: { mercadopagoCustomerId: existingCustomer.id },
      });
      return existingCustomer.id;
    }

    // 3. Create new customer
    const newCustomer = await customerClient.create({
      body: {
        email: user.email,
        first_name: user.name?.split(" ")[0] || "Cliente",
        last_name: user.name?.split(" ").slice(1).join(" ") || "GTClicks",
        // phone: ... if available
      },
    });

    // Update local DB
    await prisma.user.update({
      where: { id: user.id },
      data: { mercadopagoCustomerId: newCustomer.id },
    });

    return newCustomer.id;
  } catch (error) {
    console.error("Error managing MP Customer:", error);
    return null; // Fail gracefully, proceed as guest
  }
}

export async function POST(request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { formData, orderId } = body;
    // Fetch fresh user data to check for customer ID and photographer profile
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { fotografo: true },
    });

    let total;
    let itemsForPayment;
    let existingOrder = null;

    if (orderId) {
      // --- RETRY FLOW ---
      const userOrder = await prisma.pedido.findUnique({
        where: { id: orderId, userId: user.id }, // Security check
        include: { itens: { include: { foto: true, licenca: true } } },
      });

      if (!userOrder) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      if (userOrder.status === "PAGO") {
        return NextResponse.json(
          { error: "Order already paid" },
          { status: 400 },
        );
      }

      existingOrder = userOrder;
      total = Number(userOrder.total);
      itemsForPayment = userOrder.itens;
    } else {
      // --- NEW CHECKOUT FLOW (CART) ---
      const cart = await prisma.carrinho.findUnique({
        where: { userId: user.id },
        include: {
          itens: {
            include: {
              foto: {
                include: {
                  colecao: true, // Needed for discounts
                },
              },
              licenca: true,
            },
          },
        },
      });

      if (!cart || cart.itens.length === 0) {
        return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
      }

      itemsForPayment = cart.itens;

      // Duplicate Logic from CartContext to ensure Backend Safety & Consistency
      const calculateItemPrice = (item, allItems) => {
        // 1. If License is selected, use License Price (Standard Override)
        if (item.licencaId && item.licenca) {
          return Number(item.licenca.preco);
        }

        // 2. If no Collection or Discounts, use Base Price (default 10 if missing)
        // Note: item.foto.colecao.precoFoto is the base price in DB
        const basePrice = item.foto.colecao?.precoFoto
          ? Number(item.foto.colecao.precoFoto)
          : 10;

        if (
          !item.foto.colecaoId ||
          !item.foto.colecao?.descontos ||
          !Array.isArray(item.foto.colecao.descontos) ||
          item.foto.colecao.descontos.length === 0
        ) {
          return basePrice;
        }

        // 3. Progressive Discount Logic
        // Count items from the SAME collection in the cart
        const collectionItemsCount = allItems.filter(
          (i) => i.foto.colecaoId === item.foto.colecaoId,
        ).length;

        const discounts = item.foto.colecao.descontos;

        // Find applicable discount (highest min that fits count)
        const applicableDiscounts = discounts
          .filter((d) => collectionItemsCount >= d.min)
          .sort((a, b) => b.min - a.min); // Descending order

        if (applicableDiscounts.length > 0) {
          return Number(applicableDiscounts[0].price);
        }

        return basePrice;
      };

      // Calculate Total
      total = itemsForPayment.reduce((sum, item) => {
        return sum + calculateItemPrice(item, itemsForPayment);
      }, 0);

      // Attach calculated price to items for later use in creating Order Items
      itemsForPayment = itemsForPayment.map((item) => ({
        ...item,
        finalPrice: calculateItemPrice(item, itemsForPayment),
      }));
    }

    // 0. Prepare Order Data
    let finalOrderId = orderId;
    let orderToUpdate = null;

    if (orderId) {
      // Retry - Order already exists
      // ... existing validation checks are fine above
    } else {
      // New Order - Create it NOW as PENDING to get an ID
      const newOrder = await prisma.pedido.create({
        data: {
          userId: user.id,
          total: total,
          status: "PENDENTE",
          itens: {
            create: itemsForPayment.map((item) => ({
              fotoId: item.fotoId,
              licencaId: item.licencaId,
              precoPago: item.finalPrice, // Uses the correctly calculated price with discounts
            })),
          },
        },
      });
      finalOrderId = newOrder.id;
    }

    // 1. Get or Create Customer for Saved Cards
    const customerId = await getOrCreateCustomer(dbUser);

    // 2. Create Payment in Mercado Pago
    const payment = new Payment(client);

    const paymentData = {
      ...formData,
      description: `GTClicks # ${finalOrderId.slice(-8)}`,
      payer: {
        ...formData.payer,
        email: user.email,
        ...(customerId && { id: customerId }),
      },
      metadata: {
        user_id: user.id,
        order_id: finalOrderId,
      },
      external_reference: finalOrderId, // CRITICAL FOR WEBHOOK
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://gtclicks.com.br"}/api/webhooks/mercadopago`,
    };

    console.log("Creating payment:", JSON.stringify(paymentData, null, 2));

    const mpResponse = await payment.create({ body: paymentData });
    const { id: paymentId, status, status_detail } = mpResponse;

    console.log(`Payment created: ${paymentId} (${status})`);

    if (paymentId) {
      const statusEnum = status === "approved" ? "PAGO" : "PENDENTE";

      // Update the Order (Created or Existing) with PaymentId
      await prisma.pedido.update({
        where: { id: finalOrderId },
        data: {
          status: statusEnum,
          paymentId: paymentId.toString(),
        },
      });

      return NextResponse.json({
        id: paymentId,
        status: status,
        status_detail: status_detail,
        orderId: finalOrderId,
      });
    }
  } catch (error) {
    console.error("Checkout Error:", error);
    return NextResponse.json(
      {
        error: error.message || "Internal Server Error",
      },
      { status: 500 },
    );
  }
}

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
    const { formData, orderId } = body; // Recieve orderId if retry

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
        include: { itens: { include: { foto: true, licenca: true } } },
      });

      if (!cart || cart.itens.length === 0) {
        return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
      }

      itemsForPayment = cart.itens;
      total = cart.itens.reduce((sum, item) => {
        const price = item.licencaId ? Number(item.licenca.preco) : 10;
        return sum + price;
      }, 0);
    }

    // 1. Get or Create Customer for Saved Cards
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    const customerId = await getOrCreateCustomer(dbUser); // Pass fresh user data

    // 2. Create Payment in Mercado Pago
    const payment = new Payment(client);

    // items validation for Brick... actually brick sends total amount in formData

    const paymentData = {
      ...formData,
      description: `GTClicks Purchase${orderId ? ` Retry #${orderId.slice(-8)}` : ""}`,
      payer: {
        ...formData.payer,
        email: user.email,
        ...(customerId && { id: customerId }),
        // If we want to save card, we must force type 'customer' if id is present?
        // SDK usually handles it if we pass 'id'.
      },
      metadata: {
        user_id: user.id,
        order_id: orderId || null, // Track orderId in metadata
      },
    };

    console.log("Creating payment:", JSON.stringify(paymentData, null, 2));

    const mpResponse = await payment.create({ body: paymentData });
    const { id: paymentId, status, status_detail } = mpResponse;

    console.log(`Payment created: ${paymentId} (${status})`);

    let finalOrderId = orderId;

    if (paymentId) {
      const statusEnum = status === "approved" ? "PAGO" : "PENDENTE";

      if (orderId) {
        // Update Existing Order
        await prisma.pedido.update({
          where: { id: orderId },
          data: {
            status: statusEnum,
            paymentId: paymentId.toString(),
            // Optionally update total/items if they changed (unlikely for retry)
          },
        });
      } else {
        // Create New Order
        const newOrder = await prisma.pedido.create({
          data: {
            userId: user.id,
            total: total,
            status: statusEnum,
            paymentId: paymentId.toString(),
            itens: {
              create: itemsForPayment.map((item) => ({
                fotoId: item.fotoId,
                licencaId: item.licencaId,
                precoPago: item.licencaId ? item.licenca.preco : 0,
              })),
            },
          },
        });
        finalOrderId = newOrder.id;
      }

      return NextResponse.json({
        id: paymentId,
        status: status,
        status_detail: status_detail,
        orderId: finalOrderId,
      });
    }

    return NextResponse.json(
      { error: "Payment creation failed" },
      { status: 500 },
    );
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

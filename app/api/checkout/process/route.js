import { MercadoPagoConfig, Payment, Customer } from "mercadopago";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { NextResponse } from "next/server";

// Initialize Mercado Pago client
const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
if (!accessToken) {
  console.error(
    "CRITICAL: MERCADOPAGO_ACCESS_TOKEN is missing in environment variables."
  );
}

const client = new MercadoPagoConfig({
  accessToken: accessToken || "TEST-00000000-0000-0000-0000-000000000000", // Preventing crash, but WILL fail payment
});

/** Mapeamento nome do estado → sigla UF (Mercado Pago exige federal_unit como sigla) */
const ESTADOS_UF = {
  acre: "AC",
  alagoas: "AL",
  amapá: "AP",
  amazonas: "AM",
  bahia: "BA",
  ceará: "CE",
  "distrito federal": "DF",
  espírito: "ES",
  "espírito santo": "ES",
  goiás: "GO",
  maranhão: "MA",
  "mato grosso": "MT",
  "mato grosso do sul": "MS",
  minas: "MG",
  "minas gerais": "MG",
  pará: "PA",
  paraíba: "PB",
  paraná: "PR",
  pernambuco: "PE",
  piauí: "PI",
  "rio de janeiro": "RJ",
  "rio grande do norte": "RN",
  "rio grande do sul": "RS",
  rondônia: "RO",
  roraima: "RR",
  "santa catarina": "SC",
  "são paulo": "SP",
  sergipe: "SE",
  tocantins: "TO",
};

function toFederalUnit(val) {
  if (!val || typeof val !== "string") return val;
  const trimmed = val.trim();
  if (trimmed.length === 2) return trimmed.toUpperCase();
  const key = trimmed.toLowerCase().replace(/\s+/g, " ");
  return ESTADOS_UF[key] || trimmed;
}

function normalizePayerAddress(payer) {
  if (!payer?.address || typeof payer.address !== "object") return payer;
  const addr = { ...payer.address };
  const stateVal = addr.federal_unit ?? addr.state_name ?? addr.estado;
  if (stateVal) {
    addr.federal_unit = toFederalUnit(stateVal);
  }
  if (addr.street_number != null && typeof addr.street_number !== "string") {
    addr.street_number = String(addr.street_number);
  }
  return { ...payer, address: addr };
}

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

    const rawBody = await request.json();
    // Validação manual para evitar conflito Zod 4 vs Next.js bundled Zod
    const formData = rawBody?.formData;
    const orderId =
      typeof rawBody?.orderId === "string" ? rawBody.orderId : undefined;
    if (!formData || typeof formData !== "object") {
      return NextResponse.json(
        { error: "Dados de pagamento inválidos" },
        { status: 400 }
      );
    }
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
          { status: 400 }
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
        // Mercado Pago exige valor positivo; mínimo 0.01
        const rawBase =
          item.foto.colecao?.precoFoto != null
            ? Number(item.foto.colecao.precoFoto)
            : 10;
        const basePrice = rawBase > 0 ? rawBase : 10;

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
          (i) => i.foto.colecaoId === item.foto.colecaoId
        ).length;

        const discounts = item.foto.colecao.descontos;

        // Find applicable discount (highest min that fits count)
        const applicableDiscounts = discounts
          .filter((d) => collectionItemsCount >= d.min)
          .sort((a, b) => b.min - a.min); // Descending order

        if (applicableDiscounts.length > 0) {
          const discountPrice = Number(applicableDiscounts[0].price);
          return discountPrice > 0 ? discountPrice : basePrice;
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

    // Validate amount (Mercado Pago requires positive transaction_amount)
    const safeTotal = Math.round(Number(total) * 100) / 100;
    if (!Number.isFinite(safeTotal) || safeTotal <= 0) {
      return NextResponse.json(
        {
          error:
            "O valor do pedido é inválido. Verifique os itens do carrinho e tente novamente.",
        },
        { status: 400 }
      );
    }

    // 1. Get or Create Customer for Saved Cards
    const customerId = await getOrCreateCustomer(dbUser);

    // 2. Create Payment in Mercado Pago
    const payment = new Payment(client);

    // Copia campos do Brick (token, installments para cartão; transaction_details para PSE; etc.)
    let payerFromForm =
      formData.payer && typeof formData.payer === "object"
        ? formData.payer
        : {};
    payerFromForm = normalizePayerAddress(payerFromForm);

    // entityType só aceita "individual" ou "association" (Mercado Pago)
    if (
      payerFromForm.entity_type &&
      !["individual", "association"].includes(payerFromForm.entity_type)
    ) {
      delete payerFromForm.entity_type;
    }

    const paymentData = {
      ...formData,
      transaction_amount: safeTotal,
      payment_method_id: formData.payment_method_id || "pix",
      description: `GTClicks # ${finalOrderId.slice(-8)}`,
      payer: {
        ...payerFromForm,
        email: user.email,
        ...(customerId && { id: customerId }),
      },
      metadata: {
        user_id: user.id,
        order_id: finalOrderId,
      },
      external_reference: finalOrderId, // CRITICAL FOR WEBHOOK
      notification_url: `${
        process.env.NEXT_PUBLIC_APP_URL || "https://gtclicks.com.br"
      }/api/webhooks/mercadopago`,
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
    let safeMessage =
      error?.message && typeof error.message === "string"
        ? error.message
        : "Erro ao processar pagamento. Tente novamente.";
    // Mensagem amigável para boleto sem endereço completo
    if (
      safeMessage.includes("payer.address") ||
      safeMessage.includes("federal_unit") ||
      safeMessage.includes("registered boleto")
    ) {
      safeMessage =
        "Para gerar o boleto, preencha todos os campos de endereço no formulário (CEP, rua, número, bairro, cidade e estado).";
    }
    if (safeMessage.includes("transaction_amount must be positive")) {
      safeMessage =
        "O valor do pedido é inválido. Verifique os itens e tente novamente.";
    }
    return NextResponse.json({ error: safeMessage }, { status: 500 });
  }
}

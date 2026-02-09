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
const ESTADOS_UF: Record<string, string> = {
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

function toFederalUnit(val: unknown): string | undefined {
  if (!val || typeof val !== "string") return val as string | undefined;
  const trimmed = val.trim();
  if (trimmed.length === 2) return trimmed.toUpperCase();
  const key = trimmed.toLowerCase().replace(/\s+/g, " ");
  return ESTADOS_UF[key] || trimmed;
}

interface PayerAddress {
  federal_unit?: string;
  state_name?: string;
  estado?: string;
  street_number?: string | number;
  [key: string]: unknown;
}

interface PayerForm {
  address?: PayerAddress;
  entity_type?: string;
  [key: string]: unknown;
}

function normalizePayerAddress(payer: PayerForm): PayerForm {
  if (!payer?.address || typeof payer.address !== "object") return payer;
  const addr = { ...payer.address };
  const stateVal = addr.federal_unit ?? addr.state_name ?? addr.estado;
  if (stateVal) {
    addr.federal_unit = toFederalUnit(stateVal) ?? addr.federal_unit;
  }
  if (addr.street_number != null && typeof addr.street_number !== "string") {
    addr.street_number = String(addr.street_number);
  }
  return { ...payer, address: addr };
}

/**
 * Helper to get or create a Mercado Pago Customer
 */
async function getOrCreateCustomer(user: {
  id: string;
  email: string;
  name?: string | null;
  mercadopagoCustomerId?: string | null;
}): Promise<string | null> {
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
      const customerId = existingCustomer.id ?? null;
      if (customerId) {
        await prisma.user.update({
          where: { id: user.id },
          data: { mercadopagoCustomerId: customerId },
        });
        return customerId;
      }
    }

    // 3. Create new customer
    const newCustomer = await customerClient.create({
      body: {
        email: user.email,
        first_name: user.name?.split(" ")[0] || "Cliente",
        last_name: user.name?.split(" ").slice(1).join(" ") || "GTClicks",
      },
    });

    const newCustomerId = newCustomer.id ?? null;
    if (newCustomerId) {
      await prisma.user.update({
        where: { id: user.id },
        data: { mercadopagoCustomerId: newCustomerId },
      });
      return newCustomerId;
    }
    return null;
  } catch (error) {
    console.error("Error managing MP Customer:", error);
    return null; // Fail gracefully, proceed as guest
  }
}

type CartItemWithFoto = {
  fotoId: string;
  licencaId: string | null;
  licenca: Record<string, unknown> | null;
  foto: {
    colecaoId?: string | null;
    colecao?: {
      precoFoto?: unknown;
      descontos?: Array<{ min: number; price: unknown }>;
    } | null;
  };
  finalPrice?: number;
};

function calculateItemPrice(
  item: CartItemWithFoto,
  allItems: CartItemWithFoto[]
): number {
  // 1. If License is selected, use License Price (Standard Override)
  if (item.licencaId && item.licenca && "preco" in item.licenca && item.licenca.preco != null) {
    return Number(item.licenca.preco);
  }

  // 2. Base price
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
  const collectionItemsCount = allItems.filter(
    (i) => i.foto.colecaoId === item.foto.colecaoId
  ).length;

  const discounts = item.foto.colecao.descontos;

  const applicableDiscounts = discounts
    .filter((d) => collectionItemsCount >= d.min)
    .sort((a, b) => b.min - a.min);

  if (applicableDiscounts.length > 0) {
    const discountPrice = Number(applicableDiscounts[0].price);
    return discountPrice > 0 ? discountPrice : basePrice;
  }

  return basePrice;
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rawBody = (await request.json()) as {
      formData?: Record<string, unknown>;
      orderId?: string;
    };

    const formData = rawBody?.formData;
    const orderId =
      typeof rawBody?.orderId === "string" ? rawBody.orderId : undefined;

    if (!formData || typeof formData !== "object") {
      return NextResponse.json(
        { error: "Dados de pagamento inválidos" },
        { status: 400 }
      );
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { fotografo: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let total: number;
    let itemsForPayment: CartItemWithFoto[];
    let existingOrder: { id: string; status: string } | null = null;

    if (orderId) {
      // --- RETRY FLOW ---
      const userOrder = await prisma.pedido.findUnique({
        where: { id: orderId, userId: user.id },
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
      itemsForPayment = userOrder.itens.map((i) =>
        ({
          fotoId: i.fotoId,
          licencaId: i.licencaId,
          licenca: i.licenca as Record<string, unknown> | null,
          foto: i.foto,
          finalPrice: Number(i.precoPago),
        }) as CartItemWithFoto
      );
    } else {
      // --- NEW CHECKOUT FLOW (CART) ---
      const cart = await prisma.carrinho.findUnique({
        where: { userId: user.id },
        include: {
          itens: {
            include: {
              foto: {
                include: {
                  colecao: true,
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

      itemsForPayment = cart.itens.map((item) => {
        const finalPrice = calculateItemPrice(item as CartItemWithFoto, cart.itens as CartItemWithFoto[]);
        return {
          ...item,
          finalPrice,
        } as CartItemWithFoto;
      });

      total = itemsForPayment.reduce((sum, item) => {
        return sum + (item.finalPrice ?? 0);
      }, 0);
    }

    let finalOrderId = orderId;

    if (!orderId) {
      const newOrder = await prisma.pedido.create({
        data: {
          userId: user.id,
          total: total,
          status: "PENDENTE",
          itens: {
            create: itemsForPayment.map((item) => ({
              fotoId: item.fotoId,
              licencaId: item.licencaId,
              precoPago: item.finalPrice ?? 0,
            })),
          },
        },
      });
      finalOrderId = newOrder.id;
    }

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

    const customerId = await getOrCreateCustomer(dbUser);

    const payment = new Payment(client);

    let payerFromForm: PayerForm =
      formData.payer && typeof formData.payer === "object"
        ? (formData.payer as PayerForm)
        : {};
    payerFromForm = normalizePayerAddress(payerFromForm);

    if (
      payerFromForm.entity_type &&
      !["individual", "association"].includes(payerFromForm.entity_type)
    ) {
      delete payerFromForm.entity_type;
    }

    if (!finalOrderId) {
      return NextResponse.json(
        { error: "Erro ao processar pedido" },
        { status: 500 }
      );
    }

    const paymentMethodId =
      typeof formData.payment_method_id === "string"
        ? formData.payment_method_id
        : "pix";

    const paymentData = {
      ...formData,
      transaction_amount: safeTotal,
      payment_method_id: paymentMethodId,
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
      external_reference: finalOrderId,
      notification_url: `${
        process.env.NEXT_PUBLIC_APP_URL || "https://gtclicks.com.br"
      }/api/webhooks/mercadopago`,
    };

    console.log("Creating payment:", JSON.stringify(paymentData, null, 2));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Mercado Pago SDK types are strict; formData comes from Brick
    const mpResponse = await payment.create({ body: paymentData as any });
    const { id: paymentId, status, status_detail } = mpResponse;

    console.log(`Payment created: ${paymentId} (${status})`);

    if (paymentId) {
      const statusEnum = status === "approved" ? "PAGO" : "PENDENTE";

      await prisma.pedido.update({
        where: { id: finalOrderId },
        data: {
          status: statusEnum,
          paymentId: paymentId.toString(),
        },
      });

      return NextResponse.json({
        id: paymentId,
        status,
        status_detail,
        orderId: finalOrderId,
      });
    }
  } catch (error) {
    console.error("Checkout Error:", error);
    const err = error as { message?: string };
    let safeMessage =
      err?.message && typeof err.message === "string"
        ? err.message
        : "Erro ao processar pagamento. Tente novamente.";
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

  return NextResponse.json(
    { error: "Erro ao processar pagamento" },
    { status: 500 }
  );
}

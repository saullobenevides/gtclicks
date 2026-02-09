import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { createAsaasCheckout } from "@/lib/asaas-checkout";
import { isAsaasConfigured } from "@/lib/asaas";

type CartItemWithFoto = {
  fotoId: string;
  licencaId: string | null;
  licenca: { preco?: unknown } | null;
  foto: {
    titulo: string;
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
  if (
    item.licencaId &&
    item.licenca &&
    "preco" in item.licenca &&
    item.licenca.preco != null
  ) {
    return Number(item.licenca.preco);
  }

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

function getBaseUrl(): string {
  let baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!baseUrl && process.env.VERCEL_URL) {
    baseUrl = `https://${process.env.VERCEL_URL}`;
  }
  if (!baseUrl) baseUrl = "http://localhost:3000";
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

/** Asaas exige successUrl de domínio registrado na conta. localhost não é aceito. */
function isSuccessUrlValidForAsaas(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.hostname === "localhost" || u.hostname === "127.0.0.1") return false;
    if (u.protocol !== "https:") return false;
    return true;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "Autenticação necessária para finalizar compra" },
        { status: 401 }
      );
    }

    if (!isAsaasConfigured()) {
      return NextResponse.json(
        {
          error:
            "Checkout Asaas não configurado. Configure ASAAS_API_KEY nas variáveis de ambiente do Vercel.",
        },
        { status: 503 }
      );
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const body = (await request.json().catch(() => ({}))) as { orderId?: string };
    const existingOrderId = body.orderId;

    let pedido: { id: string; total: number };
    let itemsForPayment: CartItemWithFoto[];

    if (existingOrderId) {
      const order = await prisma.pedido.findUnique({
        where: { id: existingOrderId, userId: user.id },
        include: {
          itens: {
            include: {
              foto: { include: { colecao: true } },
              licenca: true,
            },
          },
        },
      });

      if (!order || order.status === "PAGO") {
        return NextResponse.json(
          { error: "Pedido não encontrado ou já pago" },
          { status: 400 }
        );
      }

      pedido = { id: order.id, total: Number(order.total) };
      itemsForPayment = order.itens.map((i) => ({
        ...i,
        finalPrice: Number(i.precoPago),
      })) as CartItemWithFoto[];
    } else {
      const cart = await prisma.carrinho.findUnique({
        where: { userId: user.id },
        include: {
          itens: {
            include: {
              foto: { include: { colecao: true } },
              licenca: true,
            },
          },
        },
      });

      if (!cart || cart.itens.length === 0) {
        return NextResponse.json(
          { error: "Carrinho vazio" },
          { status: 400 }
        );
      }

      const itemsWithPrice = cart.itens.map((item) => {
        const finalPrice = calculateItemPrice(
          item as CartItemWithFoto,
          cart.itens as CartItemWithFoto[]
        );
        return { ...item, finalPrice } as CartItemWithFoto;
      });

      const total = itemsWithPrice.reduce(
        (sum, item) => sum + (item.finalPrice ?? 0),
        0
      );

      const safeTotal = Math.round(Number(total) * 100) / 100;
      if (!Number.isFinite(safeTotal) || safeTotal <= 0) {
        return NextResponse.json(
          { error: "Valor do pedido inválido" },
          { status: 400 }
        );
      }

      const created = await prisma.pedido.create({
        data: {
          userId: user.id,
          total: safeTotal,
          status: "PENDENTE",
          itens: {
            create: itemsWithPrice.map((item) => ({
              fotoId: item.fotoId,
              licencaId: item.licencaId,
              precoPago: item.finalPrice ?? 0,
            })),
          },
        },
      });
      pedido = { id: created.id, total: Number(created.total) };
      itemsForPayment = itemsWithPrice;
    }

    const baseUrl = getBaseUrl();
    const successUrl = `${baseUrl}/checkout/sucesso?orderId=${pedido.id}&status=paid`;
    const cancelUrl = `${baseUrl}/checkout?canceled=1`;
    const expiredUrl = `${baseUrl}/checkout?expired=1`;

    if (
      !isSuccessUrlValidForAsaas(successUrl) ||
      !isSuccessUrlValidForAsaas(cancelUrl) ||
      !isSuccessUrlValidForAsaas(expiredUrl)
    ) {
      return NextResponse.json(
        {
          error:
            "A URL de retorno do checkout é inválida. O Asaas exige HTTPS e um domínio registrado em Account Settings > Information. Configure NEXT_PUBLIC_APP_URL.",
        },
        { status: 400 }
      );
    }

    const pedidoId = pedido.id;

    const result = await createAsaasCheckout({
      items: itemsForPayment.map((item) => ({
        name: item.foto.titulo || "Foto",
        description:
          item.licenca && "nome" in item.licenca
            ? `Licença: ${(item.licenca as { nome: string }).nome}`
            : "Foto",
        quantity: 1,
        value: item.finalPrice ?? 0,
      })),
      externalReference: pedidoId,
      customerData: {
        name: dbUser.name || "Cliente",
        email: dbUser.email,
      },
      successUrl,
      cancelUrl,
      expiredUrl,
      minutesToExpire: 60,
    });

    if (!result.success) {
      if (!existingOrderId) {
        await prisma.pedido.update({
          where: { id: pedidoId },
          data: { status: "CANCELADO" },
        });
      }
      return NextResponse.json(
        { error: result.error || "Erro ao criar checkout" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      checkoutUrl: result.checkoutUrl,
      orderId: pedidoId,
    });
  } catch (error) {
    console.error("[Asaas create-checkout] Error:", error);
    return NextResponse.json(
      {
        error: "Erro ao processar checkout",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

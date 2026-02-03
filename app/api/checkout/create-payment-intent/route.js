import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { getCheckoutData } from "@/lib/checkout-utils";
import { NextResponse } from "next/server";

/**
 * POST /api/checkout/create-payment-intent
 * Cria pedido (ou usa existente) e PaymentIntent Stripe para Separate Charges and Transfers.
 * Retorna clientSecret para o Payment Element.
 */
export async function POST(request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const orderId =
      typeof body?.orderId === "string" ? body.orderId : undefined;

    const checkoutData = await getCheckoutData(user.id, orderId);
    if (!checkoutData) {
      return NextResponse.json(
        {
          error: orderId
            ? "Pedido não encontrado ou já pago"
            : "Carrinho vazio",
        },
        { status: 400 }
      );
    }

    const { total, finalOrderId } = checkoutData;
    const safeTotal = Math.round(Number(total) * 100) / 100;
    if (!Number.isFinite(safeTotal) || safeTotal <= 0) {
      return NextResponse.json(
        { error: "Valor do pedido inválido" },
        { status: 400 }
      );
    }

    const amountInCents = Math.round(safeTotal * 100);

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (typeof request?.nextUrl?.origin === "string"
        ? request.nextUrl.origin
        : "https://gtclicks.com.br");

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "brl",
      metadata: { order_id: finalOrderId },
      transfer_group: finalOrderId,
      // Cartão, Pix e Boleto — ative Pix/Boleto em dashboard.stripe.com/settings/payment_methods
      payment_method_types: ["card", "boleto", "pix"],
    });

    await prisma.pedido.update({
      where: { id: finalOrderId },
      data: { paymentId: paymentIntent.id },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId: finalOrderId,
      returnUrl: `${baseUrl}/checkout/sucesso?orderId=${finalOrderId}`,
    });
  } catch (error) {
    console.error("[create-payment-intent]", error);
    return NextResponse.json(
      {
        error: error?.message || "Erro ao criar pagamento. Tente novamente.",
      },
      { status: 500 }
    );
  }
}

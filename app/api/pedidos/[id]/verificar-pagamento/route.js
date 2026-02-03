import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { stripe } from "@/lib/stripe";

/**
 * POST /api/pedidos/[id]/verificar-pagamento
 * Verifica status do pagamento. Para Stripe, consulta o PaymentIntent.
 */
export async function POST(request, context) {
  try {
    const { id: pedidoId } = await context.params;
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId },
      include: { itens: true },
    });

    if (!pedido) {
      return NextResponse.json(
        { error: "Pedido não encontrado" },
        { status: 404 }
      );
    }

    if (pedido.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    if (pedido.status === "PAGO") {
      return NextResponse.json({
        status: "PAGO",
        message: "Pedido já está pago.",
      });
    }

    // Stripe: verificar PaymentIntent
    if (pedido.paymentId?.startsWith("pi_")) {
      try {
        const pi = await stripe.paymentIntents.retrieve(pedido.paymentId);
        if (pi.status === "succeeded") {
          await prisma.pedido.update({
            where: { id: pedidoId },
            data: { status: "PAGO" },
          });
          return NextResponse.json({
            status: "PAGO",
            processed: true,
            message: "Pagamento confirmado.",
          });
        }
        return NextResponse.json({
          status: pedido.status,
          message:
            "Pagamento ainda não confirmado. O webhook atualizará automaticamente.",
        });
      } catch (e) {
        console.error("[verificar-pagamento] Stripe:", e);
        return NextResponse.json({
          status: pedido.status,
          message: "Não foi possível verificar o pagamento.",
        });
      }
    }

    return NextResponse.json({
      status: pedido.status,
      message: "Sistema de pagamento migrado para Stripe.",
    });
  } catch (error) {
    console.error("[verificar-pagamento] Error:", error);
    return NextResponse.json(
      { error: "Erro interno ao verificar pagamento" },
      { status: 500 }
    );
  }
}

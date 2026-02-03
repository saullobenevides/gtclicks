import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

/**
 * GET /api/pedidos/[id]/pagamento
 * Retorna detalhes do pagamento. Para Stripe (paymentId pi_*), indica redirecionar ao checkout.
 */
export async function GET(request, context) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id: pedidoId } = await context.params;

    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId },
      select: { id: true, paymentId: true, userId: true, status: true },
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

    if (!pedido.paymentId) {
      return NextResponse.json({
        hasPayment: false,
        status: pedido.status,
        message: "Pagamento ainda não foi iniciado",
      });
    }

    // Stripe: paymentId começa com "pi_"
    if (pedido.paymentId.startsWith("pi_")) {
      return NextResponse.json({
        hasPayment: true,
        paymentMethod: "stripe",
        status: pedido.status,
        redirectToCheckout: true,
        message: "Complete o pagamento na página de checkout",
      });
    }

    return NextResponse.json({
      hasPayment: false,
      status: pedido.status,
      message: "Sistema de pagamento migrado. Acesse o checkout para pagar.",
    });
  } catch (error) {
    console.error("[pagamento] Error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar detalhes do pagamento" },
      { status: 500 }
    );
  }
}

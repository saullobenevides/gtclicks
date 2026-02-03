"use server";

import { getAuthenticatedUser } from "@/lib/auth";

/**
 * Retorna detalhes do pagamento para exibição na página de sucesso.
 * Com Stripe, Pix/boleto são exibidos no checkout; aqui retornamos vazio para pending.
 */
export async function getPaymentDetails(orderId: string) {
  const user = await getAuthenticatedUser();
  if (!user) return { error: "Não autorizado" };

  try {
    const { prisma } = await import("@/lib/prisma");
    const order = await prisma.pedido.findUnique({
      where: { id: orderId },
      select: { id: true, paymentId: true, userId: true, status: true },
    });

    if (!order) return { error: "Pedido não encontrado" };
    if (order.userId !== user.id) return { error: "Sem permissão" };
    if (!order.paymentId) return { error: "Pagamento não iniciado" };

    // Stripe: não temos Pix/boleto separados - o pagamento foi feito no checkout
    if (order.paymentId.startsWith("pi_")) {
      return {
        success: true,
        status: order.status,
        paymentMethod: "stripe",
        pix: null,
        boleto: null,
      };
    }

    return { success: false, error: "Sistema de pagamento migrado" };
  } catch (error) {
    console.error("[getPaymentDetails] Error:", error);
    return { error: "Erro ao buscar detalhes do pagamento" };
  }
}

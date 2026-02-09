import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdminApi, logAdminActivity } from "@/lib/admin/permissions";

/**
 * POST /api/admin/pedidos/[id]/refund
 * Reembolsa um pedido PAGO via Mercado Pago.
 * Idempotência: verifica status antes; webhook MP atualiza o pedido após o reembolso.
 */
export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const { id: pedidoId } = await context.params;

  try {
    const body = (await _request.json()) as { reason?: string } | null;
    const reason = body?.reason ?? "Reembolso solicitado pelo administrador";

    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId },
      select: {
        id: true,
        status: true,
        paymentId: true,
        total: true,
        user: { select: { email: true, name: true } },
      },
    });

    if (!pedido) {
      return NextResponse.json(
        { error: "Pedido não encontrado" },
        { status: 404 }
      );
    }

    if (pedido.status !== "PAGO") {
      return NextResponse.json(
        { error: "Apenas pedidos pagos podem ser reembolsados" },
        { status: 400 }
      );
    }

    if (!pedido.paymentId) {
      return NextResponse.json(
        { error: "Pedido sem paymentId no Mercado Pago" },
        { status: 400 }
      );
    }

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json(
        { error: "Configuração do Mercado Pago indisponível" },
        { status: 500 }
      );
    }

    // Verificar status atual no MP antes de reembolsar (idempotência)
    const statusRes = await fetch(
      `https://api.mercadopago.com/v1/payments/${pedido.paymentId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!statusRes.ok) {
      return NextResponse.json(
        { error: "Não foi possível consultar o pagamento no Mercado Pago" },
        { status: 500 }
      );
    }

    const paymentData = (await statusRes.json()) as { status?: string };
    if (paymentData.status === "refunded" || paymentData.status === "cancelled") {
      return NextResponse.json(
        {
          error: "Este pagamento já foi reembolsado ou cancelado no Mercado Pago",
          status: paymentData.status,
        },
        { status: 400 }
      );
    }

    // Chamar API de reembolso do Mercado Pago (X-Idempotency-Key obrigatório)
    const idempotencyKey = `refund-${pedidoId}`;
    const refundRes = await fetch(
      `https://api.mercadopago.com/v1/payments/${pedido.paymentId}/refunds`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          "X-Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({
          amount: Number(pedido.total),
        }),
      }
    );

    const refundData = (await refundRes.json()) as {
      message?: string;
      cause?: Array<{ code?: string; description?: string }>;
    };

    if (!refundRes.ok) {
      console.error("[Refund] MP Error:", refundData);
      return NextResponse.json(
        {
          error:
            refundData.message ||
            refundData.cause?.[0]?.description ||
            "Falha ao processar reembolso no Mercado Pago",
        },
        { status: 400 }
      );
    }

    await logAdminActivity(
      auth.admin.id,
      "REFUND_ISSUED",
      "Pedido",
      pedidoId,
      {
        paymentId: pedido.paymentId,
        total: Number(pedido.total),
        reason: reason.slice(0, 200),
      }
    );

    return NextResponse.json({
      success: true,
      message:
        "Reembolso solicitado. O webhook do Mercado Pago atualizará o pedido em instantes.",
    });
  } catch (error) {
    console.error("[Refund] Error:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar reembolso" },
      { status: 500 }
    );
  }
}

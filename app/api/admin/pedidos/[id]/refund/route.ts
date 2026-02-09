import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdminApi, logAdminActivity } from "@/lib/admin/permissions";
import { isAsaasConfigured } from "@/lib/asaas";

const ASAAS_API_BASE = "https://api.asaas.com";

/** ID do Asaas (checkout/payment) é UUID. MP usa numérico. */
function looksLikeAsaasId(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    id
  );
}

/**
 * POST /api/admin/pedidos/[id]/refund
 * Reembolsa um pedido PAGO via Asaas ou Mercado Pago (conforme paymentId).
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
        { error: "Pedido sem ID de pagamento no gateway" },
        { status: 400 }
      );
    }

    const paymentId = String(pedido.paymentId);
    const useAsaas = looksLikeAsaasId(paymentId) && isAsaasConfigured();
    const useMp =
      !useAsaas &&
      /^\d+$/.test(paymentId) &&
      Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN);

    if (useAsaas) {
      const apiKey = process.env.ASAAS_API_KEY;
      if (!apiKey) {
        return NextResponse.json(
          { error: "Asaas não configurado para reembolso" },
          { status: 500 }
        );
      }
      const refundRes = await fetch(
        `${ASAAS_API_BASE}/v3/payments/${paymentId}/refund`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            access_token: apiKey,
          },
          body: JSON.stringify({
            value: Number(pedido.total),
            description: reason.slice(0, 200),
          }),
        }
      );
      const refundData = (await refundRes.json().catch(() => ({}))) as {
        errors?: Array<{ description?: string }>;
        error?: string;
      };
      if (!refundRes.ok) {
        console.error("[Refund] Asaas Error:", refundData);
        return NextResponse.json(
          {
            error:
              refundData.errors?.[0]?.description ||
              refundData.error ||
              "Falha ao processar reembolso no Asaas",
          },
          { status: 400 }
        );
      }
      await logAdminActivity(
        auth.admin.id,
        "REFUND_ISSUED",
        "Pedido",
        pedidoId,
        { paymentId, total: Number(pedido.total), reason: reason.slice(0, 200) }
      );
      return NextResponse.json({
        success: true,
        message: "Reembolso solicitado no Asaas. O pedido será atualizado.",
      });
    }

    if (useMp) {
      const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN!;
      const statusRes = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (!statusRes.ok) {
        return NextResponse.json(
          { error: "Não foi possível consultar o pagamento no Mercado Pago" },
          { status: 500 }
        );
      }
      const paymentData = (await statusRes.json()) as { status?: string };
      if (
        paymentData.status === "refunded" ||
        paymentData.status === "cancelled"
      ) {
        return NextResponse.json(
          {
            error:
              "Este pagamento já foi reembolsado ou cancelado no Mercado Pago",
            status: paymentData.status,
          },
          { status: 400 }
        );
      }
      const idempotencyKey = `refund-${pedidoId}`;
      const refundRes = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}/refunds`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            "X-Idempotency-Key": idempotencyKey,
          },
          body: JSON.stringify({ amount: Number(pedido.total) }),
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
          paymentId,
          total: Number(pedido.total),
          reason: reason.slice(0, 200),
        }
      );
      return NextResponse.json({
        success: true,
        message:
          "Reembolso solicitado. O webhook do Mercado Pago atualizará o pedido em instantes.",
      });
    }

    return NextResponse.json(
      {
        error:
          "Reembolso não disponível: gateway não identificado ou não configurado (Asaas ou Mercado Pago).",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("[Refund] Error:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar reembolso" },
      { status: 500 }
    );
  }
}

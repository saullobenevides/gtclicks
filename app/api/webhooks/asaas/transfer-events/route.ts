import { NextResponse } from "next/server";
import { revertPendenteSaqueOnTransferRefused } from "@/lib/payouts";

const DESCRIPTION_PREFIX = "Saque GT Clicks - ";

/**
 * Webhook para eventos de transferência do Asaas (TRANSFER_FAILED, TRANSFER_CANCELLED).
 * Quando a transferência falha ou é cancelada (ex.: autorização recusada, webhook inacessível),
 * devolvemos o valor ao fotógrafo (bloqueado → disponível) e marcamos o saque como FALHOU.
 *
 * No Asaas: Integrações > Webhooks > ative "Transferências" e use esta URL.
 * URL: {APP_URL}/api/webhooks/asaas/transfer-events
 *
 * Docs: https://docs.asaas.com/docs/webhook-para-transferencias
 */
export async function POST(request: Request) {
  try {
    const expectedToken =
      process.env.ASAAS_WEBHOOK_TRANSFER_TOKEN ||
      process.env.ASAAS_WEBHOOK_TOKEN;
    if (expectedToken?.trim()) {
      const received = request.headers.get("asaas-access-token");
      if (received !== expectedToken) {
        console.warn("[Asaas transfer-events] Token inválido");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const body = (await request.json().catch(() => null)) as {
      event?: string;
      transfer?: {
        id?: string;
        status?: string;
        description?: string | null;
        failReason?: string | null;
      };
    } | null;

    if (!body?.transfer) {
      return NextResponse.json({ received: true });
    }

    const { event, transfer } = body;
    if (event !== "TRANSFER_FAILED" && event !== "TRANSFER_CANCELLED") {
      return NextResponse.json({ received: true });
    }

    const description =
      typeof transfer.description === "string"
        ? transfer.description.trim()
        : "";
    if (!description.startsWith(DESCRIPTION_PREFIX)) {
      return NextResponse.json({ received: true });
    }

    const saqueId = description.slice(DESCRIPTION_PREFIX.length).trim();
    if (!saqueId) {
      return NextResponse.json({ received: true });
    }

    const reason =
      event === "TRANSFER_FAILED"
        ? `Transferência PIX falhou no Asaas. ${transfer.failReason || ""}`.trim()
        : "Transferência PIX cancelada no Asaas. Valor devolvido ao saldo.";

    console.log(
      `[Asaas transfer-events] ${event} transferId=${transfer.id} saqueId=${saqueId}`
    );

    await revertPendenteSaqueOnTransferRefused(saqueId, reason);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Asaas transfer-events] Error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

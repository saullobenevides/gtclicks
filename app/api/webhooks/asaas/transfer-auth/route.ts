import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  revertPendenteSaqueOnTransferRefused,
  markSaqueAsProcessedAfterTransferApproved,
} from "@/lib/payouts";

const DESCRIPTION_PREFIX = "Saque GT Clicks - ";

/**
 * Webhook de autorização de saque do Asaas.
 * Quando ativado em Asaas (Integrações > Mecanismos de segurança), todas as
 * transferências criadas via API disparam um POST aqui. Respondemos APPROVED
 * para as que forem saques nossos (description "Saque GT Clicks - {saqueId}").
 * Assim o saque é aprovado automaticamente, sem SMS no painel Asaas.
 *
 * Docs: https://docs.asaas.com/docs/mecanismo-para-validacao-de-saque-via-webhooks
 */
function logTransferAuth(
  event: "received" | "approved" | "refused",
  payload: { transferId?: string; saqueId?: string; reason?: string; value?: number }
) {
  console.log(
    `[Asaas transfer-auth] ${event}`,
    JSON.stringify(payload)
  );
}

export async function POST(request: Request) {
  try {
    const expectedToken = process.env.ASAAS_WEBHOOK_TRANSFER_TOKEN;
    if (expectedToken?.trim()) {
      const received = request.headers.get("asaas-access-token");
      if (received !== expectedToken) {
        logTransferAuth("refused", { reason: "Token inválido" });
        return NextResponse.json(
          { status: "REFUSED", refuseReason: "Token inválido" },
          { status: 200 }
        );
      }
    }

    const body = (await request.json().catch(() => null)) as {
      type?: string;
      transfer?: {
        id?: string;
        status?: string;
        value?: number;
        description?: string | null;
      };
    } | null;

    if (!body || body.type !== "TRANSFER" || !body.transfer) {
      logTransferAuth("refused", { reason: "Payload inválido ou tipo não é TRANSFER" });
      return NextResponse.json(
        { status: "REFUSED", refuseReason: "Payload inválido ou tipo não é TRANSFER" },
        { status: 200 }
      );
    }

    const { transfer } = body;
    if (transfer.status !== "PENDING") {
      logTransferAuth("approved", {
        transferId: transfer.id,
        reason: `Status não é PENDING (${transfer.status}), aprovando mesmo assim`,
      });
      return NextResponse.json(
        { status: "APPROVED" },
        { status: 200 }
      );
    }

    const description =
      typeof transfer.description === "string" ? transfer.description.trim() : "";
    if (!description.startsWith(DESCRIPTION_PREFIX)) {
      logTransferAuth("refused", {
        transferId: transfer.id,
        reason: "Transferência não reconhecida (description sem prefixo GT Clicks)",
      });
      return NextResponse.json(
        { status: "REFUSED", refuseReason: "Transferência não reconhecida" },
        { status: 200 }
      );
    }

    const saqueId = description.slice(DESCRIPTION_PREFIX.length).trim();
    if (!saqueId) {
      logTransferAuth("refused", { transferId: transfer.id, reason: "ID do saque ausente" });
      return NextResponse.json(
        { status: "REFUSED", refuseReason: "ID do saque ausente" },
        { status: 200 }
      );
    }

    logTransferAuth("received", {
      transferId: transfer.id,
      saqueId,
      value: transfer.value,
    });

    const saque = await prisma.solicitacaoSaque.findUnique({
      where: { id: saqueId },
    });

    if (!saque) {
      logTransferAuth("refused", { transferId: transfer.id, saqueId, reason: "Saque não encontrado no banco" });
      await revertPendenteSaqueOnTransferRefused(
        saqueId,
        "Autorização recusada: saque não encontrado. Valor devolvido ao saldo."
      );
      return NextResponse.json(
        { status: "REFUSED", refuseReason: "Saque não encontrado" },
        { status: 200 }
      );
    }

    if (saque.status !== "PENDENTE") {
      logTransferAuth("refused", {
        transferId: transfer.id,
        saqueId,
        reason: `Saque já processado (status=${saque.status})`,
      });
      await revertPendenteSaqueOnTransferRefused(
        saqueId,
        "Autorização recusada: saque já processado."
      );
      return NextResponse.json(
        { status: "REFUSED", refuseReason: "Saque já processado" },
        { status: 200 }
      );
    }

    const transferValue = Number(transfer.value);
    const saqueValue = Number(saque.valor);
    if (!Number.isFinite(transferValue) || transferValue <= 0) {
      logTransferAuth("refused", {
        transferId: transfer.id,
        saqueId,
        reason: "Valor da transferência inválido",
      });
      await revertPendenteSaqueOnTransferRefused(
        saqueId,
        "Autorização recusada: valor da transferência inválido. Valor devolvido ao saldo."
      );
      return NextResponse.json(
        { status: "REFUSED", refuseReason: "Valor da transferência inválido" },
        { status: 200 }
      );
    }

    if (Math.abs(transferValue - saqueValue) > 0.01) {
      logTransferAuth("refused", {
        transferId: transfer.id,
        saqueId,
        reason: `Valor não confere: transfer=${transferValue} saque=${saqueValue}`,
      });
      await revertPendenteSaqueOnTransferRefused(
        saqueId,
        "Autorização recusada: valor não confere com o saque. Valor devolvido ao saldo."
      );
      return NextResponse.json(
        { status: "REFUSED", refuseReason: "Valor não confere com o saque" },
        { status: 200 }
      );
    }

    logTransferAuth("approved", { transferId: transfer.id, saqueId });
    await markSaqueAsProcessedAfterTransferApproved(saqueId);
    return NextResponse.json({ status: "APPROVED" }, { status: 200 });
  } catch (error) {
    console.error("[Asaas transfer-auth] Error:", error);
    return NextResponse.json(
      { status: "REFUSED", refuseReason: "Erro interno" },
      { status: 200 }
    );
  }
}

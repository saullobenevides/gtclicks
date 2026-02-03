import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { stripe } from "@/lib/stripe";

/**
 * POST /api/fotografos/stripe-connect/process-pending-transfers
 * Processa repasses pendentes quando o fotógrafo acabou de configurar o Stripe.
 */
export async function POST() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const fotografo = await prisma.fotografo.findUnique({
      where: { userId: user.id },
    });

    if (!fotografo) {
      return NextResponse.json(
        { error: "Perfil de fotógrafo não encontrado" },
        { status: 404 }
      );
    }

    if (!fotografo.stripeAccountId || !fotografo.stripeOnboarded) {
      return NextResponse.json(
        { error: "Configure sua conta Stripe primeiro" },
        { status: 400 }
      );
    }

    const pending = await prisma.pendingTransfer.findMany({
      where: {
        fotografoId: fotografo.id,
        processedAt: null,
      },
      orderBy: { createdAt: "asc" },
    });

    if (pending.length === 0) {
      return NextResponse.json({
        success: true,
        processed: 0,
        message: "Nenhum repasse pendente",
      });
    }

    let processed = 0;
    const errors = [];

    for (const pt of pending) {
      try {
        const transfer = await stripe.transfers.create({
          amount: pt.amountCents,
          currency: "brl",
          destination: fotografo.stripeAccountId,
          source_transaction: pt.chargeId,
          transfer_group: pt.orderId,
          description: pt.descricao || `GTClicks - Repasse pendente`,
        });

        await prisma.pendingTransfer.update({
          where: { id: pt.id },
          data: {
            processedAt: new Date(),
            stripeTransferId: transfer.id,
          },
        });
        processed++;
      } catch (err) {
        console.error(`[process-pending] Transfer failed for ${pt.id}:`, err);
        errors.push({ id: pt.id, error: err.message });
      }
    }

    return NextResponse.json({
      success: true,
      processed,
      total: pending.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("[process-pending-transfers]", error);
    return NextResponse.json(
      { error: error?.message || "Erro ao processar repasses" },
      { status: 500 }
    );
  }
}

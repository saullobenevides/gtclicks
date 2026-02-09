import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { sendOrderConfirmationEmail } from "@/lib/mail";
import { logError, logInfo, logWarn } from "@/lib/logger";

interface AsaasWebhookBody {
  event?: string;
  payment?: {
    id?: string;
    externalReference?: string;
    status?: string;
    [key: string]: unknown;
  };
}

export async function POST(request: Request) {
  try {
    const webhookToken = process.env.ASAAS_WEBHOOK_TOKEN;
    if (webhookToken) {
      const token = request.headers.get("asaas-access-token");
      if (token !== webhookToken) {
        logWarn("Asaas webhook: token inválido", "Webhook Asaas");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const body = (await request.json()) as AsaasWebhookBody;

    const event = body.event;
    const payment = body.payment;

    if (!event || !payment) {
      return NextResponse.json({ received: true });
    }

    const eventsToProcess = ["PAYMENT_RECEIVED", "PAYMENT_CONFIRMED"];
    if (!eventsToProcess.includes(event)) {
      return NextResponse.json({ received: true });
    }

    const pedidoId = payment.externalReference as string | undefined;
    const paymentId = payment.id as string | undefined;

    if (!pedidoId) {
      logWarn(
        `Asaas webhook ${event}: payment without externalReference`,
        "Webhook Asaas"
      );
      return NextResponse.json({ received: true });
    }

    logInfo(
      `Payment ${paymentId} event: ${event} for order ${pedidoId}`,
      "Webhook Asaas"
    );

    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId },
      include: {
        itens: { include: { foto: true } },
        user: true,
      },
    });

    if (!pedido) {
      logError(new Error(`Order ${pedidoId} not found`), "Webhook Asaas");
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const updateResult = await tx.pedido.updateMany({
        where: {
          id: pedidoId,
          status: { not: "PAGO" },
        },
        data: {
          status: "PAGO",
          paymentId: paymentId ?? undefined,
        },
      });

      if (updateResult.count === 0) {
        return { processed: false, reason: "ALREADY_PROCESSED" };
      }

      const items = await tx.itemPedido.findMany({
        where: { pedidoId },
        include: {
          foto: {
            include: {
              fotografo: {
                include: { user: { select: { id: true } } },
              },
            },
          },
        },
      });

      const { getConfigNumber, CONFIG_KEYS } = await import("@/lib/config");
      const taxaPlataformaPct = await getConfigNumber(
        CONFIG_KEYS.TAXA_PLATAFORMA
      );
      const photographerShare = new Prisma.Decimal(1).sub(
        new Prisma.Decimal(taxaPlataformaPct).div(100)
      );

      for (const item of items) {
        const fotografoId = item.foto.fotografoId;
        const precoPago = new Prisma.Decimal(item.precoPago);
        const valorFotografo = precoPago.mul(photographerShare);

        await tx.saldo.upsert({
          where: { fotografoId },
          create: {
            fotografoId,
            disponivel: valorFotografo,
            bloqueado: 0,
          },
          update: {
            disponivel: { increment: valorFotografo },
          },
        });

        await tx.transacao.create({
          data: {
            fotografoId,
            tipo: "VENDA",
            valor: valorFotografo,
            descricao: `Venda de foto: ${item.foto.titulo}`,
          },
        });

        await tx.foto.update({
          where: { id: item.fotoId },
          data: { vendas: { increment: 1 } },
        });

        if (item.foto.colecaoId) {
          await tx.colecao.update({
            where: { id: item.foto.colecaoId },
            data: { vendas: { increment: 1 } },
          });
        }

        try {
          const { notifyPhotographerSale } = await import(
            "@/actions/notifications"
          );
          await notifyPhotographerSale({
            fotografoUserId: item.foto.fotografo.user.id,
            photoTitle: item.foto.titulo,
            value: Number(valorFotografo),
            orderId: pedidoId,
          });
        } catch (nErr) {
          logError(nErr as Error, "Webhook Asaas photographer notification");
        }

        logInfo(
          `💰 Fotógrafo ${fotografoId} creditado: R$ ${valorFotografo.toString()}`,
          "Webhook Asaas"
        );
      }

      try {
        const { notifyOrderApproved } = await import(
          "@/actions/notifications"
        );
        await notifyOrderApproved({
          userId: pedido.userId,
          orderId: pedidoId,
        });
      } catch (nErr) {
        logError(nErr as Error, "Webhook Asaas order approval notification");
      }

      try {
        const emailItems = items.map((item) => ({
          titulo: item.foto.titulo,
          previewUrl: item.foto.previewUrl,
          downloadToken: item.downloadToken,
          width: item.foto.width,
          height: item.foto.height,
          tamanhoBytes: item.foto.tamanhoBytes,
        }));

        await sendOrderConfirmationEmail({
          email: pedido.user.email,
          orderId: pedidoId,
          items: emailItems,
          total: pedido.total,
        });
        logInfo(
          `Confirmation email sent for order ${pedidoId}`,
          "Webhook Asaas"
        );
      } catch (eErr) {
        logError(eErr as Error, "Webhook Asaas order confirmation email");
      }

      return { processed: true };
    });

    if (!result.processed) {
      logInfo(
        `Order ${pedidoId} was already processed.`,
        "Webhook Asaas"
      );
      return NextResponse.json({
        received: true,
        message: "Already processed",
      });
    }

    logInfo(`Order ${pedidoId} successfully processed and paid.`, "Webhook Asaas");

    return NextResponse.json({ received: true });
  } catch (error) {
    logError(
      error instanceof Error ? error : new Error(String(error)),
      "Webhook Asaas"
    );
    return NextResponse.json(
      {
        error: "Webhook processing failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: "ok", provider: "asaas" });
}

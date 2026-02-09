import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { sendOrderConfirmationEmail } from "@/lib/mail";
import { validateWebhookSignature } from "@/lib/mercadopago-webhook";
import { logError, logWarn, logInfo } from "@/lib/logger";

interface WebhookBody {
  type?: string;
  topic?: string;
  data?: { id?: string | number };
  resource?: string;
}

export async function POST(request: Request) {
  try {
    const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
    if (!webhookSecret) {
      logError(
        new Error("MERCADOPAGO_WEBHOOK_SECRET not configured"),
        "Webhook MP"
      );
      return NextResponse.json(
        { error: "Webhook not configured" },
        { status: 503 }
      );
    }

    const body = (await request.json()) as WebhookBody;

    const dataId =
      body.data?.id ?? (body.type === "payment" ? body.data?.id : null);
    if (dataId != null) {
      const headers = request.headers;
      const xSignature = headers?.get?.("x-signature") ?? null;
      const xRequestId = headers?.get?.("x-request-id") ?? "";
      const result = validateWebhookSignature({
        xSignature: xSignature ?? "",
        xRequestId: xRequestId ?? "",
        dataId: String(dataId),
        secret: webhookSecret,
      });
      if (!result.valid) {
        logWarn(
          `Assinatura inválida: ${result.reason} (data.id=${dataId})`,
          "Webhook MP"
        );
        return NextResponse.json(
          { error: "Invalid signature", reason: result.reason },
          { status: 401 }
        );
      }
    }

    let paymentId: string | null = null;

    if (body.type === "payment" && body.data?.id != null) {
      paymentId = String(body.data.id);
    } else if (body.topic === "payment" && body.resource) {
      const resource = body.resource;
      paymentId =
        typeof resource === "string" && resource.includes("/")
          ? resource.split("/").pop() ?? null
          : String(resource);
    }

    if (!paymentId) {
      return NextResponse.json({ received: true });
    }

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

    const paymentResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!paymentResponse.ok) {
      logError(new Error(`Failed to fetch payment ${paymentId}`), "Webhook MP");
      return NextResponse.json(
        { error: "Failed to fetch payment" },
        { status: 500 }
      );
    }

    const payment = (await paymentResponse.json()) as {
      status: string;
      external_reference?: string;
    };
    const pedidoId = payment.external_reference;

    logInfo(
      `Payment ${paymentId} status: ${payment.status} for order ${pedidoId}`,
      "Webhook MP"
    );

    if (payment.status === "approved" && pedidoId) {
      const pedido = await prisma.pedido.findUnique({
        where: { id: pedidoId },
        include: {
          itens: { include: { foto: true } },
          user: true,
        },
      });

      if (!pedido) {
        logError(new Error(`Order ${pedidoId} not found`), "Webhook MP");
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
            paymentId: paymentId!,
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
            logError(nErr as Error, "Webhook MP photographer notification");
          }

          logInfo(
            `💰 Fotógrafo ${fotografoId} creditado: R$ ${valorFotografo.toString()}`
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
          logError(nErr as Error, "Webhook MP order approval notification");
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
            "Webhook MP"
          );
        } catch (eErr) {
          logError(eErr as Error, "Webhook MP order confirmation email");
        }

        return { processed: true };
      });

      if (!result.processed) {
        logInfo(
          `Order ${pedidoId} was already processed (Atomic Check).`,
          "Webhook MP"
        );
        return NextResponse.json({
          received: true,
          message: "Already processed",
        });
      }

      logInfo(
        `Order ${pedidoId} successfully processed and paid.`,
        "Webhook MP"
      );
    } else if (
      (payment.status === "rejected" || payment.status === "cancelled") &&
      pedidoId
    ) {
      await prisma.pedido.update({
        where: { id: pedidoId },
        data: { status: "CANCELADO" },
      });
      logInfo(
        `Order ${pedidoId} marked as CANCELADO (Payment Rejected/Cancelled)`,
        "Webhook MP"
      );
    } else if (
      (payment.status === "refunded" || payment.status === "charged_back") &&
      pedidoId
    ) {
      logWarn(
        `Payment ${paymentId} was REFUNDED/CHARGED_BACK. Reversing funds...`,
        "Webhook MP"
      );

      const pedido = await prisma.pedido.findUnique({
        where: { id: pedidoId },
        include: { itens: { include: { foto: true } } },
      });

      if (!pedido) {
        logError(
          new Error(`Order ${pedidoId} not found during refund`),
          "Webhook MP"
        );
        return NextResponse.json({ received: true });
      }

      await prisma.$transaction(async (tx) => {
        await tx.pedido.update({
          where: { id: pedidoId },
          data: { status: "CANCELADO" },
        });

        for (const item of pedido.itens) {
          const fotografoId = item.foto.fotografoId;

          const { getConfigNumber, CONFIG_KEYS } = await import("@/lib/config");
          const taxaPlataformaPct = await getConfigNumber(
            CONFIG_KEYS.TAXA_PLATAFORMA
          );
          const photographerShare = new Prisma.Decimal(1).sub(
            new Prisma.Decimal(taxaPlataformaPct).div(100)
          );

          const precoPago = new Prisma.Decimal(item.precoPago);
          const valorEstorno = precoPago.mul(photographerShare);

          await tx.transacao.create({
            data: {
              fotografoId,
              tipo: "ESTORNO",
              valor: valorEstorno.negated(),
              descricao: `Estorno de venda: ${item.foto.titulo} (Pedido ${pedidoId})`,
              status: "PROCESSADO",
            },
          });

          await tx.saldo.update({
            where: { fotografoId },
            data: {
              disponivel: { decrement: valorEstorno },
            },
          });

          logInfo(
            `Estorno aplicado para fotógrafo ${fotografoId}: -R$ ${valorEstorno}`,
            "Webhook MP"
          );
        }
      });

      logInfo(`Order ${pedidoId} fully refunded in DB.`, "Webhook MP");
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logError(
      error instanceof Error ? error : new Error(String(error)),
      "Webhook MP"
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
  return NextResponse.json({ status: "ok" });
}

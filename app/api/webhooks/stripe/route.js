import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { Prisma } from "@prisma/client";
import { getConfigNumber, CONFIG_KEYS } from "@/lib/config";
import { sendOrderConfirmationEmail } from "@/lib/mail";
import { logError, logInfo, logWarn } from "@/lib/logger";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!webhookSecret || !signature) {
      logWarn(
        "Stripe webhook: STRIPE_WEBHOOK_SECRET ou assinatura ausente",
        "Webhook Stripe"
      );
      return NextResponse.json(
        { error: "Webhook not configured" },
        { status: 400 }
      );
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      logWarn(
        `Stripe webhook signature invalid: ${err.message}`,
        "Webhook Stripe"
      );
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata?.order_id;
      const chargeId = paymentIntent.latest_charge;

      if (!orderId) {
        logWarn(
          "payment_intent.succeeded sem order_id em metadata",
          "Webhook Stripe"
        );
        return NextResponse.json({ received: true });
      }

      const pedido = await prisma.pedido.findUnique({
        where: { id: orderId },
        include: {
          itens: {
            include: {
              foto: {
                include: {
                  fotografo: true,
                  colecao: true,
                },
              },
              licenca: true,
            },
          },
          user: true,
        },
      });

      if (!pedido) {
        logError(new Error(`Order ${orderId} not found`), "Webhook Stripe");
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      const updateResult = await prisma.pedido.updateMany({
        where: { id: orderId, status: { not: "PAGO" } },
        data: { status: "PAGO", paymentId: paymentIntent.id },
      });

      if (updateResult.count === 0) {
        logInfo(`Order ${orderId} already processed`, "Webhook Stripe");
        return NextResponse.json({
          received: true,
          message: "Already processed",
        });
      }

      const taxaPlataformaPct = await getConfigNumber(
        CONFIG_KEYS.TAXA_PLATAFORMA
      );
      const photographerShare = new Prisma.Decimal(1).sub(
        new Prisma.Decimal(taxaPlataformaPct).div(100)
      );

      for (const item of pedido.itens) {
        const fotografo = item.foto.fotografo;
        const precoPago = new Prisma.Decimal(item.precoPago);
        const valorFotografo = precoPago.mul(photographerShare);
        const amountCents = Math.round(Number(valorFotografo) * 100);

        if (
          fotografo.stripeAccountId &&
          fotografo.stripeOnboarded &&
          amountCents > 0
        ) {
          try {
            await stripe.transfers.create({
              amount: amountCents,
              currency: "brl",
              destination: fotografo.stripeAccountId,
              source_transaction: chargeId,
              transfer_group: orderId,
              description: `GTClicks - Venda: ${item.foto.titulo}`,
            });
            logInfo(
              `Transfer R$ ${valorFotografo} → ${fotografo.stripeAccountId} (${item.foto.titulo})`,
              "Webhook Stripe"
            );
          } catch (trErr) {
            logError(trErr, "Webhook Stripe Transfer");
          }
        } else if (amountCents > 0 && chargeId) {
          // Fotógrafo sem Stripe: salva na fila para repasse quando configurar
          try {
            await prisma.pendingTransfer.create({
              data: {
                fotografoId: fotografo.id,
                amountCents,
                chargeId,
                orderId,
                itemPedidoId: item.id,
                descricao: `Venda: ${item.foto.titulo}`,
              },
            });
            logInfo(
              `PendingTransfer R$ ${valorFotografo} → fotógrafo ${fotografo.id} (sem Stripe)`,
              "Webhook Stripe"
            );
          } catch (ptErr) {
            logError(ptErr, "Webhook Stripe PendingTransfer");
          }
        }

        await prisma.saldo.upsert({
          where: { fotografoId: fotografo.id },
          create: {
            fotografoId: fotografo.id,
            disponivel: valorFotografo,
            bloqueado: 0,
          },
          update: {
            disponivel: { increment: valorFotografo },
          },
        });

        await prisma.transacao.create({
          data: {
            fotografoId: fotografo.id,
            tipo: "VENDA",
            valor: valorFotografo,
            descricao: `Venda de foto: ${item.foto.titulo}`,
          },
        });

        await prisma.foto.update({
          where: { id: item.fotoId },
          data: { vendas: { increment: 1 } },
        });

        if (item.foto.colecaoId) {
          await prisma.colecao.update({
            where: { id: item.foto.colecaoId },
            data: { vendas: { increment: 1 } },
          });
        }

        try {
          const { notifyPhotographerSale } = await import(
            "@/actions/notifications"
          );
          await notifyPhotographerSale({
            fotografoUserId: fotografo.userId,
            photoTitle: item.foto.titulo,
            value: Number(valorFotografo),
            orderId,
          });
        } catch (nErr) {
          logError(nErr, "Webhook Stripe photographer notification");
        }
      }

      try {
        const { notifyOrderApproved } = await import("@/actions/notifications");
        await notifyOrderApproved({
          userId: pedido.userId,
          orderId,
        });
      } catch (nErr) {
        logError(nErr, "Webhook Stripe order notification");
      }

      try {
        const emailItems = pedido.itens.map((item) => ({
          titulo: item.foto.titulo,
          previewUrl: item.foto.previewUrl,
          downloadToken: item.downloadToken,
          width: item.foto.width,
          height: item.foto.height,
          tamanhoBytes: item.foto.tamanhoBytes,
        }));
        await sendOrderConfirmationEmail({
          email: pedido.user.email,
          orderId,
          items: emailItems,
          total: pedido.total,
        });
      } catch (eErr) {
        logError(eErr, "Webhook Stripe email");
      }

      logInfo(`Order ${orderId} processed successfully`, "Webhook Stripe");
    } else if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata?.order_id;
      if (orderId) {
        await prisma.pedido.update({
          where: { id: orderId },
          data: { status: "CANCELADO" },
        });
        logInfo(
          `Order ${orderId} marked CANCELADO (payment failed)`,
          "Webhook Stripe"
        );
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logError(error, "Webhook Stripe");
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

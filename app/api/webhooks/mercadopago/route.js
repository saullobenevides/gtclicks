import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { sendOrderConfirmationEmail } from "@/lib/mail";
import { validateWebhookSignature } from "@/lib/mercadopago-webhook";
import { logError, logWarn, logInfo } from "@/lib/logger";

export async function POST(request) {
  try {
    const body = await request.json();

    // Validação de assinatura (quando MERCADOPAGO_WEBHOOK_SECRET configurado)
    const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
    if (webhookSecret) {
      const dataId =
        body.data?.id ?? (body.type === "payment" ? body.data?.id : null);
      if (dataId) {
        const headers = request.headers;
        const xSignature = headers?.get?.("x-signature") ?? null;
        const xRequestId = headers?.get?.("x-request-id") ?? "";
        const result = validateWebhookSignature({
          xSignature,
          xRequestId,
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
    }

    // Mercado Pago sends notifications for different events
    // We filter for "payment" type or "payment.updated" action (depending on API version, but 'payment' is safer)
    // The notification structure usually has `type` or `topic`

    let paymentId = null;

    if (body.type === "payment") {
      paymentId = body.data.id;
    } else if (body.topic === "payment") {
      // Legacy or specific topic
      paymentId = body.resource; // Usually the resource URL or ID
      if (
        paymentId &&
        typeof paymentId === "string" &&
        paymentId.includes("/")
      ) {
        paymentId = paymentId.split("/").pop();
      }
    }

    if (!paymentId) {
      // If it's just a test ping or unrelated event, we acknowledge it
      return NextResponse.json({ received: true });
    }

    // Fetch payment details from Mercado Pago
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

    const payment = await paymentResponse.json();
    const pedidoId = payment.external_reference;

    logInfo(
      `Payment ${paymentId} status: ${payment.status} for order ${pedidoId}`,
      "Webhook MP"
    );

    if (payment.status === "approved") {
      // 1. Verify if order exists and is not already paid
      const pedido = await prisma.pedido.findUnique({
        where: { id: pedidoId },
        include: {
          itens: {
            include: {
              foto: true,
            },
          },
          user: true,
        },
      });

      if (!pedido) {
        logError(new Error(`Order ${pedidoId} not found`), "Webhook MP");
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      // 2. Transaction: Update Order Status + Distribute Funds
      const result = await prisma.$transaction(async (tx) => {
        // Atomic Transition: Only update if status is NOT already 'PAGO' (or specifically 'PENDENTE')
        // This acts as a lock. If count is 0, it means another request likely beat us to it.
        const updateResult = await tx.pedido.updateMany({
          where: {
            id: pedidoId,
            status: { not: "PAGO" }, // Idempotency Key
          },
          data: {
            status: "PAGO",
            paymentId: paymentId.toString(),
          },
        });

        if (updateResult.count === 0) {
          // Already paid or doesn't exist (previously checked existance, so likely race condition occurred)
          return { processed: false, reason: "ALREADY_PROCESSED" };
        }

        // Fetch items with photographer details to calculate commissions
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

        // Fetch platform fee from config
        const { getConfigNumber, CONFIG_KEYS } = await import("@/lib/config");
        const taxaPlataformaPct = await getConfigNumber(
          CONFIG_KEYS.TAXA_PLATAFORMA
        );
        // Photographer gets (100 - fee)%
        const photographerShare = new Prisma.Decimal(1).sub(
          new Prisma.Decimal(taxaPlataformaPct).div(100)
        );

        for (const item of items) {
          const fotografoId = item.foto.fotografoId;

          // Using Prisma.Decimal for precise calculation
          const precoPago = new Prisma.Decimal(item.precoPago);
          const valorFotografo = precoPago.mul(photographerShare);

          // Ensure photographer has a balance record
          // Note: using upsert inside transaction
          await tx.saldo.upsert({
            where: { fotografoId },
            create: {
              fotografoId,
              disponivel: valorFotografo,
              bloqueado: 0,
            },
            update: {
              disponivel: {
                increment: valorFotografo,
              },
            },
          });

          // Create transaction record for photographer earnings
          await tx.transacao.create({
            data: {
              fotografoId,
              tipo: "VENDA",
              valor: valorFotografo,
              descricao: `Venda de foto: ${item.foto.titulo}`,
            },
          });

          // --- STATS: Increment Sales counts ---
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

          // --- NOTIFICATION: Photo Sold ---
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
            logError(nErr, "Webhook MP photographer notification");
          }

          logInfo(
            `💰 Fotógrafo ${fotografoId} creditado: R$ ${valorFotografo.toString()}`
          );
        }

        // --- NOTIFICATION: Order Approved ---
        try {
          const { notifyOrderApproved } = await import(
            "@/actions/notifications"
          );
          await notifyOrderApproved({
            userId: pedido.userId,
            orderId: pedidoId,
          });
        } catch (nErr) {
          logError(nErr, "Webhook MP order approval notification");
        }

        // --- EMAIL NOTIFICATION: Order Confirmation with Links ---
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
            `Confirmation email sent to ${pedido.user.email} for order ${pedidoId}`,
            "Webhook MP"
          );
        } catch (eErr) {
          logError(eErr, "Webhook MP order confirmation email");
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
      payment.status === "rejected" ||
      payment.status === "cancelled"
    ) {
      await prisma.pedido.update({
        where: { id: pedidoId },
        data: {
          status: "CANCELADO",
        },
      });
      logInfo(
        `Order ${pedidoId} marked as CANCELADO (Payment Rejected/Cancelled)`,
        "Webhook MP"
      );
    } else if (
      payment.status === "refunded" ||
      payment.status === "charged_back"
    ) {
      // --- SECURITY FIX: Handle Refunds/Chargebacks ---
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

      // If already cancelled, ignore (idempotency)
      // Note: 'DEVOLVIDO' status would be better, but 'CANCELADO' works for now if we don't have enum
      // Assuming enum allows CANCELADO.

      await prisma.$transaction(async (tx) => {
        // 1. Mark order as Cancelled/Refunded
        await tx.pedido.update({
          where: { id: pedidoId },
          data: { status: "CANCELADO" },
        });

        // 2. Reverse transactions for photographers
        for (const item of pedido.itens) {
          const fotografoId = item.foto.fotografoId;

          // Fetch platform fee from config
          const { getConfigNumber, CONFIG_KEYS } = await import("@/lib/config");
          const taxaPlataformaPct = await getConfigNumber(
            CONFIG_KEYS.TAXA_PLATAFORMA
          );
          const photographerShare = new Prisma.Decimal(1).sub(
            new Prisma.Decimal(taxaPlataformaPct).div(100)
          );

          // Re-calculate original commission to reverse it
          const precoPago = new Prisma.Decimal(item.precoPago);
          const valorEstorno = precoPago.mul(photographerShare); // Positive value

          // Create "Estorno" transaction (Negative value)
          await tx.transacao.create({
            data: {
              fotografoId,
              tipo: "ESTORNO", // or "REEMBOLSO"
              valor: valorEstorno.negated(),
              descricao: `Estorno de venda: ${item.foto.titulo} (Pedido ${pedidoId})`,
              status: "PROCESSADO",
            },
          });

          // Update balance (Decrement available)
          // Allow negative balance (debt)
          await tx.saldo.update({
            where: { fotografoId },
            data: {
              disponivel: {
                decrement: valorEstorno,
              },
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
    logError(error, "Webhook MP");
    return NextResponse.json(
      { error: "Webhook processing failed", details: error.message },
      { status: 500 }
    );
  }
}

// Mercado Pago verification
export async function GET() {
  return NextResponse.json({ status: "ok" });
}

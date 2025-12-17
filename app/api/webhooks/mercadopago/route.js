import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Mercado Pago sends notifications for different events
    // We filter for "payment" type or "payment.updated" action (depending on API version, but 'payment' is safer)
    // The notification structure usually has `type` or `topic`
    
    let paymentId = null;

    if (body.type === "payment") {
       paymentId = body.data.id;
    } else if (body.topic === "payment") { // Legacy or specific topic
       paymentId = body.resource; // Usually the resource URL or ID
       if (paymentId && typeof paymentId === 'string' && paymentId.includes('/')) {
         paymentId = paymentId.split('/').pop();
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
      console.error(`Failed to fetch payment ${paymentId} from Mercado Pago`);
      return NextResponse.json({ error: "Failed to fetch payment" }, { status: 500 });
    }

    const payment = await paymentResponse.json();
    const pedidoId = payment.external_reference;

    console.log(`Payment ${paymentId} status: ${payment.status} for order ${pedidoId}`);

    if (payment.status === "approved") {
      // 1. Verify if order exists and is not already paid
      const pedido = await prisma.pedido.findUnique({
          where: { id: pedidoId },
          include: { itens: true }
      });

      if (!pedido) {
          console.error(`Order ${pedidoId} not found`);
          return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }



      // 2. Transaction: Update Order Status + Distribute Funds
      const result = await prisma.$transaction(async (tx) => {
        // Atomic Transition: Only update if status is NOT already 'PAGO' (or specifically 'PENDENTE')
        // This acts as a lock. If count is 0, it means another request likely beat us to it.
        const updateResult = await tx.pedido.updateMany({
          where: { 
            id: pedidoId, 
            status: { not: 'PAGO' } // Idempotency Key
          },
          data: {
            status: "PAGO",
            paymentId: paymentId.toString(),
          },
        });

        if (updateResult.count === 0) {
            // Already paid or doesn't exist (previously checked existance, so likely race condition occurred)
            return { processed: false, reason: 'ALREADY_PROCESSED' };
        }

        // Fetch items with photographer details to calculate commissions
        const items = await tx.itemPedido.findMany({
          where: { pedidoId },
          include: { 
            foto: {
              include: {
                fotografo: true,
              },
            },
          },
        });

        for (const item of items) {
          // Calculate commission (80% for photographer, 20% for platform)
          const fotografoId = item.foto.fotografoId;
          
          // Using Prisma.Decimal for precise calculation
          const precoPago = new Prisma.Decimal(item.precoPago);
          const comissaoPercent = new Prisma.Decimal(0.80);
          const valorFotografo = precoPago.mul(comissaoPercent);

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
                    increment: valorFotografo
                }
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

          console.log(`💰 Fotógrafo ${fotografoId} creditado: R$ ${valorFotografo.toString()}`);
        }
        
        return { processed: true };
      });

      if (!result.processed) {
         console.log(`Order ${pedidoId} was already processed (Atomic Check).`);
         return NextResponse.json({ received: true, message: "Already processed" });
      }

      console.log(`✅ Order ${pedidoId} successfully processed and paid.`);
      
    } else if (payment.status === "rejected" || payment.status === "cancelled") {
      await prisma.pedido.update({
        where: { id: pedidoId },
        data: {
          status: "CANCELADO",
        },
      });
      console.log(`❌ Order ${pedidoId} marked as CANCELADO`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
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
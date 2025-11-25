import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Mercado Pago sends notifications for different events
    if (body.type === "payment") {
      const paymentId = body.data.id;
      
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
        console.error("Failed to fetch payment from Mercado Pago");
        return NextResponse.json({ error: "Failed to fetch payment" }, { status: 500 });
      }

      const payment = await paymentResponse.json();
      const pedidoId = payment.external_reference;

      console.log(`Payment ${paymentId} status: ${payment.status} for order ${pedidoId}`);

      if (payment.status === "approved") {
        // Update order status to PAGO
        await prisma.pedido.update({
          where: { id: pedidoId },
          data: {
            status: "PAGO",
            checkoutSessionId: paymentId.toString(),
            paymentProvider: "MERCADOPAGO",
          },
        });

        // Fetch items to calculate commissions
        const items = await prisma.itemPedido.findMany({
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
          const precoTotal = parseFloat(item.precoPago || item.precoUnitario || 0);
          const valorFotografo = precoTotal * 0.80;

          // Ensure photographer has a balance record
          await prisma.saldo.upsert({
            where: { fotografoId },
            create: {
              fotografoId,
              disponivel: 0,
              bloqueado: 0,
            },
            update: {},
          });

          // Create transaction for photographer earnings
          await prisma.transacao.create({
            data: {
              fotografoId,
              tipo: "VENDA",
              valor: valorFotografo,
              descricao: `Venda de "${item.foto.titulo}"`,
            },
          });

          // Update photographer's available balance
          await prisma.saldo.update({
            where: { fotografoId },
            data: {
              disponivel: {
                increment: valorFotografo,
              },
            },
          });

          console.log(`💰 Fotógrafo ${fotografoId} recebeu R$ ${valorFotografo.toFixed(2)}`);
        }

        console.log(`✅ Order ${pedidoId} marked as PAGO`);
      } else if (payment.status === "rejected") {
        await prisma.pedido.update({
          where: { id: pedidoId },
          data: {
            status: "CANCELADO",
          },
        });
        console.log(`❌ Order ${pedidoId} marked as CANCELADO`);
      }
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

// Mercado Pago also sends GET requests to verify the webhook
export async function GET() {
  return NextResponse.json({ status: "ok" });
}

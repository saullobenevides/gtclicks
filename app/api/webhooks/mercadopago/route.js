import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateDownloadUrl, extractS3Key } from "@/lib/s3-download";

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

        // Generate download URLs for all items in the order
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
          // Generate presigned URL for download (valid for 30 days)
          let downloadUrl = item.foto.originalUrl;
          let expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 30);

          // Try to generate presigned URL if S3 is configured
          if (process.env.S3_UPLOAD_BUCKET && item.foto.originalUrl) {
            try {
              const s3Key = extractS3Key(item.foto.originalUrl);
              if (s3Key) {
                // Generate URL valid for 30 days (2592000 seconds)
                downloadUrl = await generateDownloadUrl(s3Key, 2592000);
              }
            } catch (error) {
              console.warn("Failed to generate presigned URL, using original:", error);
              // Fallback to original URL
            }
          }

          await prisma.itemPedido.update({
            where: { id: item.id },
            data: {
              downloadUrlAssinada: downloadUrl,
              expiresAt,
            },
          });

          // Calculate commission (80% for photographer, 20% for platform)
          const fotografoId = item.foto.fotografoId;
          const precoTotal = parseFloat(item.precoUnitario);
          const comissaoPlataforma = precoTotal * 0.20;
          const valorFotografo = precoTotal * 0.80;

          // Ensure photographer has a balance record
          const saldo = await prisma.saldo.upsert({
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
              pedidoId,
              status: "PROCESSADO",
            },
          });

          // Create transaction for platform commission
          await prisma.transacao.create({
            data: {
              fotografoId,
              tipo: "COMISSAO",
              valor: -comissaoPlataforma,
              descricao: `Comissão da plataforma (20%)`,
              pedidoId,
              status: "PROCESSADO",
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

          console.log(`💰 Fotógrafo ${fotografoId} recebeu R$ ${valorFotografo.toFixed(2)} (Comissão: R$ ${comissaoPlataforma.toFixed(2)})`);
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

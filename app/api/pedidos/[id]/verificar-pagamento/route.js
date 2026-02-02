import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getAuthenticatedUser } from "@/lib/auth";

export async function POST(request, context) {
  try {
    const { id: pedidoId } = await context.params;
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // 1. Fetch Order
    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId },
      include: { itens: true },
    });

    if (!pedido) {
      return NextResponse.json(
        { error: "Pedido não encontrado" },
        { status: 404 }
      );
    }

    // Security: Only owner or admin can trigger verification
    if (pedido.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    // If already paid, return early
    if (pedido.status === "PAGO") {
      return NextResponse.json({
        status: "PAGO",
        message: "Pedido já está pago.",
      });
    }

    // 2. Fetch Payment Metadata (to get Payment ID)
    // We expect the paymentId to be stored on create, but MP preference creates "orders" before payments.
    // The Webhook usually brings the payment ID.
    // However, we can search MP payments by 'external_reference' (our pedidoId).

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json(
        { error: "Erro de configuração no servidor" },
        { status: 500 }
      );
    }

    // Search for payments with this external_reference
    const searchUrl = new URL("https://api.mercadopago.com/v1/payments/search");
    searchUrl.searchParams.append("external_reference", pedidoId);
    searchUrl.searchParams.append("status", "approved"); // We only care about approved ones

    const searchRes = await fetch(searchUrl.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!searchRes.ok) {
      console.error("MP Search Error:", await searchRes.text());
      return NextResponse.json(
        { error: "Erro ao consultar Mercado Pago" },
        { status: 502 }
      );
    }

    const searchData = await searchRes.json();
    const approvedPayment = searchData.results && searchData.results[0];

    if (!approvedPayment) {
      return NextResponse.json({
        status: pedido.status,
        message: "Pagamento aprovado não encontrado ainda.",
      });
    }

    // 3. Payment Found! Re-use the Webhook Logic (Atomic Update)
    // Duplicate logic from webhook for safety (or extracting to a shared lib would be better)
    // For now, implementing the critical transaction parts inline.

    const paymentId = approvedPayment.id;
    console.log(
      `✅ [Manual Check] Found approved payment ${paymentId} for order ${pedidoId}`
    );

    const result = await prisma.$transaction(async (tx) => {
      // Lock & Update
      const updateResult = await tx.pedido.updateMany({
        where: {
          id: pedidoId,
          status: { not: "PAGO" },
        },
        data: {
          status: "PAGO",
          paymentId: paymentId.toString(),
        },
      });

      if (updateResult.count === 0) {
        return { processed: false, reason: "ALREADY_PROCESSED" };
      }

      // Distribute Funds
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
            descricao: `Venda de foto: ${item.foto.titulo} (Verificação Manual)`,
          },
        });

        // Stats
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
      }

      return { processed: true };
    });

    if (result.processed) {
      // Run Notifications asynchronously (ignoring errors to not block response)
      try {
        // Import dynamically to avoid top-level issues
        const { notifyOrderApproved } = await import("@/actions/notifications");
        await notifyOrderApproved({
          userId: pedido.userId,
          orderId: pedidoId,
        });
      } catch (e) {
        console.error("Notification trigger error", e);
      }
    }

    return NextResponse.json({
      status: "PAGO",
      processed: result.processed,
      message: "Pagamento verificado e processado com sucesso.",
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Erro interno ao verificar pagamento" },
      { status: 500 }
    );
  }
}

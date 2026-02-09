import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getAuthenticatedUser } from "@/lib/auth";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pedidoId } = await context.params;
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

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

    if (pedido.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    if (pedido.status === "PAGO") {
      return NextResponse.json({
        status: "PAGO",
        message: "Pedido já está pago.",
      });
    }

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json(
        { error: "Erro de configuração no servidor" },
        { status: 500 }
      );
    }

    const searchUrl = new URL("https://api.mercadopago.com/v1/payments/search");
    searchUrl.searchParams.append("external_reference", pedidoId);
    searchUrl.searchParams.append("status", "approved");

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

    const searchData = (await searchRes.json()) as {
      results?: Array<{ id: string | number }>;
    };
    const approvedPayment = searchData.results?.[0];

    if (!approvedPayment) {
      return NextResponse.json({
        status: pedido.status,
        message: "Pagamento aprovado não encontrado ainda.",
      });
    }

    const paymentId = approvedPayment.id;
    console.log(
      `✅ [Manual Check] Found approved payment ${paymentId} for order ${pedidoId}`
    );

    const result = await prisma.$transaction(async (tx) => {
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
      try {
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

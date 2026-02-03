import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { serializePrismaData } from "@/lib/utils/serialization";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const username = searchParams.get("username");
  const email = searchParams.get("email");

  const orFilters = [];
  if (userId) {
    orFilters.push({ userId });
  }
  if (username) {
    orFilters.push({ username });
  }
  if (email) {
    orFilters.push({
      user: { email },
    });
  }

  if (!orFilters.length) {
    return NextResponse.json(
      { error: "Informe userId, username ou email para buscar o fotografo." },
      { status: 400 },
    );
  }

  try {
    const fotografo = await prisma.fotografo.findFirst({
      where: {
        OR: orFilters,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        saldo: true,
        colecoes: {
          where: { status: "PUBLICADA" },
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            nome: true,
            status: true,
            views: true,
            vendas: true,
            downloads: true,
            carrinhoCount: true,
            createdAt: true,
            capaUrl: true,
            slug: true,
          },
        },
        _count: {
          select: {
            colecoes: true,
            fotos: true,
          },
        },
      },
    });

    if (!fotografo) {
      return NextResponse.json({ data: null }, { status: 200 });
    }

    // Calcular estatísticas agregadas reais
    const [
      revenueData,
      salesCount,
      viewsData,
      downloadsData,
      ordersCount,
      cartData,
    ] = await prisma.$transaction([
      // Receita Total (Soma dos itens vendidos deste fotógrafo)
      prisma.itemPedido.aggregate({
        _sum: { precoPago: true },
        where: {
          foto: { fotografoId: fotografo.id },
          pedido: { status: "PAGO" },
        },
      }),
      // Total de Itens Vendidos (FONTE DA VERDADE)
      prisma.itemPedido.count({
        where: {
          foto: { fotografoId: fotografo.id },
          pedido: { status: "PAGO" },
        },
      }),
      // Total de Visualizações (Soma das views das coleções - Denormalizado para performance)
      prisma.colecao.aggregate({
        _sum: { views: true },
        where: { fotografoId: fotografo.id },
      }),
      // Total de Downloads (FONTE DA VERDADE - Baseado nas fotos do fotógrafo)
      prisma.foto.aggregate({
        _sum: { downloads: true },
        where: { fotografoId: fotografo.id },
      }),
      // Total de Pedidos Únicos (Para Ticket Médio)
      prisma.pedido.count({
        where: {
          status: "PAGO",
          itens: { some: { foto: { fotografoId: fotografo.id } } },
        },
      }),
      // Total no Carrinho (FONTE DA VERDADE - Itens reais nos carrinhos)
      prisma.itemCarrinho.count({
        where: {
          foto: { fotografoId: fotografo.id },
        },
      }),
    ]);

    const stats = {
      revenue: Number(revenueData._sum.precoPago || 0),
      sales: salesCount, // Valor real da contagem de registros pagos
      views: viewsData._sum.views || 0,
      downloads: downloadsData._sum.downloads || 0,
      orders: ordersCount,
      cart: cartData, // Valor real da contagem de itens nos carrinhos
    };

    const saldoSerialized = fotografo.saldo
      ? {
          disponivel: Number(fotografo.saldo.disponivel || 0),
          bloqueado: Number(fotografo.saldo.bloqueado || 0),
        }
      : null;

    const data = {
      id: fotografo.id,
      userId: fotografo.userId,
      username: fotografo.username,
      nome: fotografo.user?.name ?? null,
      email: fotografo.user?.email ?? null,
      saldo: saldoSerialized,
      colecoes: serializePrismaData(fotografo.colecoes || []),
      _count: fotografo._count,
      stats,
    };
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Nao foi possivel localizar o fotografo.",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

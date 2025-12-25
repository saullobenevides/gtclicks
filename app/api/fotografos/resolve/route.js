import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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
      { status: 400 }
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
            take: 5,
            orderBy: { createdAt: 'desc' },
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
            }
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
      return NextResponse.json(
        { error: "Fotografo nao encontrado para este usuario." },
        { status: 404 }
      );
    }

    // Calcular estatísticas agregadas reais
    const [revenueData, salesCount, viewsData, downloadsData, ordersCount] = await prisma.$transaction([
        // Receita Total (Soma dos itens vendidos deste fotógrafo)
        prisma.itemPedido.aggregate({
            _sum: { precoPago: true },
            where: {
                foto: { fotografoId: fotografo.id },
                pedido: { status: 'PAGO' }
            }
        }),
        // Total de Itens Vendidos
        prisma.itemPedido.count({
            where: {
                foto: { fotografoId: fotografo.id },
                pedido: { status: 'PAGO' }
            }
        }),
        // Total de Visualizações (Soma das views de todas as fotos)
        prisma.foto.aggregate({
            _sum: { views: true },
            where: { fotografoId: fotografo.id }
        }),
        // Total de Downloads
        prisma.foto.aggregate({
            _sum: { downloads: true },
            where: { fotografoId: fotografo.id }
        }),
        // Total de Pedidos Únicos (Para Ticket Médio)
        prisma.pedido.count({
            where: {
                status: 'PAGO',
                itens: { some: { foto: { fotografoId: fotografo.id } } }
            }
        })
    ]);

    const stats = {
        revenue: Number(revenueData._sum.precoPago || 0),
        sales: salesCount,
        views: viewsData._sum.views || 0,
        downloads: downloadsData._sum.downloads || 0,
        orders: ordersCount
    };

    if (!fotografo) {
      return NextResponse.json(
        { error: "Fotografo nao encontrado para este usuario." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: {
        id: fotografo.id,
        userId: fotografo.userId,
        username: fotografo.username,
        nome: fotografo.user?.name ?? null,
        email: fotografo.user?.email ?? null,
        saldo: fotografo.saldo,
        colecoes: fotografo.colecoes,
        _count: fotografo._count,
        stats, // Estatísticas agregadas
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Nao foi possivel localizar o fotografo.", details: error.message },
      { status: 500 }
    );
  }
}

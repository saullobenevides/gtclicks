import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { serializePrismaData } from "@/lib/utils/serialization";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json(
      { error: "Autenticação necessária" },
      { status: 401 }
    );
  }

  try {
    const fotografo = await prisma.fotografo.findFirst({
      where: { userId: user.id },
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

    const [
      revenueData,
      salesCount,
      viewsData,
      downloadsData,
      ordersCount,
      cartData,
    ] = await prisma.$transaction([
      prisma.itemPedido.aggregate({
        _sum: { precoPago: true },
        where: {
          foto: { fotografoId: fotografo.id },
          pedido: { status: "PAGO" },
        },
      }),
      prisma.itemPedido.count({
        where: {
          foto: { fotografoId: fotografo.id },
          pedido: { status: "PAGO" },
        },
      }),
      prisma.colecao.aggregate({
        _sum: { views: true },
        where: { fotografoId: fotografo.id },
      }),
      prisma.foto.aggregate({
        _sum: { downloads: true },
        where: { fotografoId: fotografo.id },
      }),
      prisma.pedido.count({
        where: {
          status: "PAGO",
          itens: { some: { foto: { fotografoId: fotografo.id } } },
        },
      }),
      prisma.itemCarrinho.count({
        where: {
          foto: { fotografoId: fotografo.id },
        },
      }),
    ]);

    const stats = {
      revenue: Number(revenueData._sum.precoPago ?? 0),
      sales: salesCount,
      views: viewsData._sum.views ?? 0,
      downloads: downloadsData._sum.downloads ?? 0,
      orders: ordersCount,
      cart: cartData,
    };

    const saldoSerialized = fotografo.saldo
      ? {
          disponivel: Number(fotografo.saldo.disponivel ?? 0),
          bloqueado: Number(fotografo.saldo.bloqueado ?? 0),
        }
      : null;

    const data = {
      id: fotografo.id,
      userId: fotografo.userId,
      username: fotografo.username,
      nome: fotografo.user?.name ?? null,
      email: fotografo.user?.email ?? null,
      saldo: saldoSerialized,
      colecoes: serializePrismaData(fotografo.colecoes ?? []),
      _count: fotografo._count,
      stats,
    };
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Nao foi possivel localizar o fotografo.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

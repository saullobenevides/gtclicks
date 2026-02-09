import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 401 }
      );
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalRevenueResult,
      activeUsersCount,
      ordersCount,
      collectionsCount,
      recentOrders,
    ] = await Promise.all([
      prisma.pedido.aggregate({
        where: { status: "PAGO" },
        _sum: { total: true },
      }),
      prisma.user.count(),
      prisma.pedido.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.colecao.count({
        where: { status: "PUBLICADA" },
      }),
      prisma.pedido.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { name: true, email: true },
          },
          itens: {
            select: { id: true },
          },
        },
      }),
    ]);

    const stats = {
      totalRevenue: totalRevenueResult._sum.total
        ? Number(totalRevenueResult._sum.total)
        : 0,
      activeUsers: activeUsersCount,
      ordersCount,
      collectionsCount,
      recentActivity: recentOrders.map((order) => ({
        id: order.id,
        type: "order",
        description: `Pedido de ${
          order.user?.name || order.user?.email || "Usuário"
        }`,
        itemsCount: order.itens?.length || 0,
        total: order.total ? Number(order.total) : 0,
        status: order.status,
        createdAt: order.createdAt,
      })),
    };

    return NextResponse.json(stats);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[API /admin/stats] Error:", message);
    return NextResponse.json(
      { error: "Internal server error", message },
      { status: 500 }
    );
  }
}

import { PedidoStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

const statusMap: Record<string, PedidoStatus> = {
  PENDING: "PENDENTE",
  APPROVED: "PAGO",
  CANCELLED: "CANCELADO",
  PENDENTE: "PENDENTE",
  PAGO: "PAGO",
  CANCELADO: "CANCELADO",
};

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const rawStatus = searchParams.get("status");

    let prismaStatus: PedidoStatus | undefined;
    if (rawStatus && rawStatus in statusMap) {
      prismaStatus = statusMap[rawStatus];
    }

    const where: { status?: PedidoStatus } = {};
    if (prismaStatus) where.status = prismaStatus;

    const rawOrders = await prisma.pedido.findMany({
      where,
      include: {
        user: {
          select: { name: true, email: true },
        },
        itens: {
          select: { id: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const orders = rawOrders.map((order) => ({
      ...order,
      total: order.total ? Number(order.total) : 0,
      items: order.itens ?? [],
    }));

    return NextResponse.json(orders);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const stack = error instanceof Error ? error.stack : undefined;
    console.error("[API /admin/orders] Error:", message);
    return NextResponse.json(
      {
        error: "Internal server error",
        ...(process.env.NODE_ENV === "development" && { message, stack }),
      },
      { status: 500 }
    );
  }
}

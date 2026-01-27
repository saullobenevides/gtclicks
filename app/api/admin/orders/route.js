import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { z } from "zod";

const querySchema = z.object({
  status: z.string().optional(),
});

// Map frontend status values to Prisma enum values
const statusMap = {
  PENDING: "PENDENTE",
  APPROVED: "PAGO",
  CANCELLED: "CANCELADO",
  PENDENTE: "PENDENTE",
  PAGO: "PAGO",
  CANCELADO: "CANCELADO",
};

export async function GET(request) {
  try {
    // 1. Security Check
    const user = await getAuthenticatedUser();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 401 },
      );
    }

    // 2. Input Validation
    const { searchParams } = new URL(request.url);
    const rawStatus = searchParams.get("status");

    // Map status to Prisma enum if provided
    let prismaStatus = undefined;
    if (rawStatus && statusMap[rawStatus]) {
      prismaStatus = statusMap[rawStatus];
    }

    // 3. Data Fetching
    const where = {};
    if (prismaStatus) {
      where.status = prismaStatus;
    }

    const rawOrders = await prisma.pedido.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        itens: {
          select: {
            id: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const orders = rawOrders.map((order) => ({
      ...order,
      total: order.total ? Number(order.total) : 0,
      items: order.itens, // Rename for frontend compatibility
    }));

    return NextResponse.json(orders);
  } catch (error) {
    console.error("[API /admin/orders] Error:", error.message);
    console.error("[API /admin/orders] Stack:", error.stack);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message,
        stack: error.stack,
      },
      { status: 500 },
    );
  }
}

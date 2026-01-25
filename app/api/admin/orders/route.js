import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { z } from "zod";

const querySchema = z.object({
  status: z.enum(["PENDENTE", "PAGO", "CANCELADO"]).optional(),
});

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

    const validationResult = querySchema.safeParse({
      status: rawStatus || undefined,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid status parameter" },
        { status: 400 },
      );
    }

    const { status } = validationResult.data;

    // 3. Data Fetching
    const where = {};
    if (status) {
      where.status = status;
    }

    const orders = await prisma.pedido.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        items: {
          select: {
            id: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("[API /admin/orders] Error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 },
    );
  }
}

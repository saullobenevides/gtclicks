import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { error: "userId is required" },
      { status: 400 }
    );
  }

  try {
    // Get all completed orders for this user
    const purchases = await prisma.itemPedido.findMany({
      where: {
        pedido: {
          userId: userId,
          status: "PAGO",
        },
      },
      include: {
        foto: {
          select: {
            id: true,
            titulo: true,
            previewUrl: true,
          },
        },
        licenca: {
          select: {
            id: true,
            nome: true,
          },
        },
        pedido: {
          select: {
            id: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        pedido: {
          createdAt: 'desc',
        }
      },
    });

    return NextResponse.json({ data: purchases });
  } catch (error) {
    console.error("Error fetching downloads:", error);
    return NextResponse.json(
      { error: "Failed to fetch downloads" },
      { status: 500 }
    );
  }
}

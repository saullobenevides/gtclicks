import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
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
    const purchases = await prisma.itemPedido.findMany({
      where: {
        pedido: {
          userId: user.id,
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
        pedido: { createdAt: "desc" },
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

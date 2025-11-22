import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  const { id } = params;

  try {
    const pedido = await prisma.pedido.findUnique({
      where: { id },
      include: {
        itens: {
          include: {
            foto: true,
            licenca: true,
          },
        },
      },
    });

    if (!pedido) {
      return NextResponse.json(
        { error: "Pedido não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: pedido });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Erro ao buscar pedido" },
      { status: 500 }
    );
  }
}

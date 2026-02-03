import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { serializePrismaData } from "@/lib/utils/serialization";

export async function GET(request, { params }) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

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
        { status: 404 },
      );
    }

    // --- SECURITY FIX: IDOR Prevention ---
    if (pedido.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const serialized = serializePrismaData({
      ...pedido,
      total: pedido.total ? Number(pedido.total) : 0,
      itens: (pedido.itens || []).map((item) => ({
        ...item,
        precoPago: item.precoPago ? Number(item.precoPago) : 0,
      })),
    });
    return NextResponse.json({ data: serialized });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Erro ao buscar pedido" },
      { status: 500 },
    );
  }
}

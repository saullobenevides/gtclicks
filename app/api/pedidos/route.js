import { PedidoStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();
    const { clienteId, itens = [], checkoutSessionId, paymentProvider } = body ?? {};

    if (!clienteId || !itens.length) {
      return NextResponse.json(
        { error: "Informe clienteId e ao menos um item." },
        { status: 400 }
      );
    }

    const total = itens.reduce(
      (acc, item) => acc + Number(item.precoUnitario ?? 0),
      0
    );

    const pedido = await prisma.pedido.create({
      data: {
        clienteId,
        total,
        status: PedidoStatus.PENDENTE,
        checkoutSessionId,
        paymentProvider,
        itens: {
          create: itens.map((item) => {
            if (!item.fotoId) {
              throw new Error("Cada item precisa de fotoId.");
            }

            return {
              foto: { connect: { id: item.fotoId } },
              // licencaId is optional
              precoUnitario: item.precoUnitario ?? 0,
            };
          }),
        },
      },
      include: {
        itens: true,
      },
    });

    return NextResponse.json({ data: pedido }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao criar pedido.", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const clienteId = searchParams.get("clienteId");

    const pedidos = await prisma.pedido.findMany({
      where: {
        ...(clienteId ? { clienteId } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        cliente: { select: { name: true, email: true } },
        itens: {
          include: {
            foto: { select: { titulo: true } },
          },
        },
      },
    });

    return NextResponse.json({ data: pedidos });
  } catch (error) {
    return NextResponse.json(
      { error: "Nao foi possivel carregar os pedidos.", details: error.message },
      { status: 500 }
    );
  }
}

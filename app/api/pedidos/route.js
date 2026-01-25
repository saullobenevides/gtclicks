import { PedidoStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

import { getAuthenticatedUser } from "@/lib/auth";

export async function POST(request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { itens = [], checkoutSessionId, paymentProvider } = body ?? {};

    if (!itens.length) {
      return NextResponse.json(
        { error: "Informe ao menos um item." },
        { status: 400 },
      );
    }

    const total = itens.reduce(
      (acc, item) => acc + Number(item.precoPago ?? 0),
      0,
    );

    const pedido = await prisma.pedido.create({
      data: {
        userId: user.id,
        total,
        status: PedidoStatus.PENDENTE,
        paymentId: checkoutSessionId, // Mapping checkoutSessionId to paymentId as per schema nullable
        // paymentProvider not in schema, ignoring
        itens: {
          create: itens.map((item) => {
            if (!item.fotoId) {
              throw new Error("Cada item precisa de fotoId.");
            }

            return {
              foto: { connect: { id: item.fotoId } },
              licenca: item.licencaId
                ? { connect: { id: item.licencaId } }
                : undefined,
              precoPago: item.precoPago ?? 0,
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
      { status: 500 },
    );
  }
}

export async function GET(request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    // const userId = searchParams.get("userId"); // IGNORE CLIENT PARAM, use Secure Auth ID
    const userId = user.id;

    const pedidos = await prisma.pedido.findMany({
      where: {
        ...(userId ? { userId } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
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
      {
        error: "Nao foi possivel carregar os pedidos.",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

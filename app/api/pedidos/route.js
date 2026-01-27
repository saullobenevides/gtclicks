import { PedidoStatus, Prisma } from "@prisma/client";
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

    // --- SECURITY FIX: Calculate Total on Server ---
    let calculatedTotal = new Prisma.Decimal(0);
    const textItems = []; // For Prisma create

    for (const item of itens) {
      if (!item.fotoId) {
        return NextResponse.json({ error: "Item sem fotoId" }, { status: 400 });
      }

      // Fetch Photo & License
      const foto = await prisma.foto.findUnique({
        where: { id: item.fotoId },
        include: { colecao: true },
      });

      if (!foto) {
        return NextResponse.json(
          { error: `Foto não encontrada: ${item.fotoId}` },
          { status: 400 },
        );
      }

      let itemPrice = new Prisma.Decimal(0);

      if (item.licencaId) {
        const licencaRel = await prisma.fotoLicenca.findUnique({
          where: {
            fotoId_licencaId: {
              fotoId: foto.id,
              licencaId: item.licencaId,
            },
          },
        });

        if (!licencaRel) {
          return NextResponse.json(
            { error: "Licença inválida" },
            { status: 400 },
          );
        }
        itemPrice = licencaRel.preco;
      } else {
        // Standard Price (Collection)
        if (foto.colecao && foto.colecao.precoFoto) {
          itemPrice = foto.colecao.precoFoto;
        } else {
          // Fallback/Error if no price defined
          return NextResponse.json(
            { error: "Preço não definido para foto" },
            { status: 400 },
          );
        }
      }

      calculatedTotal = calculatedTotal.add(itemPrice);

      textItems.push({
        foto: { connect: { id: item.fotoId } },
        licenca: item.licencaId
          ? { connect: { id: item.licencaId } }
          : undefined,
        precoPago: itemPrice, // Secure price
      });
    }

    const pedido = await prisma.pedido.create({
      data: {
        userId: user.id,
        total: calculatedTotal,
        status: PedidoStatus.PENDENTE,
        paymentId: checkoutSessionId,
        itens: {
          create: textItems,
        },
      },
      include: {
        itens: true,
      },
    });

    return NextResponse.json({ data: pedido }, { status: 201 });
  } catch (error) {
    console.error("Erro criar pedido:", error);
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

import { PedidoStatus, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      itens?: Array<{ fotoId?: string; licencaId?: string }>;
      checkoutSessionId?: string;
      paymentProvider?: string;
    };
    const { itens = [], checkoutSessionId } = body ?? {};

    if (!itens.length) {
      return NextResponse.json(
        { error: "Informe ao menos um item." },
        { status: 400 }
      );
    }

    const fotoIds = [
      ...new Set(itens.map((i) => i.fotoId).filter(Boolean)),
    ] as string[];
    if (fotoIds.length === 0) {
      return NextResponse.json(
        { error: "Informe ao menos um item com fotoId" },
        { status: 400 }
      );
    }

    const licencaPairs = itens
      .filter((i) => i.fotoId && i.licencaId)
      .map((i) => ({ fotoId: i.fotoId!, licencaId: i.licencaId! }));

    const [fotos, licencasRel] = await Promise.all([
      prisma.foto.findMany({
        where: { id: { in: fotoIds } },
        select: {
          id: true,
          colecaoId: true,
          colecao: {
            select: { id: true, precoFoto: true },
          },
        },
      }),
      licencaPairs.length > 0
        ? prisma.fotoLicenca.findMany({
            where: {
              OR: licencaPairs.map((p) => ({
                AND: [{ fotoId: p.fotoId }, { licencaId: p.licencaId }],
              })),
            },
            select: { fotoId: true, licencaId: true, preco: true },
          })
        : [],
    ]);

    const fotoMap = new Map(fotos.map((f) => [f.id, f]));
    const licencaMap = new Map<string, Prisma.Decimal>(
      licencasRel.map((l) => [`${l.fotoId}:${l.licencaId}`, l.preco] as const)
    );

    let calculatedTotal = new Prisma.Decimal(0);
    const textItems: Array<{
      foto: { connect: { id: string } };
      licenca?: { connect: { id: string } };
      precoPago: Prisma.Decimal | number;
    }> = [];

    for (const item of itens) {
      if (!item.fotoId) {
        return NextResponse.json({ error: "Item sem fotoId" }, { status: 400 });
      }

      const foto = fotoMap.get(item.fotoId);
      if (!foto) {
        return NextResponse.json(
          { error: `Foto não encontrada: ${item.fotoId}` },
          { status: 400 }
        );
      }

      let itemPrice: Prisma.Decimal | number;

      if (item.licencaId) {
        const licencaPreco = licencaMap.get(`${item.fotoId}:${item.licencaId}`);
        if (licencaPreco == null) {
          return NextResponse.json(
            { error: `Licença inválida para foto ${item.fotoId}` },
            { status: 400 }
          );
        }
        itemPrice = licencaPreco;
      } else {
        if (foto.colecao?.precoFoto != null) {
          itemPrice = foto.colecao.precoFoto;
        } else {
          return NextResponse.json(
            { error: "Preço não definido para foto" },
            { status: 400 }
          );
        }
      }

      calculatedTotal = calculatedTotal.add(
        typeof itemPrice === "number"
          ? new Prisma.Decimal(itemPrice)
          : itemPrice
      );

      textItems.push({
        foto: { connect: { id: item.fotoId } },
        licenca: item.licencaId
          ? { connect: { id: item.licencaId } }
          : undefined,
        precoPago: itemPrice,
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
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Erro criar pedido:", error);
    return NextResponse.json(
      { error: "Erro ao criar pedido.", details: message },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit") || "20", 10))
    );
    const skip = (page - 1) * limit;

    const [total, pedidos] = await Promise.all([
      prisma.pedido.count({ where: { userId: user.id } }),
      prisma.pedido.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
        include: {
          user: { select: { name: true, email: true } },
          itens: {
            include: {
              foto: { select: { titulo: true } },
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      data: pedidos,
      metadata: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Nao foi possivel carregar os pedidos.", details: message },
      { status: 500 }
    );
  }
}

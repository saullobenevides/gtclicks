import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { cartSyncSchema } from "@/lib/validations";
import { formatCartItemTitle } from "@/lib/utils";

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = cartSyncSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { items } = validation.data;

    let cart = await prisma.carrinho.findUnique({
      where: { userId: user.id },
      include: { itens: true },
    });

    if (!cart) {
      cart = await prisma.carrinho.create({
        data: { userId: user.id },
        include: { itens: true },
      });
    }

    if (items && items.length > 0) {
      for (const item of items) {
        const exists = cart.itens.some(
          (dbItem) => dbItem.fotoId === item.fotoId
        );

        if (!exists) {
          const fotoExists = await prisma.foto.findUnique({
            where: { id: item.fotoId },
            select: { id: true },
          });

          if (!fotoExists) {
            console.warn(`Ignored invalid item in cart sync: ${item.fotoId}`);
            continue;
          }

          if (item.licencaId) {
            const licencaExists = await prisma.licenca.findUnique({
              where: { id: item.licencaId },
              select: { id: true },
            });
            if (!licencaExists) continue;
          }

          await prisma.itemCarrinho.create({
            data: {
              carrinhoId: cart.id,
              fotoId: item.fotoId,
            },
          });
        }
      }
    }

    const updatedCart = await prisma.carrinho.findUnique({
      where: { userId: user.id },
      include: {
        itens: {
          include: {
            foto: {
              include: { colecao: true },
            },
          },
        },
      },
    });

    if (!updatedCart) {
      return NextResponse.json({ items: [] });
    }

    const formattedItems = updatedCart.itens.map((item) => {
      const preco = item.foto.colecao?.precoFoto
        ? Number(item.foto.colecao.precoFoto)
        : 0;

      const colecao = item.foto.colecao;
      return {
        fotoId: item.fotoId,
        colecaoId: item.foto.colecaoId,
        licencaId: null,
        titulo: formatCartItemTitle({
          collectionName: colecao?.nome,
          numeroSequencial: item.foto.numeroSequencial,
          photoId: item.foto.id,
        }),
        preco,
        precoBase: preco,
        descontos: Array.isArray(colecao?.descontos)
          ? [...(colecao.descontos as unknown[])]
          : [],
        licenca: "Uso Padrão",
        previewUrl: item.foto.previewUrl,
      };
    });

    return NextResponse.json({ items: formattedItems });
  } catch (error) {
    console.error("Error syncing cart:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

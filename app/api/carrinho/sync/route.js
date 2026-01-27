import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { cartSyncSchema } from "@/lib/validations";

export async function POST(request) {
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
        { status: 400 },
      );
    }

    const { items } = validation.data;

    // 1. Get or Create Cart for User
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

    // 2. Merge Items
    // We want to add local items to the DB if they don't exist
    if (items && items.length > 0) {
      for (const item of items) {
        // Check if item already exists in DB cart
        const exists = cart.itens.some(
          (dbItem) => dbItem.fotoId === item.fotoId,
        );

        if (!exists) {
          // --- SECURITY FIX: Validate Existence ---
          const fotoExists = await prisma.foto.findUnique({
            where: { id: item.fotoId },
            select: { id: true },
          });

          if (!fotoExists) {
            console.warn(`Ignored invalid item in cart sync: ${item.fotoId}`);
            continue;
          }

          // If license ID provided, validate it too (optional, but good practice)
          if (item.licencaId) {
            const licencaExists = await prisma.licenca.findUnique({
              where: { id: item.licencaId },
              select: { id: true },
            });
            if (!licencaExists) {
              // Fallback to no license or skip? Let's skip to be safe.
              continue;
            }
          }

          await prisma.itemCarrinho.create({
            data: {
              carrinhoId: cart.id,
              fotoId: item.fotoId,
              // licencaId is now optional/ignored
            },
          });
        }
      }
    }

    // 3. Fetch final updated cart with prices
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

    const formattedItems = updatedCart.itens.map((item) => {
      const preco = item.foto.colecao?.precoFoto
        ? Number(item.foto.colecao.precoFoto)
        : 0;

      return {
        fotoId: item.fotoId,
        licencaId: null, // No longer used
        titulo: item.foto.titulo,
        preco: preco,
        licenca: "Uso Padrão",
        previewUrl: item.foto.previewUrl,
      };
    });

    return NextResponse.json({ items: formattedItems });
  } catch (error) {
    console.error("Error syncing cart:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

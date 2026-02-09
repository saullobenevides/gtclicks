import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { carrinhoItemBodySchema } from "@/lib/validations";

export async function DELETE(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rawBody = await request.json();
    const parseResult = carrinhoItemBodySchema.safeParse(rawBody);
    if (!parseResult.success) {
      const first = parseResult.error.flatten().fieldErrors;
      const message =
        (Object.values(first)[0] as string[] | undefined)?.[0] ||
        parseResult.error.message ||
        "Dados inválidos";
      return NextResponse.json({ error: message }, { status: 400 });
    }
    const { fotoId } = parseResult.data;

    const cart = await prisma.carrinho.findUnique({
      where: { userId: user.id },
    });

    if (cart) {
      await prisma.itemCarrinho.deleteMany({
        where: {
          carrinhoId: cart.id,
          fotoId,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing item from cart:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

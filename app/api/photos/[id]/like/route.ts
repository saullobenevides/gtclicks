import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { stackServerApp } from "@/stack/server";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const user = await stackServerApp.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const foto = await prisma.foto.findFirst({
    where: { id, status: "PUBLICADA" },
  });

  if (!foto) {
    return NextResponse.json(
      { error: "Foto não encontrada ou não disponível" },
      { status: 404 }
    );
  }

  try {
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_fotoId: {
          userId: user.id,
          fotoId: id,
        },
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: {
          userId_fotoId: {
            userId: user.id,
            fotoId: id,
          },
        },
      });

      await prisma.foto.update({
        where: { id },
        data: { likes: { decrement: 1 } },
      });

      return NextResponse.json({ liked: false });
    } else {
      await prisma.like.create({
        data: {
          userId: user.id,
          fotoId: id,
        },
      });

      await prisma.foto.update({
        where: { id },
        data: { likes: { increment: 1 } },
      });

      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

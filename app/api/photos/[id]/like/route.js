import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { stackServerApp } from "@/stack/server";

export async function POST(request, { params }) {
  const user = await stackServerApp.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Check if like exists
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_fotoId: {
          userId: user.id,
          fotoId: id,
        },
      },
    });

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: {
          userId_fotoId: {
            userId: user.id,
            fotoId: id,
          },
        },
      });
      
      // Decrement count
      await prisma.foto.update({
        where: { id },
        data: { likes: { decrement: 1 } },
      });

      return NextResponse.json({ liked: false });
    } else {
      // Like
      await prisma.like.create({
        data: {
          userId: user.id,
          fotoId: id,
        },
      });

      // Increment count
      await prisma.foto.update({
        where: { id },
        data: { likes: { increment: 1 } },
      });

      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { stackServerApp } from "@/stack/server";

export async function GET(request) {
  const user = await stackServerApp.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const likes = await prisma.like.findMany({
      where: {
        userId: user.id,
      },
      include: {
        foto: {
          include: {
            fotografo: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const likedPhotos = likes.map(like => like.foto);

    return NextResponse.json(likedPhotos);
  } catch (error) {
    console.error("Error fetching liked photos:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

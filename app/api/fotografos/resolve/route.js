import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const username = searchParams.get("username");
  const email = searchParams.get("email");

  const orFilters = [];
  if (userId) {
    orFilters.push({ userId });
  }
  if (username) {
    orFilters.push({ username });
  }
  if (email) {
    orFilters.push({
      user: { email },
    });
  }

  if (!orFilters.length) {
    return NextResponse.json(
      { error: "Informe userId, username ou email para buscar o fotografo." },
      { status: 400 }
    );
  }

  try {
    const fotografo = await prisma.fotografo.findFirst({
      where: {
        OR: orFilters,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!fotografo) {
      return NextResponse.json(
        { error: "Fotografo nao encontrado para este usuario." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: {
        id: fotografo.id,
        userId: fotografo.userId,
        username: fotografo.username,
        nome: fotografo.user?.name ?? null,
        email: fotografo.user?.email ?? null,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Nao foi possivel localizar o fotografo.", details: error.message },
      { status: 500 }
    );
  }
}

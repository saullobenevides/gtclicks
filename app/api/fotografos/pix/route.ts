import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = (await request.json()) as {
      userId?: string;
      chavePix?: string;
      code?: string;
    };
    const { userId, chavePix, code } = body;

    if (!code) {
      return NextResponse.json(
        { error: "Código de verificação é obrigatório" },
        { status: 400 }
      );
    }

    const targetUserId = userId ?? user.id;
    if (targetUserId !== user.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const userObj = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { email: true },
    });

    if (!userObj) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const validCode = await prisma.verificationCode.findFirst({
      where: {
        email: userObj.email,
        code,
        type: "PIX_UPDATE",
        expiresAt: { gt: new Date() },
      },
    });

    if (!validCode) {
      return NextResponse.json(
        { error: "Código inválido ou expirado" },
        { status: 400 }
      );
    }

    await prisma.verificationCode.delete({ where: { id: validCode.id } });

    if (!chavePix) {
      return NextResponse.json(
        { error: "userId e chavePix são obrigatórios" },
        { status: 400 }
      );
    }

    const fotografo = await prisma.fotografo.findUnique({
      where: { userId: targetUserId },
    });

    if (!fotografo) {
      return NextResponse.json(
        { error: "Fotógrafo não encontrado" },
        { status: 404 }
      );
    }

    const updatedFotografo = await prisma.fotografo.update({
      where: { userId: targetUserId },
      data: {
        chavePix,
        cpf: chavePix,
      },
    });

    return NextResponse.json({ success: true, data: updatedFotografo });
  } catch (error) {
    console.error("Error updating PIX key:", error);
    return NextResponse.json(
      {
        error: "Erro ao atualizar chave PIX",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

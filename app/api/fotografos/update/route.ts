import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function PUT(request: Request) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = (await request.json()) as {
      bio?: string;
      telefone?: string;
      cidade?: string;
      estado?: string;
      instagram?: string;
      cpf?: string;
      portfolioUrl?: string;
      equipamentos?: string;
      especialidades?: string[];
    };
    const userId = user.id;

    const existingPhotographer = await prisma.fotografo.findUnique({
      where: { userId },
    });

    if (!existingPhotographer) {
      return NextResponse.json(
        { error: "Perfil de fotógrafo não encontrado" },
        { status: 404 }
      );
    }

    const updatedPhotographer = await prisma.fotografo.update({
      where: { userId },
      data: {
        bio: body.bio,
        telefone: body.telefone,
        cidade: body.cidade,
        estado: body.estado,
        instagram: body.instagram,
        cpf: body.cpf,
        portfolioUrl: body.portfolioUrl,
        equipamentos: body.equipamentos,
        especialidades: body.especialidades,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedPhotographer,
    });
  } catch (error) {
    console.error("Error updating photographer:", error);
    return NextResponse.json(
      {
        error: "Erro ao atualizar perfil",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

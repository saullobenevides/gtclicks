import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function POST(request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      cidade, 
      estado, 
      instagram, 
      portfolioUrl, 
      bio, 
      especialidades, 
      equipamentos, 
      cpf, 
      chavePix 
    } = body;

    // Validate CPF (Basic check)
    if (!cpf || cpf.length < 11) {
       return NextResponse.json({ error: "CPF inválido" }, { status: 400 });
    }

    // Update Fotografo profile
    const fotografo = await prisma.fotografo.update({
      where: { userId: user.id },
      data: {
        cidade: cidade,
        estado: estado,
        instagram: instagram,
        portfolioUrl: portfolioUrl,
        bio: bio,
        especialidades: especialidades, // Array
        equipamentos: equipamentos,
        cpf: cpf,
        chavePix: chavePix
      },
    });

    return NextResponse.json({ success: true, fotografo });

  } catch (error) {
    console.error("Onboarding Error:", error);
    return NextResponse.json(
      { error: "Erro ao salvar dados de onboarding", details: error.message }, 
      { status: 500 }
    );
  }
}

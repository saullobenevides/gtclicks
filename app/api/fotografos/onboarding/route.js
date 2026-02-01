import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { fotografoOnboardingBodySchema } from "@/lib/validations";

/**
 * Atualização de perfil do fotógrafo (já existente).
 * Onboarding inicial usa POST /api/fotografos/create. Ver FLUXO_AUTH_CADASTRO.md.
 */
export async function POST(request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const rawBody = await request.json();
    const parseResult = fotografoOnboardingBodySchema.safeParse(rawBody);
    if (!parseResult.success) {
      const first = parseResult.error.flatten().fieldErrors;
      const message =
        Object.values(first)[0]?.[0] ||
        parseResult.error.message ||
        "Dados inválidos";
      return NextResponse.json({ error: message }, { status: 400 });
    }
    const body = parseResult.data;
    const {
      cidade,
      estado,
      instagram,
      portfolioUrl,
      bio,
      especialidades,
      equipamentos,
      cpf,
      chavePix,
    } = body;

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
        chavePix: chavePix,
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

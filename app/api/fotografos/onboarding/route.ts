import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { fotografoOnboardingBodySchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser({ requireEmailVerified: true });
    if (!user) {
      return NextResponse.json(
        {
          error:
            "Verifique seu email antes de continuar. Acesse as configurações da conta.",
        },
        { status: 403 }
      );
    }

    const rawBody = (await request.json()) as unknown;
    const parseResult = fotografoOnboardingBodySchema.safeParse(rawBody);
    if (!parseResult.success) {
      const first = parseResult.error.flatten().fieldErrors;
      const message =
        (Object.values(first)[0] as string[] | undefined)?.[0] ??
        parseResult.error.message ??
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
    } = body;

    // chavePix removido: deve ser cadastrada na página Financeiro com 2FA
    const fotografo = await prisma.fotografo.update({
      where: { userId: user.id },
      data: {
        cidade: cidade ?? undefined,
        estado: estado ?? undefined,
        instagram: instagram ?? undefined,
        portfolioUrl: portfolioUrl ?? undefined,
        bio: bio ?? undefined,
        especialidades: especialidades ?? undefined,
        equipamentos: equipamentos ?? undefined,
        cpf: cpf ?? undefined,
      },
    });

    return NextResponse.json({ success: true, fotografo });
  } catch (error) {
    console.error("Onboarding Error:", error);
    return NextResponse.json(
      {
        error: "Erro ao salvar dados de onboarding",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { fotografoCreateBodySchema } from "@/lib/validations";

function generateUniqueUsername(baseName: string): string {
  let username = baseName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");

  const randomSuffix = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `@${username}_${randomSuffix}`;
}

export async function POST(request: Request) {
  try {
    let authUser;
    try {
      authUser = await getAuthenticatedUser({ requireEmailVerified: true });
    } catch (authError) {
      console.error("[fotografos/create] Auth error:", authError);
      return NextResponse.json(
        {
          error: "Erro de autenticação",
          details:
            authError instanceof Error ? authError.message : String(authError),
        },
        { status: 500 }
      );
    }

    if (!authUser) {
      return NextResponse.json(
        {
          error:
            "Verifique seu email antes de criar perfil de fotógrafo. Acesse as configurações da conta.",
        },
        { status: 403 }
      );
    }
    const userId = authUser.id;

    const rawBody = (await request.json()) as unknown;
    const parseResult = fotografoCreateBodySchema.safeParse(rawBody);
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
      name,
      email,
      username,
      bio,
      telefone,
      cidade,
      estado,
      instagram,
      chavePix,
    } = body;

    let existing;
    try {
      existing = await prisma.fotografo.findUnique({
        where: { userId },
      });
    } catch (dbError) {
      console.error(
        "[fotografos/create] DB error checking fotografo:",
        dbError
      );
      return NextResponse.json(
        {
          error: "Erro de banco de dados",
          details: dbError instanceof Error ? dbError.message : String(dbError),
        },
        { status: 500 }
      );
    }

    if (existing) {
      return NextResponse.json({
        data: {
          id: existing.id,
          userId: existing.userId,
          username: existing.username,
        },
      });
    }

    let user;
    try {
      user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            id: userId,
            name: name ?? "Fotógrafo",
            email: email ?? `${userId}@gtclicks.temp`,
            role: "FOTOGRAFO",
          },
        });
      } else {
        await prisma.user.update({
          where: { id: userId },
          data: { role: "FOTOGRAFO" },
        });
      }
    } catch (userError) {
      console.error("[fotografos/create] DB error with user:", userError);
      return NextResponse.json(
        {
          error: "Erro ao criar/atualizar usuário",
          details:
            userError instanceof Error ? userError.message : String(userError),
        },
        { status: 500 }
      );
    }

    let finalUsername = username;
    if (!finalUsername) {
      const baseName = name ?? email?.split("@")[0] ?? "fotografo";
      finalUsername = generateUniqueUsername(baseName);
      let attempt = 0;
      while (attempt < 10) {
        const usernameExists = await prisma.fotografo.findUnique({
          where: { username: finalUsername },
        });
        if (!usernameExists) break;
        finalUsername = generateUniqueUsername(baseName);
        attempt++;
      }
      if (attempt >= 10) {
        throw new Error("Não foi possível gerar um username único");
      }
    } else {
      if (finalUsername.startsWith("@")) {
        finalUsername = finalUsername.substring(1);
      }
      finalUsername = finalUsername.toLowerCase().trim();

      const usernameTaken = await prisma.fotografo.findUnique({
        where: { username: finalUsername },
      });
      if (usernameTaken) {
        return NextResponse.json(
          {
            error: "Este username já está em uso",
            details: `"${finalUsername}" não está disponível. Escolha outro.`,
          },
          { status: 409 }
        );
      }
    }

    let fotografo;
    try {
      fotografo = await prisma.fotografo.create({
        data: {
          userId,
          username: finalUsername,
          bio: bio ?? "Fotógrafo profissional",
          telefone: telefone ?? undefined,
          cidade,
          estado,
          instagram: instagram ?? undefined,
          chavePix: chavePix ?? undefined,
        },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });
    } catch (createError) {
      console.error(
        "[fotografos/create] DB error creating fotografo:",
        createError
      );
      return NextResponse.json(
        {
          error: "Erro ao criar perfil",
          details:
            createError instanceof Error
              ? createError.message
              : String(createError),
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: {
        id: fotografo.id,
        userId: fotografo.userId,
        username: fotografo.username,
        nome: fotografo.user?.name ?? null,
        email: fotografo.user?.email ?? null,
        telefone: fotografo.telefone,
        cidade: fotografo.cidade,
        estado: fotografo.estado,
      },
    });
  } catch (error) {
    console.error("[fotografos/create] Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Erro inesperado",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

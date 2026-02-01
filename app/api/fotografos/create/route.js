import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { fotografoCreateBodySchema } from "@/lib/validations";

function generateUniqueUsername(baseName) {
  // Remove special chars and normalize
  let username = baseName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");

  // Add random suffix
  const randomSuffix = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `@${username}_${randomSuffix}`;
}

export async function POST(request) {
  try {
    // Step 1: Authentication
    let authUser;
    try {
      authUser = await getAuthenticatedUser();
    } catch (authError) {
      console.error("[fotografos/create] Auth error:", authError);
      return NextResponse.json(
        { error: "Erro de autenticação", details: authError.message },
        { status: 500 }
      );
    }

    if (!authUser) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const userId = authUser.id;
    console.log("[fotografos/create] User authenticated:", userId);

    const rawBody = await request.json();
    const parseResult = fotografoCreateBodySchema.safeParse(rawBody);
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

    // Step 2: Check if photographer already exists
    console.log("[fotografos/create] Checking existing fotografo...");
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
        { error: "Erro de banco de dados", details: dbError.message },
        { status: 500 }
      );
    }

    if (existing) {
      console.log("[fotografos/create] Fotografo already exists:", existing.id);
      return NextResponse.json({
        data: {
          id: existing.id,
          userId: existing.userId,
          username: existing.username,
        },
      });
    }

    // Step 3: Verify or create user in Prisma
    console.log("[fotografos/create] Checking/creating user...");
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        // Create user in Prisma to sync with Stack Auth
        user = await prisma.user.create({
          data: {
            id: userId,
            name: name || "Fotógrafo",
            email: email || `${userId}@gtclicks.temp`,
            role: "FOTOGRAFO",
          },
        });
        console.log("[fotografos/create] User created:", user.id);
      } else {
        // Upgrade existing user to FOTOGRAFO
        await prisma.user.update({
          where: { id: userId },
          data: { role: "FOTOGRAFO" },
        });
        console.log("[fotografos/create] User upgraded to FOTOGRAFO");
      }
    } catch (userError) {
      console.error("[fotografos/create] DB error with user:", userError);
      return NextResponse.json(
        {
          error: "Erro ao criar/atualizar usuário",
          details: userError.message,
        },
        { status: 500 }
      );
    }

    // Process username (use provided or generate)
    let finalUsername = username;
    if (!finalUsername) {
      // Generate unique username fallback
      const baseName = name || email?.split("@")[0] || "fotografo";
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
      if (attempt >= 10)
        throw new Error("Não foi possível gerar um username único");
    } else {
      // Remove @ if present
      if (finalUsername.startsWith("@"))
        finalUsername = finalUsername.substring(1);
    }

    // Step 4: Create photographer profile with full details
    console.log(
      "[fotografos/create] Creating fotografo with username:",
      finalUsername
    );
    let fotografo;
    try {
      fotografo = await prisma.fotografo.create({
        data: {
          userId,
          username: finalUsername,
          bio: bio || "Fotógrafo profissional",
          telefone,
          cidade,
          estado,
          instagram,
          chavePix,
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
        { error: "Erro ao criar perfil", details: createError.message },
        { status: 500 }
      );
    }

    console.log(
      "[fotografos/create] Fotografo created successfully:",
      fotografo.id
    );
    return NextResponse.json({
      data: {
        id: fotografo.id,
        userId: fotografo.userId,
        username: fotografo.username,
        nome: fotografo.user?.name,
        email: fotografo.user?.email,
        telefone: fotografo.telefone,
        cidade: fotografo.cidade,
        estado: fotografo.estado,
      },
    });
  } catch (error) {
    console.error("[fotografos/create] Unexpected error:", error);
    return NextResponse.json(
      { error: "Erro inesperado", details: error.message },
      { status: 500 }
    );
  }
}

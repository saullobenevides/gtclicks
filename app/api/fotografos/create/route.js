import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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
  const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `@${username}_${randomSuffix}`;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, name, email, username, bio, telefone, cidade, estado, instagram, chavePix } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId é obrigatório" },
        { status: 400 }
      );
    }

    // Check if photographer already exists
    const existing = await prisma.fotografo.findUnique({
      where: { userId },
    });

    if (existing) {
      return NextResponse.json({
        data: {
          id: existing.id,
          userId: existing.userId,
          username: existing.username,
        },
      });
    }

    // Verify or create user in Prisma
    let user = await prisma.user.findUnique({
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
    } else {
        // Upgrade existing user to FOTOGRAFO
        await prisma.user.update({
            where: { id: userId },
            data: { role: "FOTOGRAFO" }
        });
    }

    // Process username (use provided or generate)
    let finalUsername = username;
    if (!finalUsername) {
         // Generate unique username fallback
         const baseName = name || email?.split("@")[0] || "fotografo";
         finalUsername = generateUniqueUsername(baseName);
         let attempt = 0;
         while (attempt < 10) {
            const usernameExists = await prisma.fotografo.findUnique({ where: { username: finalUsername } });
            if (!usernameExists) break;
            finalUsername = generateUniqueUsername(baseName);
            attempt++;
         }
         if (attempt >= 10) throw new Error("Não foi possível gerar um username único");
    } else {
        // Remove @ if present
        if (finalUsername.startsWith('@')) finalUsername = finalUsername.substring(1);
    }

    // Create photographer profile with full details
    const fotografo = await prisma.fotografo.create({
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

    return NextResponse.json({
      data: {
        id: fotografo.id,
        userId: fotografo.userId,
        username: fotografo.username,
        nome: fotografo.user?.name,
        email: fotografo.user?.email,
        telefone: fotografo.telefone,
        cidade: fotografo.cidade,
        estado: fotografo.estado
      },
    });
  } catch (error) {
    console.error("Erro ao criar fotógrafo:", error);
    return NextResponse.json(
      { error: "Erro ao criar perfil de fotógrafo", details: error.message },
      { status: 500 }
    );
  }
}
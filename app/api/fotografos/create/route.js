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
    const { userId, name, email } = body;

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
    // Stack Auth manages users separately, so we need to sync them
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
    }

    // Generate unique username
    const baseName = name || email?.split("@")[0] || "fotografo";
    let username = generateUniqueUsername(baseName);
    
    // Ensure username is truly unique
    let attempt = 0;
    while (attempt < 10) {
      const usernameExists = await prisma.fotografo.findUnique({
        where: { username },
      });
      
      if (!usernameExists) break;
      
      username = generateUniqueUsername(baseName);
      attempt++;
    }

    if (attempt >= 10) {
      return NextResponse.json(
        { error: "Não foi possível gerar um username único" },
        { status: 500 }
      );
    }

    // Create photographer profile
    const fotografo = await prisma.fotografo.create({
      data: {
        userId,
        username,
        bio: "Fotógrafo profissional",
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

    return NextResponse.json({
      data: {
        id: fotografo.id,
        userId: fotografo.userId,
        username: fotografo.username,
        nome: fotografo.user?.name,
        email: fotografo.user?.email,
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

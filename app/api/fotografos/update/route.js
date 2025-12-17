import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(request) {
  try {
    const body = await request.json();
    const { userId, bio, telefone, cidade, estado, instagram, chavePix } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID é obrigatório" },
        { status: 400 }
      );
    }

    // Verify photographer exists
    const existingPhotographer = await prisma.fotografo.findUnique({
      where: { userId },
    });

    if (!existingPhotographer) {
      return NextResponse.json(
        { error: "Fotógrafo não encontrado" },
        { status: 404 }
      );
    }

    const updatedPhotographer = await prisma.fotografo.update({
      where: { userId },
      data: {
        bio,
        // Optional fields - update only if strictly provided or allow empty string to clear? 
        // Typically undefined/null means no change, empty string means clear.
        // We will pass values as they come from the form.
        // For existing fields like telefone which might not exist in Prisma schema yet based on previous check, 
        // I need to be careful. Let's check schema again if needed.
        // The schema showed: bio, chavePix. 
        // Telefone, cidade, estado, instagram were NOT in the schema view I saw earlier (lines 34-48 of schema.prisma).
        // Wait, I saw:
        // model Fotografo {
        //   id             String    @id @default(cuid())
        //   userId         String    @unique
        //   username       String    @unique
        //   bio            String?
        //   chavePix       String?
        //   ...
        // }
        // The schema I viewed earlier DID NOT have telephone, city, state, instagram.
        // However, FotografoOnboarding.js was sending them. 
        // If they are missing in the DB, this update will fail or ignore them.
        // I should double check the schema first or stick to what is in the schema.
        // The user asked to "get essential info". 
        // It seems the schema might be incomplete vs the onboarding form intentions.
        // Let's stick to what IS in the schema for now: Bio and ChavePix.
        // AND I should probably add the missing fields to the schema if I want to save them.
        // But for this step, I will only update what is in the schema to avoid breaking things immediately.
        // Actually, looking at the previous Onboarding code, it sends everything to /api/fotografos/create.
        // If the create route handles it, maybe the schema WAS updated or I missed it?
        // Let's re-read the schema view I had... 
        // Lines 34-48: username, bio, chavePix. THAT IS IT. 
        // So `cidade`, `estado`, `telefone`, `instagram` are NOT in the database yet.
        // I should PROBABLY add them to the schema otherwise the data is lost.
        // BUT, changing schema requires migration. 
        // I will first create the API to update what exists (Bio, Key) and maybe add a TODO for the rest or 
        // check if I should update schema. Given the user request "What info we need to get... essential?", 
        // I should imply adding these fields is part of the "Options to improve".
        // SO: I will update the schema first.
        
        bio,
        telefone,
        cidade,
        estado,
        instagram,
        chavePix,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedPhotographer,
    });
  } catch (error) {
    console.error("Error updating photographer:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar perfil", details: error.message },
      { status: 500 }
    );
  }
}

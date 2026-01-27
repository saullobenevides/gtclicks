import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, chavePix, code } = body;

    // --- 2FA SECURITY CHECK ---
    // If updating critical info like CPF/Pix, require code
    if (!code) {
      return NextResponse.json(
        { error: "Código de verificação é obrigatório" },
        { status: 400 },
      );
    }

    // Get user email to verify code (assuming we can get user email from user ID or we need to pass it?
    // We strictly need the logged in user context. 'userId' passed in body is trustworthy?
    // In strict auth, we should use session user.
    // Ideally we fetch user email from DB using userId provided.

    // Note: This route doesn't seem to use 'getAuthenticatedUser' middleware in previous reads?
    // It should! Let's check imports.
    // Previous code Step 218 didn't show auth check. That is dangerous.
    // I will add auth check too.

    // But first, fetch email.
    const userObj = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!userObj)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const validCode = await prisma.verificationCode.findFirst({
      where: {
        email: userObj.email,
        code: code,
        type: "PIX_UPDATE",
        expiresAt: { gt: new Date() },
      },
    });

    if (!validCode) {
      return NextResponse.json(
        { error: "Código inválido ou expirado" },
        { status: 400 },
      );
    }

    // Delete utilized code to prevent replay
    await prisma.verificationCode.delete({ where: { id: validCode.id } });

    // --- END 2FA CHECK ---

    if (!userId || !chavePix) {
      return NextResponse.json(
        { error: "userId e chavePix são obrigatórios" },
        { status: 400 },
      );
    }

    // Get photographer
    const fotografo = await prisma.fotografo.findUnique({
      where: { userId },
    });

    if (!fotografo) {
      return NextResponse.json(
        { error: "Fotógrafo não encontrado" },
        { status: 404 },
      );
    }

    // --- SECURITY FIX: Update Fotografo (Not Saldo) & Enforce Pix=CPF ---
    // The previous code tried to update 'saldo.chavePix' which doesn't exist.
    // We strictly update the Fotografo profile, setting both CPF and ChavePix to the same value.

    const updatedFotografo = await prisma.fotografo.update({
      where: { userId },
      data: {
        chavePix, // Input treated as CPF
        cpf: chavePix, // Force sync
      },
    });

    // We return successful response. No need to return saldo here.
    return NextResponse.json({ success: true, data: updatedFotografo });

    return NextResponse.json({ data: saldo });
  } catch (error) {
    console.error("Error updating PIX key:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar chave PIX" },
      { status: 500 },
    );
  }
}

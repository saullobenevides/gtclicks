import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { createAccountSession } from "@/lib/stripe";

/**
 * POST /api/fotografos/stripe-connect/account-session
 * Retorna client_secret para Connect Embedded Components (onboarding, balances, etc).
 * Body opcional: { components: { account_onboarding: { enabled: true }, ... } }
 */
export async function POST(request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const fotografo = await prisma.fotografo.findUnique({
      where: { userId: user.id },
    });

    if (!fotografo) {
      return NextResponse.json(
        { error: "Perfil de fotógrafo não encontrado" },
        { status: 404 }
      );
    }

    if (!fotografo.stripeAccountId) {
      return NextResponse.json(
        { error: "Conta Stripe não criada. Chame create-account primeiro." },
        { status: 400 }
      );
    }

    let components = { account_onboarding: { enabled: true } };
    try {
      const body = await request.json();
      if (body?.components && typeof body.components === "object") {
        components = body.components;
      }
    } catch {
      // Usar default
    }

    const { clientSecret } = await createAccountSession(
      fotografo.stripeAccountId,
      components
    );

    return NextResponse.json({ clientSecret });
  } catch (error) {
    console.error("[stripe-connect account-session]", error);
    return NextResponse.json(
      {
        error: error?.message || "Erro ao criar sessão. Tente novamente.",
      },
      { status: 500 }
    );
  }
}

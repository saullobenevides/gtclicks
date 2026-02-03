import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { createConnectAccount } from "@/lib/stripe";

/**
 * POST /api/fotografos/stripe-connect/create-account
 * Cria uma conta Stripe Connect Express para o fotógrafo autenticado.
 */
export async function POST() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const fotografo = await prisma.fotografo.findUnique({
      where: { userId: user.id },
      include: { user: { select: { email: true } } },
    });

    if (!fotografo) {
      return NextResponse.json(
        { error: "Perfil de fotógrafo não encontrado" },
        { status: 404 }
      );
    }

    if (fotografo.stripeAccountId) {
      return NextResponse.json(
        {
          error: "Conta Stripe já configurada",
          stripeAccountId: fotografo.stripeAccountId,
        },
        { status: 400 }
      );
    }

    const account = await createConnectAccount({
      email: fotografo.user.email,
      businessName: fotografo.username || fotografo.user.name,
      username: fotografo.username,
    });

    await prisma.fotografo.update({
      where: { id: fotografo.id },
      data: {
        stripeAccountId: account.id,
        stripeOnboarded: false,
      },
    });

    return NextResponse.json({
      stripeAccountId: account.id,
      message: "Conta criada. Prossiga com o onboarding.",
    });
  } catch (error) {
    console.error("[stripe-connect create-account]", error);
    return NextResponse.json(
      {
        error: error?.message || "Erro ao criar conta Stripe. Tente novamente.",
      },
      { status: 500 }
    );
  }
}

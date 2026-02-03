import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { stripe } from "@/lib/stripe";

/**
 * GET /api/fotografos/stripe-connect/status
 * Verifica status da conta Connect (charges_enabled, payouts_enabled).
 */
export async function GET() {
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
      return NextResponse.json({
        hasAccount: false,
        stripeOnboarded: false,
      });
    }

    const account = await stripe.accounts.retrieve(fotografo.stripeAccountId);
    const chargesEnabled = account.charges_enabled === true;
    const payoutsEnabled = account.payouts_enabled === true;
    const detailsSubmitted = account.details_submitted === true;

    if (chargesEnabled && payoutsEnabled && !fotografo.stripeOnboarded) {
      await prisma.fotografo.update({
        where: { id: fotografo.id },
        data: { stripeOnboarded: true },
      });
    }

    return NextResponse.json({
      hasAccount: true,
      stripeOnboarded:
        fotografo.stripeOnboarded || (chargesEnabled && payoutsEnabled),
      chargesEnabled,
      payoutsEnabled,
      detailsSubmitted,
    });
  } catch (error) {
    console.error("[stripe-connect status]", error);
    return NextResponse.json(
      { error: error?.message || "Erro ao verificar status" },
      { status: 500 }
    );
  }
}

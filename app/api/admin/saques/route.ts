import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { getAsaasBalance, isAsaasConfigured } from "@/lib/asaas";

export async function GET() {
  const user = await getAuthenticatedUser();

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Acesso não autorizado" },
      { status: 403 }
    );
  }

  try {
    const saques = await prisma.solicitacaoSaque.findMany({
      include: {
        fotografo: {
          select: { id: true, username: true },
        },
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    });

    let asaasBalance: number | null = null;
    let asaasBalanceError: string | null = null;

    if (isAsaasConfigured()) {
      const balanceResult = await getAsaasBalance();
      if (balanceResult.success && typeof balanceResult.balance === "number") {
        asaasBalance = balanceResult.balance;
      } else if (balanceResult.error) {
        asaasBalanceError = balanceResult.error;
      }
    }

    return NextResponse.json({
      data: saques,
      asaasBalance,
      asaasBalanceError,
    });
  } catch (error) {
    console.error("Error fetching withdrawals:", error);
    return NextResponse.json(
      { error: "Erro ao buscar saques" },
      { status: 500 }
    );
  }
}

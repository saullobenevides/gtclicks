import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET() {
  // Verify admin access
  const user = await getAuthenticatedUser();

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Acesso não autorizado" },
      { status: 403 },
    );
  }

  try {
    const saques = await prisma.solicitacaoSaque.findMany({
      include: {
        fotografo: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: [
        { status: "asc" }, // PENDENTE first
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ data: saques });
  } catch (error) {
    console.error("Error fetching withdrawals:", error);
    return NextResponse.json(
      { error: "Erro ao buscar saques" },
      { status: 500 },
    );
  }
}

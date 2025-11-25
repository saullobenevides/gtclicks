import { NextResponse } from "next/server";
import { stackServerApp } from "@/stack/server";
import prisma from "@/lib/prisma";

export async function GET() {
  // Verify admin access
  const user = await stackServerApp.getUser();
  
  if (!user) {
    return NextResponse.json(
      { error: "Não autenticado" },
      { status: 401 }
    );
  }

  // Check if user is admin (you can customize this check)
  // For now, we'll check if user has a specific role or email
  const isAdmin = user.serverMetadata?.role === "ADMIN" || 
                  user.primaryEmail?.endsWith("@gtclicks.com");

  if (!isAdmin) {
    return NextResponse.json(
      { error: "Acesso não autorizado" },
      { status: 403 }
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
        { status: 'asc' }, // PENDENTE first
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({ data: saques });
  } catch (error) {
    console.error("Error fetching withdrawals:", error);
    return NextResponse.json(
      { error: "Erro ao buscar saques" },
      { status: 500 }
    );
  }
}

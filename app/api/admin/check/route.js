import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";

/**
 * Verifica se o usuário autenticado (via sessão/cookies) é ADMIN.
 * Usa a sessão do servidor - não depende do useUser() no cliente.
 */
export async function GET() {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }

    return NextResponse.json({
      isAdmin: user.role === "ADMIN",
    });
  } catch (error) {
    console.error("[API /admin/check] Error:", error);
    return NextResponse.json(
      { isAdmin: false, error: "Erro ao verificar permissão" },
      { status: 500 }
    );
  }
}

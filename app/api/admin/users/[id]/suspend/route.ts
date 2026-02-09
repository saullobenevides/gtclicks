import { NextResponse } from "next/server";
import { requireAdmin, logAdminActivity } from "@/lib/admin/permissions";
import prisma from "@/lib/prisma";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await context.params;
    const body = (await request.json()) as { reason?: string };
    const { reason } = body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        isActive: false,
        suspendedAt: new Date(),
        suspendedBy: admin.id,
        adminNotes: reason || "Sem motivo especificado",
      },
    });

    await logAdminActivity(admin.id, "USER_SUSPENDED", "User", id, {
      userName: user.name,
      userEmail: user.email,
      reason,
    });

    return NextResponse.json({
      success: true,
      message: "Usuário suspenso com sucesso",
    });
  } catch (error) {
    console.error("Error suspending user:", error);
    return NextResponse.json(
      { error: "Erro ao suspender usuário" },
      { status: 500 }
    );
  }
}

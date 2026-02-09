import { NextResponse } from "next/server";
import { requireAdminApi, logAdminActivity } from "@/lib/admin/permissions";
import prisma from "@/lib/prisma";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  try {
    const { id } = await context.params;
    const body = (await request.json()) as { reason?: string };
    const reason = body?.reason?.trim();

    if (!reason) {
      return NextResponse.json(
        { error: "O motivo da rejeição é obrigatório" },
        { status: 400 }
      );
    }

    const collection = await prisma.colecao.update({
      where: { id },
      data: {
        status: "RASCUNHO",
      },
      include: { fotografo: { select: { userId: true } } },
    });

    await logAdminActivity(auth.admin.id, "COLLECTION_REJECTED", "Collection", id, {
      collectionName: collection.nome,
      reason,
    });

    try {
      const { createNotification } = await import("@/actions/notifications");
      const { NotificationType } = await import("@/lib/constants");

      await createNotification({
        userId: collection.fotografo.userId,
        title: "❌ Coleção rejeitada",
        message: `Sua coleção "${collection.nome}" foi rejeitada. Motivo: ${reason}. Faça os ajustes e envie novamente.`,
        type: NotificationType.ERROR,
        link: `/dashboard/fotografo/colecoes/${id}/editar`,
      });
    } catch (nErr) {
      console.error("Failed to send collection rejection notification:", nErr);
    }

    return NextResponse.json({
      success: true,
      message: "Coleção rejeitada e fotógrafo notificado",
    });
  } catch (error) {
    console.error("Error rejecting collection:", error);
    return NextResponse.json(
      { error: "Erro ao rejeitar coleção" },
      { status: 500 }
    );
  }
}

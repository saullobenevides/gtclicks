import { NextResponse } from "next/server";
import { requireAdmin, logAdminActivity } from "@/lib/admin/permissions";
import prisma from "@/lib/prisma";

export async function POST(request, { params }) {
  try {
    const admin = await requireAdmin();
    const { id } = params;
    const body = await request.json();
    const { reason } = body;

    // Update collection status to RASCUNHO (back to draft)
    const collection = await prisma.colecao.update({
      where: { id },
      data: {
        status: "RASCUNHO",
        reviewedAt: new Date(),
        reviewedBy: admin.id,
        rejectionReason: reason || "Não especificado",
      },
      include: { fotografo: { select: { userId: true } } },
    });

    // Log activity
    await logAdminActivity(admin.id, "COLLECTION_REJECTED", "Collection", id, {
      collectionName: collection.nome,
      reason,
    });

    // --- NOTIFICATION: Collection Rejected ---
    try {
      const { createNotification } = await import("@/actions/notifications");
      const { NotificationType } = await import("@/lib/constants");

      await createNotification({
        userId: collection.fotografo.userId,
        title: "❌ Coleção rejeitada",
        message: `Sua coleção "${collection.nome}" foi rejeitada. Motivo: ${reason || "Não especificado"}. Faça os ajustes e envie novamente.`,
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
      { status: 500 },
    );
  }
}

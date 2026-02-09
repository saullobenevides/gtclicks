import { NextResponse } from "next/server";
import { requireAdminApi, logAdminActivity } from "@/lib/admin/permissions";
import prisma from "@/lib/prisma";
import { invalidate } from "@/lib/cache";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  try {
    const { id } = await context.params;

    // Update collection status to PUBLICADA (approved = published)
    const collection = await prisma.colecao.update({
      where: { id },
      data: {
        status: "PUBLICADA",
      },
      include: { fotografo: { select: { userId: true } } },
    });

    // Log activity
    await logAdminActivity(auth.admin.id, "COLLECTION_APPROVED", "Collection", id, {
      collectionName: collection.nome,
    });

    await invalidate("homepage:*");
    await invalidate("marketplace:distinct-cities");
    await invalidate("marketplace:distinct-photographer-cities");
    await invalidate("search:*");

    // --- NOTIFICATION: Collection Approved ---
    try {
      const { createNotification } = await import("@/actions/notifications");
      const { NotificationType } = await import("@/lib/constants");

      await createNotification({
        userId: collection.fotografo.userId,
        title: "✅ Coleção aprovada!",
        message: `Sua coleção "${collection.nome}" foi aprovada e já está pública para venda.`,
        type: NotificationType.SUCCESS,
        link: `/dashboard/fotografo/colecoes/${id}`,
      });
    } catch (nErr) {
      console.error("Failed to send collection approval notification:", nErr);
    }

    return NextResponse.json({
      success: true,
      message: "Coleção aprovada com sucesso",
    });
  } catch (error) {
    console.error("Error approving collection:", error);
    return NextResponse.json(
      { error: "Erro ao aprovar coleção" },
      { status: 500 }
    );
  }
}

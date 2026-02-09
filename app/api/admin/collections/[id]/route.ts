import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdminApi, logAdminActivity } from "@/lib/admin/permissions";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  try {
    const { id } = await context.params;
    let reason: string | undefined;
    try {
      const body = (await request.json()) as { reason?: string } | null;
      reason = body?.reason?.trim();
    } catch {
      // DELETE sem body
    }

    const collection = await prisma.colecao.findUnique({
      where: { id },
      include: { fotografo: { select: { userId: true } } },
    });

    if (!collection) {
      return NextResponse.json(
        { error: "Coleção não encontrada" },
        { status: 404 }
      );
    }

    const nome = collection.nome;
    const userId = collection.fotografo.userId;

    await prisma.colecao.delete({
      where: { id },
    });

    await logAdminActivity(auth.admin.id, "COLLECTION_DELETED", "Collection", id, {
      collectionName: nome,
      reason: reason ?? undefined,
    });

    try {
      const { createNotification } = await import("@/actions/notifications");
      const { NotificationType } = await import("@/lib/constants");

      const message = reason
        ? `Sua coleção "${nome}" foi removida da plataforma. Motivo: ${reason}.`
        : `Sua coleção "${nome}" foi removida da plataforma.`;

      await createNotification({
        userId,
        title: "🗑️ Coleção removida",
        message,
        type: NotificationType.ERROR,
        link: `/dashboard/fotografo/colecoes`,
      });
    } catch (nErr) {
      console.error("Failed to send collection deletion notification:", nErr);
    }

    return NextResponse.json({
      success: true,
      message: "Coleção excluída e fotógrafo notificado",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[API /admin/collections/delete] Error:", error);
    return NextResponse.json(
      {
        error: "Erro ao excluir coleção",
        ...(process.env.NODE_ENV === "development" && { message }),
      },
      { status: 500 }
    );
  }
}

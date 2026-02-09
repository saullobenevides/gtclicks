import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdminApi, logAdminActivity } from "@/lib/admin/permissions";

export async function POST(
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
      // POST sem body
    }

    const collection = await prisma.colecao.update({
      where: { id },
      data: { status: "RASCUNHO" },
      include: { fotografo: { select: { userId: true } } },
    });

    await logAdminActivity(auth.admin.id, "COLLECTION_SUSPENDED", "Collection", id, {
      collectionName: collection.nome,
      reason: reason ?? undefined,
    });

    try {
      const { createNotification } = await import("@/actions/notifications");
      const { NotificationType } = await import("@/lib/constants");

      const message = reason
        ? `Sua coleção "${collection.nome}" foi suspensa. Motivo: ${reason}. Você pode editar e reenviar para aprovação.`
        : `Sua coleção "${collection.nome}" foi suspensa. Você pode editar e reenviar para aprovação.`;

      await createNotification({
        userId: collection.fotografo.userId,
        title: "⚠️ Coleção suspensa",
        message,
        type: NotificationType.WARNING,
        link: `/dashboard/fotografo/colecoes/${id}/editar`,
      });
    } catch (nErr) {
      console.error("Failed to send collection suspension notification:", nErr);
    }

    return NextResponse.json({
      success: true,
      message: "Coleção suspensa e fotógrafo notificado",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[API /admin/collections/suspend] Error:", error);
    return NextResponse.json(
      {
        error: "Erro ao suspender coleção",
        ...(process.env.NODE_ENV === "development" && { message }),
      },
      { status: 500 }
    );
  }
}

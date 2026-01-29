"use server";

/**
 * Server Actions para Notificações
 */

import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { NotificationType } from "@/lib/constants";

/**
 * Busca notificações do usuário atual
 */
export async function getNotifications(options?: { unreadOnly?: boolean }) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return { data: [] };
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId: user.id,
        ...(options?.unreadOnly ? { read: false } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return { success: true, data: notifications };
  } catch (error) {
    console.error("[Action] getNotifications error:", error);
    return { error: "Erro ao buscar notificações" };
  }
}

/**
 * Conta notificações não lidas
 */
export async function getUnreadCount() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return { data: 0 };
  }

  try {
    const count = await prisma.notification.count({
      where: { userId: user.id, read: false },
    });

    return { success: true, data: count };
  } catch (error) {
    console.error("[Action] getUnreadCount error:", error);
    return { data: 0 };
  }
}

/**
 * Marca notificação como lida
 */
export async function markAsRead(notificationId: string) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return { error: "Não autorizado" };
  }

  try {
    await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId: user.id,
      },
      data: { read: true },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[Action] markAsRead error:", error);
    return { error: "Erro ao atualizar notificação" };
  }
}

/**
 * Marca todas as notificações como lidas
 */
export async function markAllAsRead() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return { error: "Não autorizado" };
  }

  try {
    await prisma.notification.updateMany({
      where: { userId: user.id, read: false },
      data: { read: true },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[Action] markAllAsRead error:", error);
    return { error: "Erro ao atualizar notificações" };
  }
}

/**
 * Cria uma notificação (uso interno/servidor)
 */
export async function createNotification(data: {
  userId: string;
  title: string;
  message: string;
  type?: string;
  link?: string;
}) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type || NotificationType.INFO,
        link: data.link,
      },
    });

    return { success: true, data: notification };
  } catch (error) {
    console.error("[Action] createNotification error:", error);
    return { error: "Erro ao criar notificação" };
  }
}

/**
 * Notifica fotógrafo sobre uma venda
 * Chamado pelo webhook de pagamentos
 */
export async function notifyPhotographerSale(data: {
  fotografoUserId: string;
  photoTitle: string;
  value: number;
  orderId: string;
}) {
  return createNotification({
    userId: data.fotografoUserId,
    title: "🎉 Nova venda!",
    message: `Você vendeu "${data.photoTitle}" por R$ ${data.value.toFixed(2)}`,
    type: NotificationType.SUCCESS,
    link: `/dashboard/fotografo/financeiro`,
  });
}

/**
 * Notifica cliente sobre aprovação de pedido
 */
export async function notifyOrderApproved(data: {
  userId: string;
  orderId: string;
}) {
  return createNotification({
    userId: data.userId,
    title: "✅ Pedido aprovado!",
    message:
      "Seu pagamento foi confirmado. Suas fotos já estão disponíveis para download.",
    type: NotificationType.SUCCESS,
    link: `/pedidos/${data.orderId}`,
  });
}

/**
 * Notifica fotógrafo sobre saque processado
 */
export async function notifyWithdrawalProcessed(data: {
  userId: string;
  value: number;
  status: "APROVADO" | "REJEITADO";
}) {
  const isApproved = data.status === "APROVADO";

  return createNotification({
    userId: data.userId,
    title: isApproved ? "💰 Saque processado!" : "❌ Saque rejeitado",
    message: isApproved
      ? `Seu saque de R$ ${data.value.toFixed(2)} foi processado e enviado para sua conta PIX.`
      : `Seu saque de R$ ${data.value.toFixed(2)} foi rejeitado. Verifique seus dados PIX.`,
    type: isApproved ? NotificationType.SUCCESS : NotificationType.ERROR,
    link: `/dashboard/fotografo/financeiro`,
  });
}

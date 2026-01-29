"use server";

import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { serializeModel, serializeDecimal } from "@/lib/serialization";
import { z } from "zod";

// --- Schemas ---

const updateAdminConfigSchema = z.object({
  minSaque: z.number().nonnegative().optional(),
  taxaPlataforma: z.number().min(0).max(100).optional(),
});

// --- Actions ---

/**
 * Busca estatísticas administrativas globais
 */
export async function getAdminStats() {
  const user = await getAuthenticatedUser();

  if (!user || user.role !== "ADMIN") {
    return { error: "Acesso negado: Admin requerido" };
  }

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalRevenueResult,
      activeUsersCount,
      ordersCount,
      collectionsCount,
      recentOrders,
    ] = await Promise.all([
      // Total revenue from paid orders
      prisma.pedido.aggregate({
        where: { status: "PAGO" },
        _sum: { total: true },
      }),
      // Active users
      prisma.user.count(),
      // Orders in last 30 days
      prisma.pedido.count({
        where: {
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      // Published collections
      prisma.colecao.count({
        where: { status: "PUBLICADA" },
      }),
      // Recent activity (last 5 orders)
      prisma.pedido.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { name: true, email: true },
          },
          itens: {
            select: { id: true },
          },
        },
      }),
    ]);

    const stats = {
      totalRevenue: serializeDecimal(totalRevenueResult._sum.total),
      activeUsers: activeUsersCount,
      ordersCount: ordersCount,
      collectionsCount: collectionsCount,
      recentActivity: recentOrders.map((order) => ({
        id: order.id,
        type: "order",
        description: `Pedido de ${order.user?.name || order.user?.email || "Usuário"}`,
        itemsCount: order.itens?.length || 0,
        total: serializeDecimal(order.total),
        status: order.status,
        createdAt: order.createdAt,
      })),
    };

    return { success: true, data: stats };
  } catch (error: any) {
    console.error("[getAdminStats] Error:", error.message);
    return { error: "Erro ao buscar estatísticas administrativas" };
  }
}

/**
 * Busca configurações do sistema
 */
export async function getAdminConfig() {
  const user = await getAuthenticatedUser();

  if (!user || user.role !== "ADMIN") {
    return { error: "Acesso negado: Admin requerido" };
  }

  try {
    const configs = await prisma.systemConfig.findMany();
    const configMap = configs.reduce(
      (acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      },
      {} as Record<string, string>,
    );

    return { success: true, data: configMap };
  } catch (error: any) {
    console.error("[getAdminConfig] Error:", error.message);
    return { error: "Erro ao buscar configurações" };
  }
}

/**
 * Atualiza configurações do sistema
 */
export async function updateAdminConfig(data: {
  minSaque?: number;
  taxaPlataforma?: number;
}) {
  const user = await getAuthenticatedUser();

  if (!user || user.role !== "ADMIN") {
    return { error: "Acesso negado: Admin requerido" };
  }

  const validation = updateAdminConfigSchema.safeParse(data);

  if (!validation.success) {
    return {
      error: "Dados inválidos",
      details: validation.error.flatten().fieldErrors,
    };
  }

  const validData = validation.data;

  try {
    const { setConfig, CONFIG_KEYS } = await import("@/lib/config");

    if (validData.minSaque !== undefined) {
      await setConfig(CONFIG_KEYS.MIN_SAQUE, validData.minSaque);
    }
    if (validData.taxaPlataforma !== undefined) {
      await setConfig(CONFIG_KEYS.TAXA_PLATAFORMA, validData.taxaPlataforma);
    }

    return { success: true, message: "Configurações atualizadas" };
  } catch (error: any) {
    console.error("[updateAdminConfig] Error:", error.message);
    return { error: "Erro ao atualizar configurações" };
  }
}

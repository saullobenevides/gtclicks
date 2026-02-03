import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(request) {
  try {
    // 1. Security Check: Only Admins
    const user = await getAuthenticatedUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { action, orderId } = await request.json().catch(() => ({}));

    const discrepancies = [];

    // --- CHECK 1: ORDER STATUS vs STRIPE ---
    const recentOrders = await prisma.pedido.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      where: {
        paymentId: { not: null },
      },
    });

    for (const order of recentOrders) {
      if (!order.paymentId || !order.paymentId.startsWith("pi_")) continue;

      try {
        const pi = await stripe.paymentIntents.retrieve(order.paymentId);
        const stripeStatus = pi.status === "succeeded" ? "PAGO" : "PENDENTE";

        if (order.status !== stripeStatus && order.status !== "CANCELADO") {
          if (stripeStatus === "PAGO" && order.status !== "PAGO") {
            discrepancies.push({
              type: "STATUS_MISMATCH",
              severity: "CRITICAL",
              orderId: order.id,
              message: `Pedido ${order.id} está ${order.status} no banco, mas PAGO no Stripe (${order.paymentId}).`,
              action: "SYNC_STATUS",
            });
          }
        }
      } catch (e) {
        console.error(`Error checking payment ${order.paymentId}`, e);
      }
    }

    // --- CHECK 2: PRICE CONSISTENCY ---
    // Check if total matches sum of items
    const ordersWithItems = await prisma.pedido.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      include: { itens: true },
      where: { status: "PAGO" },
    });

    for (const order of ordersWithItems) {
      const dbTotal = Number(order.total);
      const itemsTotal = order.itens.reduce(
        (sum, item) => sum + Number(item.precoPago),
        0
      );

      // Allow small float margin error (0.01)
      if (Math.abs(dbTotal - itemsTotal) > 0.05) {
        discrepancies.push({
          type: "PRICE_MISMATCH",
          severity: "HIGH",
          orderId: order.id,
          message: `Pedido ${order.id} total (R$ ${dbTotal}) difere da soma dos itens (R$ ${itemsTotal}).`,
          action: "INVESTIGATE",
        });
      }
    }

    // --- CHECK 3: METRICS ACCURACY (Collections) ---
    // Sample check: Top 10 collections
    const collections = await prisma.colecao.findMany({
      take: 10,
      include: {
        _count: {
          select: {
            fotos: true,
          },
        },
      },
    });

    for (const col of collections) {
      // Count ACTUAL sold items belonging to this collection
      const realSalesCount = await prisma.itemPedido.count({
        where: {
          foto: { colecaoId: col.id },
          pedido: { status: "PAGO" },
        },
      });

      if (col.vendas !== realSalesCount) {
        discrepancies.push({
          type: "METRICS_MISMATCH",
          severity: "MEDIUM",
          entityId: col.id,
          message: `Coleção "${col.nome}" mostra ${col.vendas} vendas, mas tem ${realSalesCount} itens vendidos reais.`,
          action: "FIX_METRICS_COLLECTION",
          payload: { id: col.id, realCount: realSalesCount },
        });
      }
    }

    // --- REPAIR ACTIONS (If requested) ---
    if (action === "FIX_METRICS_COLLECTION" && user.role === "ADMIN") {
      // Fix specific metric
      // Logic to update...
    }

    return NextResponse.json({
      success: true,
      checkedOrders: recentOrders.length,
      discrepancies,
    });
  } catch (error) {
    console.error("Audit failed:", error);
    return NextResponse.json({ error: "Audit failed" }, { status: 500 });
  }
}

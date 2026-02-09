import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { action, orderId } = (await request.json().catch(() => ({}))) as {
      action?: string;
      orderId?: string;
    };

    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN ?? "",
    });
    const paymentClient = new Payment(client);

    const discrepancies: Array<{
      type: string;
      severity: string;
      orderId?: string;
      entityId?: string;
      message: string;
      action: string;
      payload?: { id: string; realCount: number };
    }> = [];

    const recentOrders = await prisma.pedido.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      where: { paymentId: { not: null } },
    });

    for (const order of recentOrders) {
      if (!order.paymentId) continue;

      const paymentId = String(order.paymentId);
      if (
        paymentId.startsWith("pi_") ||
        paymentId.startsWith("mock_") ||
        !/^\d+$/.test(paymentId)
      ) {
        continue;
      }

      try {
        const mpPayment = await paymentClient.get({ id: order.paymentId });

        let mpStatus = "PENDENTE";
        if (mpPayment.status === "approved") mpStatus = "PAGO";
        else if (
          mpPayment.status === "rejected" ||
          mpPayment.status === "cancelled"
        )
          mpStatus = "CANCELADO";

        if (order.status !== mpStatus && order.status !== "CANCELADO") {
          if (mpStatus === "PAGO" && order.status !== "PAGO") {
            discrepancies.push({
              type: "STATUS_MISMATCH",
              severity: "CRITICAL",
              orderId: order.id,
              message: `Pedido ${order.id} está ${order.status} no banco, mas PAGO no Mercado Pago (${order.paymentId}).`,
              action: "SYNC_STATUS",
            });
          }
        }
      } catch (e) {
        console.error(`Error checking payment ${order.paymentId}`, e);
      }
    }

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

    const collections = await prisma.colecao.findMany({
      take: 10,
      include: {
        _count: { select: { fotos: true } },
      },
    });

    for (const col of collections) {
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

    if (action === "FIX_METRICS_COLLECTION" && user.role === "ADMIN") {
      // Fix specific metric - placeholder
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

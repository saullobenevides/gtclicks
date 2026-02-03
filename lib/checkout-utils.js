/**
 * Utilitários compartilhados para checkout (MP e Stripe).
 * Lógica de cálculo de preço e criação de pedido.
 */

import prisma from "@/lib/prisma";

function calculateItemPrice(item, allItems) {
  if (item.licencaId && item.licenca) {
    return Number(item.licenca.preco);
  }
  const rawBase =
    item.foto?.colecao?.precoFoto != null
      ? Number(item.foto.colecao.precoFoto)
      : 10;
  const basePrice = rawBase > 0 ? rawBase : 10;

  if (
    !item.foto?.colecaoId ||
    !item.foto?.colecao?.descontos ||
    !Array.isArray(item.foto.colecao.descontos) ||
    item.foto.colecao.descontos.length === 0
  ) {
    return basePrice;
  }

  const collectionItemsCount = allItems.filter(
    (i) => i.foto?.colecaoId === item.foto?.colecaoId
  ).length;
  const discounts = item.foto.colecao.descontos;
  const applicableDiscounts = discounts
    .filter((d) => collectionItemsCount >= d.min)
    .sort((a, b) => b.min - a.min);

  if (applicableDiscounts.length > 0) {
    const discountPrice = Number(applicableDiscounts[0].price);
    return discountPrice > 0 ? discountPrice : basePrice;
  }
  return basePrice;
}

/**
 * Obtém itens e total para checkout (carrinho ou pedido existente).
 * @returns {{ total: number, itemsForPayment: Array, finalOrderId: string }}
 */
export async function getCheckoutData(userId, orderId = null) {
  if (orderId) {
    const userOrder = await prisma.pedido.findUnique({
      where: { id: orderId, userId },
      include: { itens: { include: { foto: true, licenca: true } } },
    });
    if (!userOrder) return null;
    if (userOrder.status === "PAGO") return null;
    const total = Number(userOrder.total);
    const itemsForPayment = userOrder.itens.map((item) => ({
      ...item,
      finalPrice: Number(item.precoPago),
    }));
    return { total, itemsForPayment, finalOrderId: orderId };
  }

  const cart = await prisma.carrinho.findUnique({
    where: { userId },
    include: {
      itens: {
        include: {
          foto: { include: { colecao: true } },
          licenca: true,
        },
      },
    },
  });

  if (!cart || cart.itens.length === 0) return null;

  const itemsForPayment = cart.itens.map((item) => ({
    ...item,
    finalPrice: calculateItemPrice(item, cart.itens),
  }));
  const total = itemsForPayment.reduce((sum, item) => sum + item.finalPrice, 0);

  const newOrder = await prisma.pedido.create({
    data: {
      userId,
      total,
      status: "PENDENTE",
      itens: {
        create: itemsForPayment.map((item) => ({
          fotoId: item.fotoId,
          licencaId: item.licencaId,
          precoPago: item.finalPrice,
        })),
      },
    },
  });

  return {
    total,
    itemsForPayment,
    finalOrderId: newOrder.id,
  };
}

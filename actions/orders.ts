"use server";

import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { Prisma, PedidoStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

/**
 * Cria um novo pedido a partir dos itens do carrinho ou seleção direta
 */
export async function createOrder(data: {
  itens: Array<{ fotoId: string; licencaId?: string }>;
  checkoutSessionId?: string;
}) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { error: "Não autorizado" };
  }

  const { itens, checkoutSessionId } = data;

  if (!itens || itens.length === 0) {
    return { error: "Informe ao menos um item." };
  }

  try {
    let calculatedTotal = new Prisma.Decimal(0);
    const orderItems = [];

    for (const item of itens) {
      const foto = await prisma.foto.findUnique({
        where: { id: item.fotoId },
        include: { colecao: true },
      });

      if (!foto) {
        return { error: `Foto não encontrada: ${item.fotoId}` };
      }

      let itemPrice = new Prisma.Decimal(0);

      if (item.licencaId) {
        const licencaRel = await prisma.fotoLicenca.findUnique({
          where: {
            fotoId_licencaId: {
              fotoId: foto.id,
              licencaId: item.licencaId,
            },
          },
        });

        if (!licencaRel) {
          return { error: "Licença inválida" };
        }
        itemPrice = licencaRel.preco;
      } else {
        if (foto.colecao && foto.colecao.precoFoto) {
          itemPrice = foto.colecao.precoFoto;
        } else {
          return { error: "Preço não definido para foto" };
        }
      }

      calculatedTotal = calculatedTotal.add(itemPrice);

      orderItems.push({
        fotoId: item.fotoId,
        licencaId: item.licencaId || null,
        precoPago: itemPrice,
      });
    }

    const pedido = await prisma.pedido.create({
      data: {
        userId: user.id,
        total: calculatedTotal,
        status: PedidoStatus.PENDENTE,
        paymentId: checkoutSessionId,
        itens: {
          create: orderItems,
        },
      },
      include: {
        itens: true,
      },
    });

    revalidatePath("/meus-pedidos");
    return { success: true, data: pedido };
  } catch (error) {
    console.error("[Action] createOrder error:", error);
    return { error: "Erro ao criar pedido" };
  }
}

/**
 * Busca pedidos do usuário atual
 */
export async function getUserOrders() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { error: "Não autorizado" };
  }

  try {
    const pedidos = await prisma.pedido.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        itens: {
          include: {
            foto: { select: { titulo: true, previewUrl: true } },
            licenca: { select: { nome: true } },
          },
        },
      },
    });

    return { success: true, data: pedidos };
  } catch (error) {
    console.error("[Action] getUserOrders error:", error);
    return { error: "Erro ao buscar pedidos" };
  }
}

/**
 * Busca um pedido específico por ID
 */
export async function getOrderById(orderId: string) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { error: "Não autorizado" };
  }

  try {
    const pedido = await prisma.pedido.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { name: true, email: true } },
        itens: {
          include: {
            foto: true,
            licenca: true,
          },
        },
      },
    });

    if (!pedido) {
      return { error: "Pedido não encontrado" };
    }

    // Verificação de permissão (Dono ou Admin)
    if (pedido.userId !== user.id && user.role !== "ADMIN") {
      return { error: "Acesso negado" };
    }

    return { success: true, data: pedido };
  } catch (error) {
    console.error("[Action] getOrderById error:", error);
    return { error: "Erro ao buscar pedido" };
  }
}

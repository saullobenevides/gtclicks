"use server";

/**
 * Server Actions para operações do Carrinho
 */

import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const addItemSchema = z.object({
  fotoId: z.string().min(1, "fotoId é obrigatório"),
  licencaId: z.string().optional(),
});

/**
 * Adiciona item ao carrinho
 */
export async function addToCart(data: { fotoId: string; licencaId?: string }) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return { error: "Não autorizado" };
  }

  const parsed = addItemSchema.safeParse(data);

  if (!parsed.success) {
    const errorMsg =
      parsed.error.flatten().fieldErrors.fotoId?.[0] || "Dados inválidos";
    return { error: errorMsg };
  }

  const { fotoId, licencaId } = parsed.data;

  try {
    // Verificar se foto existe
    const foto = await prisma.foto.findUnique({
      where: { id: fotoId },
    });

    if (!foto) {
      return { error: "Foto não encontrada" };
    }

    // Buscar ou criar carrinho
    let cart = await prisma.carrinho.findUnique({
      where: { userId: user.id },
    });

    if (!cart) {
      cart = await prisma.carrinho.create({
        data: { userId: user.id },
      });
    }

    // Verificar se já existe no carrinho
    const existingItem = await prisma.itemCarrinho.findFirst({
      where: {
        carrinhoId: cart.id,
        fotoId,
        licencaId: licencaId || null,
      },
    });

    if (existingItem) {
      return { error: "Item já está no carrinho" };
    }

    // Adicionar item
    const item = await prisma.itemCarrinho.create({
      data: {
        carrinhoId: cart.id,
        fotoId,
        licencaId: licencaId || null,
      },
    });

    // Incrementar contador de carrinho na foto
    await prisma.foto.update({
      where: { id: fotoId },
      data: { carrinhoCount: { increment: 1 } },
    });

    // Incrementar contador de carrinho na coleção (se existir)
    if (foto.colecaoId) {
      await prisma.colecao.update({
        where: { id: foto.colecaoId },
        data: { carrinhoCount: { increment: 1 } },
      });
    }

    revalidatePath("/carrinho");

    return { success: true, data: item };
  } catch (error) {
    console.error("[Action] addToCart error:", error);
    return { error: "Erro ao adicionar ao carrinho" };
  }
}

/**
 * Remove item do carrinho
 */
export async function removeFromCart(itemId: string) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return { error: "Não autorizado" };
  }

  try {
    const item = await prisma.itemCarrinho.findUnique({
      where: { id: itemId },
      include: { carrinho: true },
    });

    if (!item || item.carrinho.userId !== user.id) {
      return { error: "Item não encontrado" };
    }

    await prisma.itemCarrinho.delete({
      where: { id: itemId },
    });

    revalidatePath("/carrinho");

    return { success: true };
  } catch (error) {
    console.error("[Action] removeFromCart error:", error);
    return { error: "Erro ao remover do carrinho" };
  }
}

/**
 * Limpa todo o carrinho
 */
export async function clearCart() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return { error: "Não autorizado" };
  }

  try {
    const cart = await prisma.carrinho.findUnique({
      where: { userId: user.id },
    });

    if (cart) {
      await prisma.itemCarrinho.deleteMany({
        where: { carrinhoId: cart.id },
      });
    }

    revalidatePath("/carrinho");

    return { success: true };
  } catch (error) {
    console.error("[Action] clearCart error:", error);
    return { error: "Erro ao limpar carrinho" };
  }
}

/**
 * Busca itens do carrinho para o usuário atual
 */
export async function getCartItems() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return { data: [] };
  }

  try {
    const cart = await prisma.carrinho.findUnique({
      where: { userId: user.id },
      include: {
        itens: {
          include: {
            foto: {
              include: {
                colecao: {
                  select: {
                    precoFoto: true,
                    nome: true,
                    slug: true,
                    descontos: true, // Needed for frontend price calculation
                  },
                },
              },
            },
            licenca: true,
          },
        },
      },
    });

    return { success: true, data: cart?.itens || [] };
  } catch (error) {
    console.error("[Action] getCartItems error:", error);
    return { error: "Erro ao buscar carrinho" };
  }
}

/**
 * Testes das Server Actions do carrinho (actions/cart.ts)
 */
import {
  addToCart,
  removeFromCart,
  clearCart,
  getCartItems,
} from "@/actions/cart";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

jest.mock("@/lib/prisma", () => ({
  foto: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  carrinho: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  itemCarrinho: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
  colecao: {
    update: jest.fn(),
  },
}));

jest.mock("@/lib/auth", () => ({
  getAuthenticatedUser: jest.fn(),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

describe("Cart Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("addToCart", () => {
    it("retorna erro se usuário não estiver autenticado", async () => {
      (getAuthenticatedUser as jest.Mock).mockResolvedValue(null);

      const result = await addToCart({ fotoId: "foto-1" });

      expect(result).toEqual({ error: "Não autorizado" });
      expect(prisma.foto.findUnique).not.toHaveBeenCalled();
    });

    it("retorna erro se fotoId for vazio", async () => {
      (getAuthenticatedUser as jest.Mock).mockResolvedValue({
        id: "user-1",
        email: "u@u.com",
      });

      const result = await addToCart({ fotoId: "" } as { fotoId: string });

      expect(result.error).toBeDefined();
      expect(prisma.foto.findUnique).not.toHaveBeenCalled();
    });

    it("retorna erro se foto não existir", async () => {
      (getAuthenticatedUser as jest.Mock).mockResolvedValue({
        id: "user-1",
      });
      (prisma.foto.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await addToCart({ fotoId: "foto-invalida" });

      expect(result).toEqual({ error: "Foto não encontrada" });
    });

    it("retorna erro se item já estiver no carrinho", async () => {
      (getAuthenticatedUser as jest.Mock).mockResolvedValue({ id: "user-1" });
      (prisma.foto.findUnique as jest.Mock).mockResolvedValue({
        id: "foto-1",
        colecaoId: null,
      });
      (prisma.carrinho.findUnique as jest.Mock).mockResolvedValue({
        id: "cart-1",
        userId: "user-1",
      });
      (prisma.itemCarrinho.findFirst as jest.Mock).mockResolvedValue({
        id: "item-1",
      });

      const result = await addToCart({ fotoId: "foto-1" });

      expect(result).toEqual({ error: "Item já está no carrinho" });
      expect(prisma.itemCarrinho.create).not.toHaveBeenCalled();
    });

    it("cria carrinho se não existir e adiciona item", async () => {
      (getAuthenticatedUser as jest.Mock).mockResolvedValue({ id: "user-1" });
      (prisma.foto.findUnique as jest.Mock).mockResolvedValue({
        id: "foto-1",
        colecaoId: null,
      });
      (prisma.carrinho.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.carrinho.create as jest.Mock).mockResolvedValue({
        id: "cart-1",
        userId: "user-1",
      });
      (prisma.itemCarrinho.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.itemCarrinho.create as jest.Mock).mockResolvedValue({
        id: "item-1",
        fotoId: "foto-1",
      });

      const result = await addToCart({ fotoId: "foto-1" });

      expect(result).toEqual({
        success: true,
        data: { id: "item-1", fotoId: "foto-1" },
      });
      expect(prisma.carrinho.create).toHaveBeenCalledWith({
        data: { userId: "user-1" },
      });
      expect(prisma.itemCarrinho.create).toHaveBeenCalledWith({
        data: {
          carrinhoId: "cart-1",
          fotoId: "foto-1",
          licencaId: null,
        },
      });
    });
  });

  describe("removeFromCart", () => {
    it("retorna erro se usuário não estiver autenticado", async () => {
      (getAuthenticatedUser as jest.Mock).mockResolvedValue(null);

      const result = await removeFromCart("item-1");

      expect(result).toEqual({ error: "Não autorizado" });
    });

    it("retorna erro se item não existir ou não pertencer ao usuário", async () => {
      (getAuthenticatedUser as jest.Mock).mockResolvedValue({ id: "user-1" });
      (prisma.itemCarrinho.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await removeFromCart("item-1");

      expect(result).toEqual({ error: "Item não encontrado" });
    });

    it("remove item e retorna success", async () => {
      (getAuthenticatedUser as jest.Mock).mockResolvedValue({ id: "user-1" });
      (prisma.itemCarrinho.findUnique as jest.Mock).mockResolvedValue({
        id: "item-1",
        carrinho: { userId: "user-1" },
      });
      (prisma.itemCarrinho.delete as jest.Mock).mockResolvedValue(undefined);

      const result = await removeFromCart("item-1");

      expect(result).toEqual({ success: true });
      expect(prisma.itemCarrinho.delete).toHaveBeenCalledWith({
        where: { id: "item-1" },
      });
    });
  });

  describe("clearCart", () => {
    it("retorna erro se usuário não estiver autenticado", async () => {
      (getAuthenticatedUser as jest.Mock).mockResolvedValue(null);

      const result = await clearCart();

      expect(result).toEqual({ error: "Não autorizado" });
    });

    it("limpa itens do carrinho e retorna success", async () => {
      (getAuthenticatedUser as jest.Mock).mockResolvedValue({ id: "user-1" });
      (prisma.carrinho.findUnique as jest.Mock).mockResolvedValue({
        id: "cart-1",
        userId: "user-1",
      });
      (prisma.itemCarrinho.deleteMany as jest.Mock).mockResolvedValue({
        count: 2,
      });

      const result = await clearCart();

      expect(result).toEqual({ success: true });
      expect(prisma.itemCarrinho.deleteMany).toHaveBeenCalledWith({
        where: { carrinhoId: "cart-1" },
      });
    });

    it("retorna success mesmo se carrinho não existir", async () => {
      (getAuthenticatedUser as jest.Mock).mockResolvedValue({ id: "user-1" });
      (prisma.carrinho.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await clearCart();

      expect(result).toEqual({ success: true });
      expect(prisma.itemCarrinho.deleteMany).not.toHaveBeenCalled();
    });
  });

  describe("getCartItems", () => {
    it("retorna data vazia se usuário não estiver autenticado", async () => {
      (getAuthenticatedUser as jest.Mock).mockResolvedValue(null);

      const result = await getCartItems();

      expect(result).toEqual({ data: [] });
    });

    it("retorna itens do carrinho quando existirem", async () => {
      const mockItens = [
        {
          id: "item-1",
          fotoId: "foto-1",
          foto: { titulo: "Foto 1", colecao: { nome: "Coleção 1" } },
          licenca: null,
        },
      ];
      (getAuthenticatedUser as jest.Mock).mockResolvedValue({ id: "user-1" });
      (prisma.carrinho.findUnique as jest.Mock).mockResolvedValue({
        id: "cart-1",
        itens: mockItens,
      });

      const result = await getCartItems();

      expect(result).toEqual({ success: true, data: mockItens });
    });

    it("retorna array vazio quando carrinho não existir", async () => {
      (getAuthenticatedUser as jest.Mock).mockResolvedValue({ id: "user-1" });
      (prisma.carrinho.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await getCartItems();

      expect(result).toEqual({ success: true, data: [] });
    });
  });
});

/**
 * Testes para DELETE /api/carrinho (limpar carrinho)
 */
jest.mock("next/server", () => ({
  NextResponse: {
    json: (data, init = {}) => ({
      status: init.status ?? 200,
      json: async () => data,
      headers: new Map(),
    }),
  },
}));
jest.mock("@/lib/auth", () => ({
  getAuthenticatedUser: jest.fn(),
}));
jest.mock("@/lib/prisma", () => ({
  carrinho: { findUnique: jest.fn() },
  itemCarrinho: { deleteMany: jest.fn() },
}));

import { DELETE } from "../route";
import { getAuthenticatedUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

describe("DELETE /api/carrinho", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("retorna 401 se não autenticado", async () => {
    getAuthenticatedUser.mockResolvedValue(null);

    const request = new Request("http://localhost/api/carrinho", {
      method: "DELETE",
    });
    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
    expect(prisma.carrinho.findUnique).not.toHaveBeenCalled();
  });

  it("retorna 200 e limpa itens quando carrinho existe", async () => {
    getAuthenticatedUser.mockResolvedValue({ id: "user-1" });
    prisma.carrinho.findUnique.mockResolvedValue({
      id: "cart-1",
      userId: "user-1",
    });
    prisma.itemCarrinho.deleteMany.mockResolvedValue({ count: 2 });

    const request = new Request("http://localhost/api/carrinho", {
      method: "DELETE",
    });
    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(prisma.carrinho.findUnique).toHaveBeenCalledWith({
      where: { userId: "user-1" },
    });
    expect(prisma.itemCarrinho.deleteMany).toHaveBeenCalledWith({
      where: { carrinhoId: "cart-1" },
    });
  });

  it("retorna 200 mesmo quando carrinho não existe", async () => {
    getAuthenticatedUser.mockResolvedValue({ id: "user-1" });
    prisma.carrinho.findUnique.mockResolvedValue(null);

    const request = new Request("http://localhost/api/carrinho", {
      method: "DELETE",
    });
    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(prisma.itemCarrinho.deleteMany).not.toHaveBeenCalled();
  });
});

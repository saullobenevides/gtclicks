/**
 * Testes para DELETE /api/carrinho/item (remover item por fotoId)
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

describe("DELETE /api/carrinho/item", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("retorna 401 se não autenticado", async () => {
    getAuthenticatedUser.mockResolvedValue(null);

    const request = new Request("http://localhost/api/carrinho/item", {
      method: "DELETE",
      body: JSON.stringify({ fotoId: "foto-1" }),
    });
    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
    expect(prisma.carrinho.findUnique).not.toHaveBeenCalled();
  });

  it("retorna 400 se body inválido (fotoId vazio)", async () => {
    getAuthenticatedUser.mockResolvedValue({ id: "user-1" });

    const request = new Request("http://localhost/api/carrinho/item", {
      method: "DELETE",
      body: JSON.stringify({ fotoId: "" }),
    });
    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
    expect(prisma.carrinho.findUnique).not.toHaveBeenCalled();
  });

  it("retorna 200 e remove itens do carrinho", async () => {
    getAuthenticatedUser.mockResolvedValue({ id: "user-1" });
    prisma.carrinho.findUnique.mockResolvedValue({
      id: "cart-1",
      userId: "user-1",
    });
    prisma.itemCarrinho.deleteMany.mockResolvedValue({ count: 1 });

    const request = new Request("http://localhost/api/carrinho/item", {
      method: "DELETE",
      body: JSON.stringify({ fotoId: "foto-1" }),
    });
    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(prisma.itemCarrinho.deleteMany).toHaveBeenCalledWith({
      where: { carrinhoId: "cart-1", fotoId: "foto-1" },
    });
  });
});

/**
 * Testes para POST /api/checkout/process (auth e validação)
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
  user: { findUnique: jest.fn() },
  carrinho: { findUnique: jest.fn() },
  pedido: { findUnique: jest.fn(), create: jest.fn() },
  itemPedido: { createMany: jest.fn() },
  itemCarrinho: { deleteMany: jest.fn() },
}));

import { POST } from "../route";
import { getAuthenticatedUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

describe("POST /api/checkout/process", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("retorna 401 se não autenticado", async () => {
    getAuthenticatedUser.mockResolvedValue(null);

    const request = new Request("http://localhost/api/checkout/process", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("retorna 400 quando carrinho está vazio (novo checkout)", async () => {
    getAuthenticatedUser.mockResolvedValue({ id: "user-1", email: "u@u.com" });
    prisma.user.findUnique.mockResolvedValue({
      id: "user-1",
      email: "u@u.com",
      mercadopagoCustomerId: null,
    });
    prisma.carrinho.findUnique.mockResolvedValue(null);

    const request = new Request("http://localhost/api/checkout/process", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Cart is empty");
  });

  it("retorna 400 quando carrinho existe mas sem itens", async () => {
    getAuthenticatedUser.mockResolvedValue({ id: "user-1", email: "u@u.com" });
    prisma.user.findUnique.mockResolvedValue({
      id: "user-1",
      email: "u@u.com",
      mercadopagoCustomerId: null,
    });
    prisma.carrinho.findUnique.mockResolvedValue({
      id: "cart-1",
      userId: "user-1",
      itens: [],
    });

    const request = new Request("http://localhost/api/checkout/process", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Cart is empty");
  });
});

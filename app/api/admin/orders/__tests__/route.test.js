/**
 * Testes para GET /api/admin/orders
 * Foco: auth admin, formato de erro 500 (não expõe stack em produção)
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
  pedido: {
    findMany: jest.fn(),
  },
}));

import { GET } from "../route";
import { getAuthenticatedUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

describe("GET /api/admin/orders", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = "test";
  });

  it("retorna 401 quando não autenticado", async () => {
    getAuthenticatedUser.mockResolvedValue(null);

    const request = new Request("http://localhost/api/admin/orders");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toContain("Admin");
    expect(prisma.pedido.findMany).not.toHaveBeenCalled();
  });

  it("retorna 401 quando usuário não é admin", async () => {
    getAuthenticatedUser.mockResolvedValue({
      id: "user-1",
      role: "CLIENTE",
    });

    const request = new Request("http://localhost/api/admin/orders");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toContain("Admin");
    expect(prisma.pedido.findMany).not.toHaveBeenCalled();
  });

  it("retorna 200 e lista pedidos quando admin", async () => {
    getAuthenticatedUser.mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
    });
    prisma.pedido.findMany.mockResolvedValue([
      {
        id: "ped-1",
        total: 99.9,
        status: "PAGO",
        itens: [],
        user: { name: "User", email: "u@u.com" },
      },
    ]);

    const request = new Request("http://localhost/api/admin/orders");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data[0].id).toBe("ped-1");
  });

  it("em produção, erro 500 não expõe stack nem message", async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    getAuthenticatedUser.mockResolvedValue({ id: "admin-1", role: "ADMIN" });
    prisma.pedido.findMany.mockRejectedValue(new Error("DB connection failed"));

    const request = new Request("http://localhost/api/admin/orders");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Internal server error");
    expect(data.stack).toBeUndefined();
    expect(data.message).toBeUndefined();

    process.env.NODE_ENV = originalEnv;
  });

  it("em desenvolvimento, erro 500 inclui message e stack para debug", async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    getAuthenticatedUser.mockResolvedValue({ id: "admin-1", role: "ADMIN" });
    prisma.pedido.findMany.mockRejectedValue(new Error("DB connection failed"));

    const request = new Request("http://localhost/api/admin/orders");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Internal server error");
    expect(data.message).toBe("DB connection failed");
    expect(data.stack).toBeDefined();

    process.env.NODE_ENV = originalEnv;
  });
});

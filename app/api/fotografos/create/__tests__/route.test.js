/**
 * Testes para POST /api/fotografos/create (auth e validacao)
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
  fotografo: { findUnique: jest.fn(), create: jest.fn() },
  user: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
}));

import { POST } from "../route";
import { getAuthenticatedUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

describe("POST /api/fotografos/create", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("retorna 401 se nao autenticado", async () => {
    getAuthenticatedUser.mockResolvedValue(null);

    const request = new Request("http://localhost/api/fotografos/create", {
      method: "POST",
      body: JSON.stringify({
        cidade: "São Paulo",
        estado: "SP",
        chavePix: "email@exemplo.com",
      }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Não autorizado");
    expect(prisma.fotografo.findUnique).not.toHaveBeenCalled();
  });

  it("retorna 400 se body invalido (cidade vazia)", async () => {
    getAuthenticatedUser.mockResolvedValue({ id: "user-1" });

    const request = new Request("http://localhost/api/fotografos/create", {
      method: "POST",
      body: JSON.stringify({
        cidade: "",
        estado: "SP",
        chavePix: "chave",
      }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
    expect(prisma.fotografo.findUnique).not.toHaveBeenCalled();
  });

  it("retorna 200 com fotografo existente quando usuario ja e fotografo", async () => {
    getAuthenticatedUser.mockResolvedValue({ id: "user-1" });
    prisma.fotografo.findUnique.mockResolvedValue({
      id: "fotografo-1",
      userId: "user-1",
      username: "@fotografo_1234",
    });

    const request = new Request("http://localhost/api/fotografos/create", {
      method: "POST",
      body: JSON.stringify({
        cidade: "São Paulo",
        estado: "SP",
        chavePix: "email@exemplo.com",
      }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toEqual({
      id: "fotografo-1",
      userId: "user-1",
      username: "@fotografo_1234",
    });
    expect(prisma.fotografo.create).not.toHaveBeenCalled();
  });
});

/**
 * Testes para GET /api/colecoes/[id]/folders
 * Foco: ownership da coleção (IDOR - user A não pode listar pastas da coleção do user B)
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
jest.mock("@/stack/server", () => ({
  stackServerApp: {
    getUser: jest.fn(),
  },
}));
jest.mock("@/lib/prisma", () => ({
  colecao: { findUnique: jest.fn() },
  foto: { findMany: jest.fn() },
}));

import { GET } from "../route";
import { stackServerApp } from "@/stack/server";
import prisma from "@/lib/prisma";

describe("GET /api/colecoes/[id]/folders", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("retorna 401 se não autenticado", async () => {
    stackServerApp.getUser.mockResolvedValue(null);

    const request = new Request("http://localhost/api/colecoes/col-1/folders");
    const response = await GET(request, {
      params: Promise.resolve({ id: "col-1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Nao autorizado");
    expect(prisma.foto.findMany).not.toHaveBeenCalled();
  });

  it("retorna 403 quando coleção pertence a outro fotógrafo (IDOR)", async () => {
    stackServerApp.getUser.mockResolvedValue({ id: "user-A" });
    prisma.colecao.findUnique.mockResolvedValue({
      id: "col-1",
      fotografo: { userId: "user-B" },
    });

    const request = new Request("http://localhost/api/colecoes/col-1/folders");
    const response = await GET(request, {
      params: Promise.resolve({ id: "col-1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toContain("sem permissão");
    expect(prisma.foto.findMany).not.toHaveBeenCalled();
  });

  it("retorna 403 quando coleção não existe", async () => {
    stackServerApp.getUser.mockResolvedValue({ id: "user-1" });
    prisma.colecao.findUnique.mockResolvedValue(null);

    const request = new Request("http://localhost/api/colecoes/col-inexistente/folders");
    const response = await GET(request, {
      params: Promise.resolve({ id: "col-inexistente" }),
    });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toContain("sem permissão");
  });

  it("retorna 200 e lista pastas quando coleção pertence ao usuário", async () => {
    stackServerApp.getUser.mockResolvedValue({ id: "user-1" });
    prisma.colecao.findUnique.mockResolvedValue({
      id: "col-1",
      fotografo: { userId: "user-1" },
    });
    prisma.foto.findMany.mockResolvedValue([
      {
        folder: { nome: "Eventos/2024" },
      },
      {
        folder: { nome: "Eventos" },
      },
    ]);

    const request = new Request("http://localhost/api/colecoes/col-1/folders");
    const response = await GET(request, {
      params: Promise.resolve({ id: "col-1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toBeDefined();
    expect(Array.isArray(data.data)).toBe(true);
    expect(prisma.foto.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { colecaoId: "col-1" },
      })
    );
  });
});

/**
 * Testes para GET e POST /api/colecoes
 * Foco: comportamento de segurança (auth, ownership, filtro PUBLICADA)
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
  fotografo: { findUnique: jest.fn() },
  colecao: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
  },
}));
jest.mock("@/lib/slug", () => ({
  slugify: jest.fn((s) => s.toLowerCase().replace(/\s+/g, "-")),
}));
jest.mock("@/lib/cache", () => ({
  invalidate: jest.fn().mockResolvedValue(undefined),
}));

import { GET, POST } from "../route";
import { getAuthenticatedUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

describe("/api/colecoes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET", () => {
    it("retorna apenas coleções PUBLICADA (não expõe rascunhos)", async () => {
      prisma.colecao.findMany.mockResolvedValue([
        {
          id: "col-1",
          nome: "Coleção Pública",
          status: "PUBLICADA",
          fotografoId: "foto-1",
        },
      ]);

      const request = new Request("http://localhost/api/colecoes");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(prisma.colecao.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: "PUBLICADA",
          }),
        })
      );
      expect(data.data).toHaveLength(1);
      expect(data.data[0].status).toBe("PUBLICADA");
    });

    it("filtra por fotografoId quando informado", async () => {
      prisma.colecao.findMany.mockResolvedValue([]);

      const request = new Request(
        "http://localhost/api/colecoes?fotografoId=foto-123"
      );
      await GET(request);

      expect(prisma.colecao.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            fotografoId: "foto-123",
            status: "PUBLICADA",
          }),
        })
      );
    });
  });

  describe("POST", () => {
    it("retorna 401 se não autenticado", async () => {
      getAuthenticatedUser.mockResolvedValue(null);

      const request = new Request("http://localhost/api/colecoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: "Minha Coleção",
          fotografoId: "foto-qualquer",
        }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Nao autorizado");
      expect(prisma.colecao.create).not.toHaveBeenCalled();
    });

    it("retorna 403 se usuário não é fotógrafo", async () => {
      getAuthenticatedUser.mockResolvedValue({ id: "user-1" });
      prisma.fotografo.findUnique.mockResolvedValue(null);

      const request = new Request("http://localhost/api/colecoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: "Coleção" }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe("Perfil de fotografo nao encontrado");
      expect(prisma.colecao.create).not.toHaveBeenCalled();
    });

    it("retorna 403 se fotografoId do body pertence a outro fotógrafo", async () => {
      getAuthenticatedUser.mockResolvedValue({ id: "user-1" });
      prisma.fotografo.findUnique.mockResolvedValue({
        id: "meu-foto-id",
        userId: "user-1",
      });

      const request = new Request("http://localhost/api/colecoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: "Coleção",
          fotografoId: "outro-fotografo-id",
        }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain("outro fotografo");
      expect(prisma.colecao.create).not.toHaveBeenCalled();
    });

    it("retorna 201 e cria coleção com fotografoId do usuário autenticado", async () => {
      getAuthenticatedUser.mockResolvedValue({ id: "user-1" });
      prisma.fotografo.findUnique.mockResolvedValue({
        id: "meu-foto-id",
        userId: "user-1",
      });
      prisma.colecao.findUnique.mockResolvedValue(null);
      prisma.colecao.create.mockResolvedValue({
        id: "col-1",
        nome: "Minha Coleção",
        slug: "minha-colecao",
        fotografoId: "meu-foto-id",
      });

      const request = new Request("http://localhost/api/colecoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: "Minha Coleção" }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data.fotografoId).toBe("meu-foto-id");
      expect(prisma.colecao.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            fotografoId: "meu-foto-id",
            nome: "Minha Coleção",
          }),
        })
      );
    });
  });
});

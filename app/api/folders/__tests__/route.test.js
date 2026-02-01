/**
 * Testes para GET e POST /api/folders
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
  folder: { findMany: jest.fn(), create: jest.fn() },
}));

import { GET, POST } from "../route";
import { stackServerApp } from "@/stack/server";
import prisma from "@/lib/prisma";

describe("/api/folders", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET", () => {
    it("retorna 401 se não autenticado", async () => {
      stackServerApp.getUser.mockResolvedValue(null);

      const request = new Request("http://localhost/api/folders");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
      expect(prisma.colecao.findUnique).not.toHaveBeenCalled();
    });

    it("retorna 400 se colecaoId não for enviado", async () => {
      stackServerApp.getUser.mockResolvedValue({ id: "user-1" });

      const request = new Request("http://localhost/api/folders");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Coleção ID é obrigatório");
    });

    it("retorna 200 e lista pastas quando coleção pertence ao usuário", async () => {
      stackServerApp.getUser.mockResolvedValue({ id: "user-1" });
      prisma.colecao.findUnique.mockResolvedValue({
        id: "col-1",
        fotografo: { userId: "user-1" },
      });
      prisma.folder.findMany.mockResolvedValue([
        {
          id: "folder-1",
          nome: "Pasta 1",
          colecaoId: "col-1",
          _count: { fotos: 0, children: 0 },
        },
      ]);

      const request = new Request(
        "http://localhost/api/folders?colecaoId=col-1"
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data).toHaveLength(1);
      expect(data[0].nome).toBe("Pasta 1");
    });
  });

  describe("POST", () => {
    it("retorna 401 se não autenticado", async () => {
      stackServerApp.getUser.mockResolvedValue(null);

      const request = new Request("http://localhost/api/folders", {
        method: "POST",
        body: JSON.stringify({ nome: "Nova Pasta", colecaoId: "col-1" }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
      expect(prisma.folder.create).not.toHaveBeenCalled();
    });

    it("retorna 400 se nome ou colecaoId faltando", async () => {
      stackServerApp.getUser.mockResolvedValue({ id: "user-1" });

      const request = new Request("http://localhost/api/folders", {
        method: "POST",
        body: JSON.stringify({ colecaoId: "col-1" }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Nome e Coleção são obrigatórios");
    });

    it("retorna 200 e cria pasta quando coleção pertence ao usuário", async () => {
      stackServerApp.getUser.mockResolvedValue({ id: "user-1" });
      prisma.colecao.findUnique.mockResolvedValue({
        id: "col-1",
        fotografo: { userId: "user-1" },
      });
      prisma.folder.create.mockResolvedValue({
        id: "folder-1",
        nome: "Nova Pasta",
        colecaoId: "col-1",
        parentId: null,
      });

      const request = new Request("http://localhost/api/folders", {
        method: "POST",
        body: JSON.stringify({ nome: "Nova Pasta", colecaoId: "col-1" }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.nome).toBe("Nova Pasta");
      expect(data.colecaoId).toBe("col-1");
      expect(prisma.folder.create).toHaveBeenCalledWith({
        data: { nome: "Nova Pasta", colecaoId: "col-1", parentId: null },
      });
    });
  });
});

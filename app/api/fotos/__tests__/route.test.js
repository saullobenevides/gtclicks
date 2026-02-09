/**
 * Testes para POST /api/fotos
 * Foco: auth, ownership de colecaoId (IDOR - não vincular foto a coleção de outro fotógrafo)
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
  colecao: { findUnique: jest.fn() },
  foto: { create: jest.fn() },
}));

import { POST } from "../route";
import { getAuthenticatedUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

describe("POST /api/fotos", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("retorna 401 se não autenticado", async () => {
    getAuthenticatedUser.mockResolvedValue(null);

    const request = new Request("http://localhost/api/fotos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titulo: "Foto",
        previewUrl: "https://example.com/preview.jpg",
        originalUrl: "uploads/photo.jpg",
      }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Nao autorizado");
    expect(prisma.foto.create).not.toHaveBeenCalled();
  });

  it("retorna 403 quando colecaoId pertence a outro fotógrafo (IDOR)", async () => {
    getAuthenticatedUser.mockResolvedValue({ id: "user-1" });
    prisma.fotografo.findUnique.mockResolvedValue({
      id: "meu-foto-id",
      userId: "user-1",
    });
    prisma.colecao.findUnique.mockResolvedValue({
      id: "col-outro",
      fotografoId: "outro-fotografo-id",
    });

    const request = new Request("http://localhost/api/fotos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titulo: "Foto",
        previewUrl: "https://example.com/preview.jpg",
        originalUrl: "uploads/photo.jpg",
        colecaoId: "col-outro",
      }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toContain("sem permissão");
    expect(prisma.foto.create).not.toHaveBeenCalled();
  });

  it("retorna 403 quando colecaoId não existe", async () => {
    getAuthenticatedUser.mockResolvedValue({ id: "user-1" });
    prisma.fotografo.findUnique.mockResolvedValue({
      id: "meu-foto-id",
      userId: "user-1",
    });
    prisma.colecao.findUnique.mockResolvedValue(null);

    const request = new Request("http://localhost/api/fotos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titulo: "Foto",
        previewUrl: "https://example.com/preview.jpg",
        originalUrl: "uploads/photo.jpg",
        colecaoId: "col-inexistente",
      }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toContain("sem permissão");
    expect(prisma.foto.create).not.toHaveBeenCalled();
  });

  it("retorna 201 e cria foto quando colecaoId pertence ao fotógrafo", async () => {
    getAuthenticatedUser.mockResolvedValue({ id: "user-1" });
    prisma.fotografo.findUnique.mockResolvedValue({
      id: "meu-foto-id",
      userId: "user-1",
    });
    prisma.colecao.findUnique.mockResolvedValue({
      id: "col-minha",
      fotografoId: "meu-foto-id",
    });
    prisma.foto.create.mockResolvedValue({
      id: "photo-1",
      titulo: "Foto",
      colecaoId: "col-minha",
      previewUrl: "https://example.com/preview.jpg",
    });

    const request = new Request("http://localhost/api/fotos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titulo: "Foto",
        previewUrl: "https://example.com/preview.jpg",
        originalUrl: "uploads/photo.jpg",
        colecaoId: "col-minha",
      }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.data.colecaoId).toBe("col-minha");
    expect(prisma.foto.create).toHaveBeenCalled();
  });
});

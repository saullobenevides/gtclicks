/**
 * Testes para GET /api/fotografos/fotos
 * Foco: auth obrigatória; retorna apenas fotos do próprio fotógrafo (não aceita userId do query)
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
  foto: { findMany: jest.fn() },
}));

import { GET } from "../route";
import { getAuthenticatedUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

describe("GET /api/fotografos/fotos", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("retorna 401 se não autenticado", async () => {
    getAuthenticatedUser.mockResolvedValue(null);

    const request = new Request("http://localhost/api/fotografos/fotos");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Autenticação necessária");
    expect(prisma.foto.findMany).not.toHaveBeenCalled();
  });

  it("retorna 404 se usuário não é fotógrafo", async () => {
    getAuthenticatedUser.mockResolvedValue({ id: "user-1" });
    prisma.fotografo.findUnique.mockResolvedValue(null);

    const request = new Request("http://localhost/api/fotografos/fotos");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Fotógrafo não encontrado");
    expect(prisma.foto.findMany).not.toHaveBeenCalled();
  });

  it("retorna apenas fotos do fotógrafo do usuário autenticado (ignora userId da query)", async () => {
    getAuthenticatedUser.mockResolvedValue({ id: "user-1" });
    prisma.fotografo.findUnique.mockResolvedValue({
      id: "foto-1",
      userId: "user-1",
    });
    prisma.foto.findMany.mockResolvedValue([
      {
        id: "photo-1",
        titulo: "Foto 1",
        previewUrl: "https://example.com/1.jpg",
        licencas: [],
      },
    ]);

    const request = new Request(
      "http://localhost/api/fotografos/fotos?userId=outro-usuario"
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(prisma.fotografo.findUnique).toHaveBeenCalledWith({
      where: { userId: "user-1" },
    });
    expect(prisma.foto.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { fotografoId: "foto-1" },
      })
    );
    expect(data.data).toHaveLength(1);
  });
});

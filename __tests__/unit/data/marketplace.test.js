/**
 * Testes da camada de dados (marketplace).
 * Garante o contrato de getHomepageData e comportamento com Prisma mockado.
 */
import { getHomepageData } from "@/lib/data/marketplace";
import prisma from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  colecao: {
    findMany: jest.fn(),
  },
  fotografo: {
    findMany: jest.fn(),
  },
  itemPedido: {
    count: jest.fn(),
  },
  pedido: {
    findMany: jest.fn(),
    groupBy: jest.fn(),
  },
  user: {
    findMany: jest.fn(),
  },
}));

describe("Marketplace Data - getHomepageData", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("retorna objeto com featuredCollections, recentCollections, photographers e topBuyers", async () => {
    prisma.colecao.findMany.mockResolvedValue([]);
    prisma.fotografo.findMany.mockResolvedValue([]);
    prisma.pedido.groupBy.mockResolvedValue([]);
    prisma.user.findMany.mockResolvedValue([]);

    const result = await getHomepageData();

    expect(result).toHaveProperty("featuredCollections");
    expect(result).toHaveProperty("recentCollections");
    expect(result).toHaveProperty("photographers");
    expect(result).toHaveProperty("topBuyers");
    expect(Array.isArray(result.featuredCollections)).toBe(true);
    expect(Array.isArray(result.recentCollections)).toBe(true);
    expect(Array.isArray(result.photographers)).toBe(true);
    expect(Array.isArray(result.topBuyers)).toBe(true);
  });

  it("quando Prisma retorna coleções, featuredCollections e recentCollections têm formato esperado", async () => {
    const mockColecao = {
      id: "col1",
      nome: "Coleção Teste",
      slug: "colecao-teste",
      descricao: "Desc",
      capaUrl: null,
      precoFoto: 10,
      createdAt: new Date(),
      _count: { fotos: 5 },
      fotografo: {
        username: "fotografo1",
        cidade: "SP",
        user: { name: "Fotógrafo Um", image: null },
      },
    };

    prisma.colecao.findMany
      .mockResolvedValueOnce([mockColecao])
      .mockResolvedValueOnce([mockColecao]);
    prisma.fotografo.findMany.mockResolvedValue([]);
    prisma.pedido.groupBy.mockResolvedValue([]);
    prisma.user.findMany.mockResolvedValue([]);

    const result = await getHomepageData();

    expect(result.featuredCollections.length).toBe(1);
    expect(result.featuredCollections[0]).toMatchObject({
      id: "col1",
      name: "Coleção Teste",
      slug: "colecao-teste",
      totalPhotos: 5,
      photographerName: "Fotógrafo Um",
    });
    expect(result.recentCollections.length).toBe(1);
  });

  it("quando Prisma retorna fotógrafos, photographers tem formato de card", async () => {
    const mockFotografo = {
      id: "f1",
      username: "fotografo_teste",
      cidade: "Rio",
      especialidades: ["esportes"],
      user: { name: "Fotógrafo Teste", image: null },
      colecoes: [{ id: "c1" }],
      _count: { fotos: 10 },
    };

    prisma.colecao.findMany.mockResolvedValue([]);
    prisma.fotografo.findMany.mockResolvedValue([mockFotografo]);
    prisma.itemPedido.count.mockResolvedValue(0);
    prisma.pedido.groupBy.mockResolvedValue([]);
    prisma.user.findMany.mockResolvedValue([]);

    const result = await getHomepageData();

    expect(result.photographers.length).toBe(1);
    expect(result.photographers[0]).toMatchObject({
      username: "fotografo_teste",
      name: "Fotógrafo Teste",
      city: "Rio",
      specialties: ["esportes"],
      stats: expect.any(Object),
    });
  });
});

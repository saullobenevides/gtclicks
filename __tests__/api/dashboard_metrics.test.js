/**
 * @jest-environment node
 */
import { GET } from "../../app/api/fotografos/resolve/route";
import prisma from "../../lib/prisma";
import { NextResponse } from "next/server";

// Mock do Prisma
jest.mock("../../lib/prisma", () => ({
  fotografo: {
    findFirst: jest.fn(),
  },
  itemPedido: {
    aggregate: jest.fn(),
    count: jest.fn(),
  },
  foto: {
    aggregate: jest.fn(),
  },
  pedido: {
    count: jest.fn(),
  },
  $transaction: jest.fn(),
}));

describe("API Dashboard Fotógrafo", () => {
  it("deve retornar métricas financeiras e lista de coleções", async () => {
    // Dados simulados do banco
    const mockFotografo = {
      id: "foto-123",
      userId: "user-123",
      username: "fotografo_teste",
      user: { name: "João Silva", email: "joao@test.com" },
      saldo: { disponivel: 150.0 },
      colecoes: [
        {
          id: "col-1",
          nome: "Evento Teste",
          status: "PUBLICADA",
          views: 100,
          vendas: 5,
          downloads: 5,
          carrinhoCount: 12,
          createdAt: new Date(),
        },
      ],
      _count: { colecoes: 1, fotos: 50 },
    };

    prisma.fotografo.findFirst.mockResolvedValue(mockFotografo);

    // Mock do retorno da transação
    prisma.$transaction.mockResolvedValue([
      { _sum: { precoPago: 1000 } }, // revenueData
      10, // salesCount
      { _sum: { views: 500 } }, // viewsData
      { _sum: { downloads: 50 } }, // downloadsData
      8, // ordersCount
    ]);

    // Simula a requisição
    const req = {
      url: "http://localhost:3000/api/fotografos/resolve?userId=user-123",
    };

    const response = await GET(req);
    const json = await response.json();

    // Verificações
    expect(response.status).toBe(200);
    expect(json.data.saldo.disponivel).toBe(150.0);
    expect(json.data.colecoes).toHaveLength(1);
    expect(json.data.stats.revenue).toBe(1000);

    // Verifica se os campos novos de analytics estão presentes
    const colecao = json.data.colecoes[0];
    expect(colecao).toHaveProperty("vendas", 5);
    expect(colecao).toHaveProperty("carrinhoCount", 12);
  });

  it("deve retornar 200 e data: null quando fotografo nao encontrado", async () => {
    prisma.fotografo.findFirst.mockResolvedValue(null);

    const req = {
      url: "http://localhost:3000/api/fotografos/resolve?userId=user-invalid",
    };

    const response = await GET(req);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data).toBeNull();
  });
});

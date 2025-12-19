/**
 * @jest-environment node
 */
import { searchCollections } from '../../lib/data/marketplace';
import prisma from '../../lib/prisma';

// Mock do Prisma para não bater no banco real
jest.mock('../../lib/prisma', () => ({
  colecao: {
    findMany: jest.fn(),
  },
}));

describe('Busca de Eventos (Marketplace)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve filtrar coleções por intervalo de data (Start/End of Day) quando uma data é fornecida', async () => {
    const mockDate = '2025-12-18';
    
    // Configura o retorno mockado
    prisma.colecao.findMany.mockResolvedValue([
      { 
        id: 'col-1', 
        nome: 'Jogo Final', 
        createdAt: new Date('2025-12-18T14:00:00Z'),
        fotografo: { user: { name: 'Foto Teste' } },
        _count: { fotos: 10 }
      }
    ]);

    await searchCollections({ date: mockDate });

    // Verifica se o Prisma foi chamado com o filtro de data correto
    const calledArgs = prisma.colecao.findMany.mock.calls[0][0];
    
    expect(calledArgs.where.AND).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          createdAt: {
            gte: expect.any(Date), // Início do dia
            lte: expect.any(Date)  // Fim do dia
          }
        })
      ])
    );

    // Verifica se as datas geradas batem com o dia 18
    const filter = calledArgs.where.AND.find(f => f.createdAt);
    expect(filter.createdAt.gte.toISOString()).toContain('2025-12-18');
  });

  it('não deve aplicar filtro de data se a data não for fornecida', async () => {
    prisma.colecao.findMany.mockResolvedValue([]);

    await searchCollections({ q: 'Futsal' });

    const calledArgs = prisma.colecao.findMany.mock.calls[0][0];
    
    // Verifica que NÃO existe filtro de createdAt
    const dateFilter = calledArgs.where.AND.find(f => f.createdAt);
    expect(dateFilter).toBeUndefined();
  });
});

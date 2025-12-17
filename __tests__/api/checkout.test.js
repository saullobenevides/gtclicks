import { POST } from '@/app/api/pedidos/route';
import { NextResponse } from 'next/server';

// Mocks
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      data,
      status: options?.status || 200,
      json: async () => data,
    })),
  },
}));

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    pedido: {
      create: jest.fn(),
    },
  },
}));

// Mock Enum
jest.mock('@prisma/client', () => ({
  PedidoStatus: {
    PENDENTE: 'PENDENTE',
  },
}));

jest.mock('@/lib/auth', () => ({
  getAuthenticatedUser: jest.fn(),
}));

const { getAuthenticatedUser } = require('@/lib/auth');
const prisma = require('@/lib/prisma').default;

describe('POST /api/pedidos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    getAuthenticatedUser.mockResolvedValue(null);
    const request = {};
    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it('should return 400 if missing items', async () => {
    getAuthenticatedUser.mockResolvedValue({ id: 'user-1' });
    const request = {
      json: async () => ({ itens: [] })
    };
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('should create order successfully', async () => {
    getAuthenticatedUser.mockResolvedValue({ id: 'user-1' });
    prisma.pedido.create.mockResolvedValue({ id: 'pedido-1', total: 50 });

    const request = {
      json: async () => ({ 
        // userId removed from payload, inferred from session
        itens: [
          { fotoId: 'foto-1', precoPago: 20 },
          { fotoId: 'foto-2', precoPago: 30 }
        ]
      })
    };
    
    const response = await POST(request);
    expect(response.status).toBe(201);
    
    expect(prisma.pedido.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        userId: 'user-1',
        total: 50,
        status: 'PENDENTE'
      })
    }));
  });
});

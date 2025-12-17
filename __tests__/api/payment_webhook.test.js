
import { POST } from '@/app/api/webhooks/mercadopago/route';
import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

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
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    itemPedido: {
      findMany: jest.fn(),
    },
    saldo: {
      upsert: jest.fn(),
    },
    transacao: {
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(require('@/lib/prisma').default)),
  },
}));

// Mock fetch for Mercado Pago API
global.fetch = jest.fn();

// Access mocks
const prisma = require('@/lib/prisma').default;

describe('POST /api/webhooks/mercadopago', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.MERCADOPAGO_ACCESS_TOKEN = 'test-token';
  });

  const mockPaymentPayload = {
    type: 'payment',
    data: { id: '123456' }
  };

  const mockMercadoPagoResponse = {
    id: 123456,
    status: 'approved',
    external_reference: 'pedido-123'
  };

  const mockPedido = {
    id: 'pedido-123',
    status: 'PENDENTE',
    total: 100
  };

  const mockItems = [
    {
      id: 'item-1',
      precoPago: 50,
      foto: {
        id: 'foto-1',
        titulo: 'Praia',
        fotografoId: 'fotografo-1'
      }
    }
  ];

  it('should process a valid approved payment successfully', async () => {
    // Setup Mocks
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => mockMercadoPagoResponse
    });
    
    prisma.pedido.findUnique.mockResolvedValue(mockPedido);
    prisma.pedido.updateMany.mockResolvedValue({ count: 1 }); // Atomic update succeeded
    prisma.itemPedido.findMany.mockResolvedValue(mockItems);
    prisma.saldo.upsert.mockResolvedValue({});
    prisma.transacao.create.mockResolvedValue({});

    const request = {
      json: async () => mockPaymentPayload
    };

    const response = await POST(request);
    
    expect(response.status).toBe(200);
    expect(prisma.pedido.updateMany).toHaveBeenCalledWith(expect.objectContaining({
       where: { id: 'pedido-123', status: { not: 'PAGO' } },
       data: expect.objectContaining({ status: 'PAGO' })
    }));
    
    // Check commission distribution
    // 50 * 0.8 = 40
    expect(prisma.saldo.upsert).toHaveBeenCalledWith(expect.objectContaining({
        where: { fotografoId: 'fotografo-1' },
        create: expect.objectContaining({
            disponivel: new Prisma.Decimal(40),
        }),
        update: expect.objectContaining({
            disponivel: { increment: new Prisma.Decimal(40) }
        })
    }));
  });

  it('should ignore payment if order is already paid (Atomic Idempotency)', async () => {
     // Setup Mocks
     global.fetch.mockResolvedValue({
      ok: true,
      json: async () => mockMercadoPagoResponse
    });
    
    prisma.pedido.findUnique.mockResolvedValue({ ...mockPedido, status: 'PAGO' });
    // IMPORTANT: Simulate atomic update returning count: 0 (update failed because condition failed)
    prisma.pedido.updateMany.mockResolvedValue({ count: 0 }); 

    const request = {
      json: async () => mockPaymentPayload
    };

    const response = await POST(request);

    // It should still return success to the webhook (received: true)
    expect(response.data).toEqual({ received: true, message: "Already processed" });
    
    // Should attempt the atomic update
    expect(prisma.pedido.updateMany).toHaveBeenCalled();
    
    // BUT should NOT distribute funds again
    expect(prisma.itemPedido.findMany).not.toHaveBeenCalled();
    expect(prisma.saldo.upsert).not.toHaveBeenCalled();
  });
});

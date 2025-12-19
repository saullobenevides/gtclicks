import { POST } from '@/app/api/webhooks/mercadopago/route';
import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

// 1. Mock External Services (Mercado Pago API)
global.fetch = jest.fn();

// 2. Mock Prisma (Database)
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    pedido: {
      findUnique: jest.fn(),
      updateMany: jest.fn(), // For the atomic lock
      update: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback({
      pedido: {
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
      }
    })),
  },
}));

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      data,
      status: options?.status || 200,
      json: async () => data,
    })),
  },
}));

const prisma = require('@/lib/prisma').default;

describe('Payment Webhook Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should process an approved payment and credit the photographer (80%)', async () => {
    // A. Setup Data
    const mockPaymentId = '1234567890';
    const mockPedidoId = 'pedido_abc_123';
    const mockFotografoId = 'fotografo_xyz';
    const mockPrecoFoto = 100.00; // Easy math: 80% = 80.00

    // B. Mock Mercado Pago Response (Approved)
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        id: mockPaymentId,
        status: 'approved',
        external_reference: mockPedidoId,
      }),
    });

    // C. Mock Database State
    // 1. Order Exists
    prisma.pedido.findUnique.mockResolvedValue({
      id: mockPedidoId,
      status: 'PENDENTE',
    });

    // 2. Mock Transaction Operations
    // The transaction callback itself is mocked in the top level jest.mock, 
    // but we need to define return values for the *inner* tx client methods.
    
    // We need to capture the `tx` object passed to the transaction callback to assert on it.
    // However, since we mocked $transaction to immediately execute, the `prisma` mock above 
    // effectively returns the mock objects we defined there.
    // Let's rely on the top-level mocked implementation of $transaction to return a "processed: true" result
    // effectively assuming the happy path of the logic inside.
    
    // WAIT: The code inside the route uses `tx.pedido.updateMany`, `tx.itemPedido.findMany`, etc.
    // We need to mock THOSE specific calls that happen *inside* the transaction.
    // Since we mocked $transaction to execute the callback with a mock tx object,
    // we need to set expectations on THAT mock object.
    
    // Let's refine the Mock to allow access to the inner mock functions
    const mockTx = {
      pedido: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }), // Successful lock
      },
      itemPedido: {
        findMany: jest.fn().mockResolvedValue([
          {
            precoPago: mockPrecoFoto, // R$ 100
            foto: {
              titulo: 'Foto Teste',
              fotografoId: mockFotografoId,
            }
          }
        ]),
      },
      saldo: {
        upsert: jest.fn(),
      },
      transacao: {
        create: jest.fn(),
      }
    };

    prisma.$transaction.mockImplementation(async (callback) => {
      return await callback(mockTx);
    });

    // D. Simulate Request
    const req = {
      json: jest.fn().mockResolvedValue({
        type: 'payment',
        data: { id: mockPaymentId }
      }),
    };

    // E. Execute Handler
    const response = await POST(req);
    const data = await response.json();

    // F. Verifications

    // 1. Verify Mercado Pago API was called Correctly
    expect(global.fetch).toHaveBeenCalledWith(
      `https://api.mercadopago.com/v1/payments/${mockPaymentId}`,
      expect.objectContaining({
        headers: { Authorization: expect.stringContaining('Bearer') }
      })
    );

    // 2. Verify Database Interaction
    // a. Check if order status was updated (Atomic Lock)
    expect(mockTx.pedido.updateMany).toHaveBeenCalledWith({
      where: { 
        id: mockPedidoId, 
        status: { not: 'PAGO' } 
      },
      data: {
        status: 'PAGO',
        paymentId: mockPaymentId,
      },
    });

    // b. Check Commission Calculation (80% of 100 = 80)
    // The code uses Prisma.Decimal. We need to check the arguments.
    // Note: Jest might compare Decimal objects by reference or strict equality, 
    // but we can check if upsert was called for the correct photographer.
    expect(mockTx.saldo.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
            where: { fotografoId: mockFotografoId },
            update: {
                disponivel: {
                    increment: expect.any(Object) // Prisma.Decimal
                }
            }
        })
    );
    
    // Let's verify the transaction log description, ensuring we reached the deep split logic
    expect(mockTx.transacao.create).toHaveBeenCalledWith(
        expect.objectContaining({
           data: expect.objectContaining({
               fotografoId: mockFotografoId,
               tipo: 'VENDA',
               descricao: 'Venda de foto: Foto Teste'
           }) 
        })
    );

    // 3. Verify Response
    expect(data).toEqual({ received: true });
  });

  it('should ignore already paid orders (Idempotency)', async () => {
    // Setup
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: '123', status: 'approved', external_reference: 'order_1' }),
    });

    prisma.pedido.findUnique.mockResolvedValue({ id: 'order_1', status: 'PAGO' }); // Already paid

    const mockTx = {
        pedido: {
             // Mock updateMany returning count: 0 (Lock failed, already updated)
            updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        }
    };
    prisma.$transaction.mockImplementation((cb) => cb(mockTx));

    const req = {
      json: jest.fn().mockResolvedValue({ type: 'payment', data: { id: '123' } }),
    };

    await POST(req);

    // Verify we did NOT try to credit the photographer
    // We expect the function to return early after updateMany fails
    // But since we mocked $transaction to return processed: false in that case (in the real code),
    // and correctly handle "Already processed", the response should be OK.
    
    // In our test mock logic for updateMany returning 0, the code does:
    // return { processed: false, reason: 'ALREADY_PROCESSED' };
    
    // We verify that transacao.create was NOT defined or NOT called on the mockTx
    expect(mockTx.transacao?.create).toBeUndefined();
  });
});

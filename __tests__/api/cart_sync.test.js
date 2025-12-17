import { POST } from '@/app/api/carrinho/sync/route';
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
    carrinho: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    itemCarrinho: {
      create: jest.fn(),
    },
  },
}));

jest.mock('@/stack/server', () => ({
  stackServerApp: {
    getUser: jest.fn(),
  },
}));

jest.mock('@/lib/auth', () => ({
  getAuthenticatedUser: jest.fn(),
}));

// Access mocks
const prisma = require('@/lib/prisma').default;
const { getAuthenticatedUser } = require('@/lib/auth');

describe('POST /api/carrinho/sync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    getAuthenticatedUser.mockResolvedValue(null);
    const request = {};
    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it('should return 400 if validation fails', async () => {
    getAuthenticatedUser.mockResolvedValue({ id: 'user-1' });
    
    // Invalid item structure
    const request = {
      json: async () => ({ items: [{ invalid: 'structure' }] })
    };
    
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('should create cart if it does not exist', async () => {
    getAuthenticatedUser.mockResolvedValue({ id: 'user-1' });
    prisma.carrinho.findUnique
      .mockResolvedValueOnce(null) // First check: no cart
      .mockResolvedValueOnce({ id: 'cart-1', itens: [] }); // Second check (after create): return empty cart
      
    prisma.carrinho.create.mockResolvedValue({ id: 'cart-1', itens: [] });

    const request = {
      json: async () => ({ items: [] })
    };
    
    await POST(request);
    
    expect(prisma.carrinho.create).toHaveBeenCalledWith({
      data: { userId: 'user-1' },
      include: { itens: true },
    });
  });

  it('should add new items to cart', async () => {
    getAuthenticatedUser.mockResolvedValue({ id: 'user-1' });
    
    // Existing cart with no items
    const existingCart = { id: 'cart-1', itens: [] };
    
    prisma.carrinho.findUnique
      .mockResolvedValueOnce(existingCart) // First check
      .mockResolvedValueOnce(existingCart); // Second check (for return)

    const request = {
      json: async () => ({ 
        items: [{ fotoId: 'foto-123', titulo: 'Test Photo', preco: 10 }] 
      })
    };
    
    await POST(request);
    
    expect(prisma.itemCarrinho.create).toHaveBeenCalledWith({
      data: {
        carrinhoId: 'cart-1',
        fotoId: 'foto-123',
      },
    });
  });
});

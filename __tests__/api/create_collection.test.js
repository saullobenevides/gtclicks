import { POST } from '@/app/api/colecoes/create-draft/route';
import { NextResponse } from 'next/server';

// Mocks
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      data,
      status: options?.status || 200,
      json: async () => data, // Mock .json() method for tests
    })),
  },
}));

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    fotografo: {
      findUnique: jest.fn(),
    },
    colecao: {
      count: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('@/stack/server', () => ({
  stackServerApp: {
    getUser: jest.fn(),
  },
}));

jest.mock('@/lib/slug', () => ({
  slugify: jest.fn(() => 'nova-colecao'),
}));

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      data,
      status: options?.status || 200,
      json: async () => data,
    })),
  },
}));

// Access mocks
const prisma = require('@/lib/prisma').default;
const { stackServerApp } = require('@/stack/server');

describe('POST /api/colecoes/create-draft', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    stackServerApp.getUser.mockResolvedValue(null);
    const request = {};
    const response = await POST(request);
    
    expect(response.status).toBe(401);
  });

  it('should return 403 if photographer profile not found', async () => {
    stackServerApp.getUser.mockResolvedValue({ id: 'user-1' });
    prisma.fotografo.findUnique.mockResolvedValue(null);

    const request = {};
    const response = await POST(request);
    
    expect(response.status).toBe(403);
  });

  it('should create a collection successfully', async () => {
    stackServerApp.getUser.mockResolvedValue({ id: 'user-1' });
    prisma.fotografo.findUnique.mockResolvedValue({ id: 'photo-1' });
    prisma.colecao.findUnique.mockResolvedValue(null); // No collision
    prisma.colecao.create.mockResolvedValue({ id: 'col-1', slug: 'nova-colecao' });

    const request = {};
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.data.id).toBe('col-1');
    expect(prisma.colecao.create).toHaveBeenCalledWith({
      data: {
        nome: 'Nova Coleção',
        slug: 'nova-colecao',
        fotografoId: 'photo-1',
      },
    });
  });

  it('should handle slug collision', async () => {
    stackServerApp.getUser.mockResolvedValue({ id: 'user-1' });
    prisma.fotografo.findUnique.mockResolvedValue({ id: 'photo-1' });
    
    // Mock collision then free
    prisma.colecao.findUnique
      .mockResolvedValueOnce({ id: 'existing' }) // nova-colecao exists
      .mockResolvedValueOnce(null); // nova-colecao-1 is free

    prisma.colecao.create.mockResolvedValue({ id: 'col-2', slug: 'nova-colecao-1' });

    const request = {};
    const response = await POST(request);
    
    expect(response.status).toBe(201);
    expect(prisma.colecao.create).toHaveBeenCalledWith({
      data: {
        nome: 'Nova Coleção (1)',
        slug: 'nova-colecao-1',
        fotografoId: 'photo-1',
      },
    });
  });
});

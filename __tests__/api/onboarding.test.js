import { POST } from '@/app/api/fotografos/onboarding/route';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { NextResponse } from 'next/server';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    fotografo: {
      update: jest.fn(),
    },
  },
}));

jest.mock('@/lib/auth', () => ({
  getAuthenticatedUser: jest.fn(),
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

describe('Integration Test: Photographer Onboarding API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /*
   * HAPPY PATH
   */
  it('should successfully update photographer profile with onboarding data', async () => {
    // 1. Mock Authentication
    getAuthenticatedUser.mockResolvedValue({ id: 'user-123' });

    // 2. Mock Database Update
    const mockUpdatedFotografo = {
      id: 'foto-123',
      userId: 'user-123',
      cidade: 'São Paulo',
      estado: 'SP',
      cpf: '123.456.789-00',
      especialidades: ['Casamentos'],
    };
    prisma.fotografo.update.mockResolvedValue(mockUpdatedFotografo);

    // 3. Prepare Request
    const body = {
      cidade: 'São Paulo',
      estado: 'SP',
      instagram: 'testuser',
      portfolioUrl: 'https://test.com',
      bio: 'Test bio',
      especialidades: ['Casamentos'],
      equipamentos: 'Camera X',
      cpf: '123.456.789-00',
      chavePix: 'algo',
    };

    const req = {
      json: jest.fn().mockResolvedValue(body),
    };

    // 4. Call API
    const response = await POST(req);
    const data = await response.json();

    // 5. Verify Results
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.fotografo).toEqual(mockUpdatedFotografo);

    // Verify Prisma Call
    expect(prisma.fotografo.update).toHaveBeenCalledWith({
      where: { userId: 'user-123' },
      data: {
        cidade: body.cidade,
        estado: body.estado,
        instagram: body.instagram,
        portfolioUrl: body.portfolioUrl,
        bio: body.bio,
        especialidades: body.especialidades,
        equipamentos: body.equipamentos,
        cpf: body.cpf,
        chavePix: body.chavePix,
      },
    });
  });

  /*
   * ERROR: AUTHENTICATION
   */
  it('should return 401 if user is not authenticated', async () => {
    getAuthenticatedUser.mockResolvedValue(null);

    const req = {
      json: jest.fn().mockResolvedValue({}),
    };

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Não autorizado');
  });

  /*
   * ERROR: VALIDATION (CPF)
   */
  it('should return 400 if CPF is missing or too short', async () => {
    getAuthenticatedUser.mockResolvedValue({ id: 'user-123' });

    const body = {
      cidade: 'SP',
      cpf: '123', // Invalid
    };

    const req = {
      json: jest.fn().mockResolvedValue(body),
    };

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('CPF inválido');
  });
});

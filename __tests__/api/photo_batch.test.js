import { POST } from '@/app/api/fotos/batch/route';
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
    fotografo: {
      findUnique: jest.fn(),
    },
    foto: {
      deleteMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('@/lib/auth', () => ({
  getAuthenticatedUser: jest.fn(),
}));

// Mock AWS SDK dynamic imports
const mockSend = jest.fn();
jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn(() => ({ send: mockSend })),
  GetObjectCommand: jest.fn(),
  HeadObjectCommand: jest.fn(),
  PutObjectCommand: jest.fn(),
}), { virtual: true });

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(() => Promise.resolve('https://s3.amazonaws.com/preview')),
}), { virtual: true });

// Access mocks
const prisma = require('@/lib/prisma').default;
const { getAuthenticatedUser } = require('@/lib/auth');

describe('POST /api/fotos/batch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    getAuthenticatedUser.mockResolvedValue(null);
    const request = {};
    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it('should return 403 if trying to modify another photographer', async () => {
    getAuthenticatedUser.mockResolvedValue({ id: 'user-1' });
    prisma.fotografo.findUnique.mockResolvedValue({ id: 'photo-1' });

    const request = {
      json: async () => ({ 
        fotografoId: 'photo-2', // Different ID
        fotos: [] 
      })
    };
    
    const response = await POST(request);
    expect(response.status).toBe(403);
  });

  it('should create new photo successfully', async () => {
    getAuthenticatedUser.mockResolvedValue({ id: 'user-1' });
    prisma.fotografo.findUnique.mockResolvedValue({ id: 'photo-1' });
    prisma.foto.create.mockResolvedValue({ id: 'new-foto', s3Key: 'uploads/test.jpg' });

    const request = {
      json: async () => ({ 
        fotografoId: 'photo-1', 
        fotos: [{ 
            s3Key: 'uploads/test.jpg',
            titulo: 'New Photo',
            width: 1000,
            height: 1000,
            licencas: []
        }] 
      })
    };
    
    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(prisma.foto.create).toHaveBeenCalled();
  });

  it('should skip creation if file does not exist in S3 (Anti-Fraud)', async () => {
    getAuthenticatedUser.mockResolvedValue({ id: 'user-1' });
    prisma.fotografo.findUnique.mockResolvedValue({ id: 'photo-1' });
    
    // Simulate S3 HeadObject failure (File not found)
    mockSend.mockRejectedValue(new Error("NotFound"));

    const request = {
      json: async () => ({ 
        fotografoId: 'photo-1', 
        fotos: [{ 
            s3Key: 'uploads/fake_ghost.jpg',
            titulo: 'Ghost Photo'
        }] 
      })
    };
    
    const response = await POST(request);
    expect(response.status).toBe(200);
    
    // Should return empty list or processed list without checking db create for this item
    const data = await response.json();
    expect(data.data).toHaveLength(0); // Should have skipped the ghost file
    expect(prisma.foto.create).not.toHaveBeenCalled();
  });
});

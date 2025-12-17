process.env.S3_UPLOAD_BUCKET = 'test-bucket';
process.env.S3_UPLOAD_REGION = 'us-east-1';
process.env.S3_UPLOAD_ACCESS_KEY_ID = 'test-key';
process.env.S3_UPLOAD_SECRET_ACCESS_KEY = 'test-secret';

import { POST } from '@/app/api/upload/route';
import { NextResponse } from 'next/server';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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
  },
}));

jest.mock('@/stack/server', () => ({
  stackServerApp: {
    getUser: jest.fn(),
  },
}));

// Mock AWS SDK
jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn(),
  PutObjectCommand: jest.fn(),
}));

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(),
}));



jest.mock('@/lib/auth', () => ({
  getAuthenticatedUser: jest.fn(),
}));

// Access mocks
const prisma = require('@/lib/prisma').default;
const { getAuthenticatedUser } = require('@/lib/auth');

describe('POST /api/upload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.S3_UPLOAD_BUCKET = 'test-bucket';
    process.env.S3_UPLOAD_REGION = 'us-east-1';
    process.env.S3_UPLOAD_ACCESS_KEY_ID = 'test-key';
    process.env.S3_UPLOAD_SECRET_ACCESS_KEY = 'test-secret';
  });

  it('should return 401 if not authenticated', async () => {
    getAuthenticatedUser.mockResolvedValue(null);
    const request = {};
    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it('should return 403 if not a photographer', async () => {
    getAuthenticatedUser.mockResolvedValue({ id: 'user-1' });
    prisma.fotografo.findUnique.mockResolvedValue(null);
    const request = {};
    const response = await POST(request);
    expect(response.status).toBe(403);
  });

  it('should return 400 if filename is missing', async () => {
    getAuthenticatedUser.mockResolvedValue({ id: 'user-1' });
    prisma.fotografo.findUnique.mockResolvedValue({ id: 'photo-1' });
    
    const request = {
      json: async () => ({ contentType: 'image/jpeg' })
    };
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('should return 400 if content type is invalid', async () => {
    getAuthenticatedUser.mockResolvedValue({ id: 'user-1' });
    prisma.fotografo.findUnique.mockResolvedValue({ id: 'photo-1' });
    
    const request = {
      json: async () => ({ filename: 'test.pdf', contentType: 'application/pdf' })
    };
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('should return 200 with signed url on success', async () => {
    getAuthenticatedUser.mockResolvedValue({ id: 'user-1' });
    prisma.fotografo.findUnique.mockResolvedValue({ id: 'photo-1' });
    getSignedUrl.mockResolvedValue('https://s3.amazonaws.com/presigned-url');

    const request = {
      json: async () => ({ filename: 'test.jpg', contentType: 'image/jpeg' })
    };
    
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.uploadUrl).toBe('https://s3.amazonaws.com/presigned-url');
    expect(data.s3Key).toMatch(/uploads\/.*\.jpg/);
  });
});

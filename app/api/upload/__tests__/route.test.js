/** @jest-environment node */
import { POST } from "../route";
import { createMocks } from "node-mocks-http";
import { NextResponse } from "next/server";

// Mock dependencies
jest.mock("@/lib/auth", () => ({
  getAuthenticatedUser: jest.fn(),
}));

jest.mock("@/lib/prisma", () => ({
  fotografo: {
    findUnique: jest.fn(),
  },
}));

jest.mock("@/lib/s3-client", () => ({
  getS3Client: jest.fn(),
  s3Config: { bucket: "test-bucket" },
}));

jest.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: jest.fn().mockResolvedValue("https://mock-signed-url.com"),
}));

import { getAuthenticatedUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getS3Client } from "@/lib/s3-client";

describe("POST /api/upload", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if not authenticated", async () => {
    getAuthenticatedUser.mockResolvedValue(null);

    const { req } = createMocks({
      method: "POST",
    });

    const response = await POST(req);
    expect(response.status).toBe(401);
  });

  it("should return 403 if user is not a photographer", async () => {
    getAuthenticatedUser.mockResolvedValue({ id: "user-1" });
    prisma.fotografo.findUnique.mockResolvedValue(null);

    const { req } = createMocks({
      method: "POST",
    });

    const response = await POST(req);
    expect(response.status).toBe(403);
  });

  it("should return 200 and signed URL if authorized", async () => {
    getAuthenticatedUser.mockResolvedValue({ id: "user-1" });
    prisma.fotografo.findUnique.mockResolvedValue({ id: "photographer-1" });
    getS3Client.mockReturnValue({ send: jest.fn() }); // Mock S3 client instance

    const req = new Request("http://localhost/api/upload", {
      method: "POST",
      body: JSON.stringify({
        filename: "test.jpg",
        contentType: "image/jpeg",
        folder: "test-folder",
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.uploadUrl).toBe("https://mock-signed-url.com");
    expect(data.s3Key).toContain("test-folder/");
    expect(data.s3Key).toContain(".jpg");
  });
});

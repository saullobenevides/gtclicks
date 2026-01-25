/** @jest-environment node */
/** @jest-environment node */
import { POST } from "../route";
import { createMocks } from "node-mocks-http";
import { NextResponse } from "next/server";

jest.mock("@/lib/auth", () => ({
  getAuthenticatedUser: jest.fn(),
}));

jest.mock("@/lib/prisma", () => ({
  fotografo: {
    findUnique: jest.fn(),
  },
  foto: {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("@/lib/processing", () => ({
  processUploadedImage: jest.fn(),
}));

import { getAuthenticatedUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { processUploadedImage } from "@/lib/processing";

describe("POST /api/photos/process", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should rollback creation if processing fails", async () => {
    getAuthenticatedUser.mockResolvedValue({ id: "user-1" });
    prisma.fotografo.findUnique.mockResolvedValue({ id: "photographer-1" });

    prisma.foto.create.mockResolvedValue({ id: "photo-1", status: "PENDENTE" });
    prisma.foto.delete.mockResolvedValue({ id: "photo-1" });

    processUploadedImage.mockRejectedValue(new Error("Processing failed"));

    const req = new Request("http://localhost/api/photos/process", {
      method: "POST",
      body: JSON.stringify({
        s3Key: "uploads/test.jpg",
        colecaoId: "col-1",
        width: 100,
        height: 100,
      }),
    });

    const response = await POST(req);

    expect(response.status).toBe(500);
    expect(prisma.foto.create).toHaveBeenCalled();
    expect(processUploadedImage).toHaveBeenCalled();
    expect(prisma.foto.delete).toHaveBeenCalledWith({
      where: { id: "photo-1" },
    });
  });

  it("should complete successfully if processing works", async () => {
    getAuthenticatedUser.mockResolvedValue({ id: "user-1" });
    prisma.fotografo.findUnique.mockResolvedValue({ id: "photographer-1" });
    prisma.foto.create.mockResolvedValue({ id: "photo-1", status: "PENDENTE" });
    processUploadedImage.mockResolvedValue({
      previewUrl: "http://cdn/preview.jpg",
    });
    prisma.foto.update.mockResolvedValue({
      id: "photo-1",
      status: "PUBLICADA",
      previewUrl: "http://cdn/preview.jpg",
    });

    const req = new Request("http://localhost/api/photos/process", {
      method: "POST",
      body: JSON.stringify({
        s3Key: "uploads/test.jpg",
        colecaoId: "col-1",
        width: 100,
        height: 100,
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(prisma.foto.update).toHaveBeenCalledWith({
      where: { id: "photo-1" },
      data: expect.objectContaining({ status: "PUBLICADA" }),
    });
    expect(prisma.foto.delete).not.toHaveBeenCalled();
  });
});

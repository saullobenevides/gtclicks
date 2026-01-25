/** @jest-environment node */
import { POST } from "../create-draft/route"; // Adjust path to actual route file if needed
import { createMocks } from "node-mocks-http";
// Mock dependencies before imports
jest.mock("@/stack/server", () => ({
  stackServerApp: {
    getUser: jest.fn(),
  },
}));

jest.mock("@/lib/prisma", () => ({
  fotografo: {
    findUnique: jest.fn(),
  },
  colecao: {
    create: jest.fn(),
  },
}));

jest.mock("@/lib/slug", () => ({
  slugify: jest.fn().mockReturnValue("nova-colecao"),
}));

import { stackServerApp } from "@/stack/server";
import prisma from "@/lib/prisma";

describe("POST /api/colecoes/create-draft", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if user is not authenticated", async () => {
    stackServerApp.getUser.mockResolvedValue(null);

    const { req } = createMocks({ method: "POST" });
    const response = await POST(req);

    expect(response.status).toBe(401);
  });

  it("should return 403 if user is not a photographer", async () => {
    stackServerApp.getUser.mockResolvedValue({ id: "user-1" });
    prisma.fotografo.findUnique.mockResolvedValue(null);

    const { req } = createMocks({ method: "POST" });
    const response = await POST(req);

    expect(response.status).toBe(403);
  });

  it("should return 201 and create collection with unique slug", async () => {
    stackServerApp.getUser.mockResolvedValue({ id: "user-1" });
    prisma.fotografo.findUnique.mockResolvedValue({ id: "photographer-1" });

    // Mock successful creation
    const mockCollection = {
      id: "col-1",
      slug: "nova-colecao-timestamp",
      nome: "Nova Coleção",
    };
    prisma.colecao.create.mockResolvedValue(mockCollection);

    const { req } = createMocks({ method: "POST" });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(prisma.colecao.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          fotografoId: "photographer-1",
          slug: expect.stringContaining("nova-colecao-"),
        }),
      }),
    );
    expect(data.data).toEqual(mockCollection);
  });
});

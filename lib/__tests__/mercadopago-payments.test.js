import { createMocks } from "node-mocks-http";
import { POST } from "@/app/api/mercadopago/create-preference/route";
import prisma from "@/lib/prisma";

// Mock Prisma
jest.mock("@/lib/prisma", () => ({
  foto: {
    findUnique: jest.fn(),
  },
}));

describe("/api/mercadopago/create-preference", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.MERCADOPAGO_ACCESS_TOKEN = "test-token";
  });

  it("should return 400 if items are missing IDs", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: {
        pedidoId: "order-123",
        items: [{ title: "No ID item" }],
      },
    });

    // Mock Prisma returning null (item not found because ID is missing)
    prisma.foto.findUnique.mockResolvedValue(null);

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Nenhum item válido encontrado");
  });

  it("should attempt to create a preference with valid items", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: {
        pedidoId: "order-123",
        items: [{ id: "foto-1", title: "Great Photo" }],
      },
    });

    // Mock Prisma finding the photo
    prisma.foto.findUnique.mockResolvedValue({
      id: "foto-1",
      titulo: "Great Photo",
      colecaoId: "col-1",
      colecao: { precoFoto: 15.0 },
    });

    // Mock MP Fetch
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "pref-123", init_point: "http://mp.com" }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe("pref-123");
    expect(prisma.foto.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "foto-1" },
      }),
    );
  });
});

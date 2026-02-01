import { POST } from "@/app/api/mercadopago/create-preference/route";
import prisma from "@/lib/prisma";

// Mock Prisma (must be before route import so prisma is mocked when route loads)
jest.mock("@/lib/prisma", () => ({
  foto: {
    findUnique: jest.fn(),
  },
  fotoLicenca: {
    findUnique: jest.fn(),
  },
}));

// Mock NextResponse (edge runtime cookies not available in Jest)
jest.mock("next/server", () => ({
  NextResponse: {
    json: (data, init = {}) => ({
      status: init.status ?? 200,
      json: async () => data,
      headers: new Map(),
    }),
  },
}));

function createRequest(body) {
  return new Request("http://localhost/api/mercadopago/create-preference", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("/api/mercadopago/create-preference", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.MERCADOPAGO_ACCESS_TOKEN = "test-token";
  });

  it("should return 400 if items are missing IDs", async () => {
    prisma.foto.findUnique.mockResolvedValue(null);

    const request = createRequest({
      pedidoId: "order-123",
      items: [{ title: "No ID item" }],
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Nenhum item válido encontrado");
  });

  it("should attempt to create a preference with valid items", async () => {
    prisma.foto.findUnique.mockResolvedValue({
      id: "foto-1",
      titulo: "Great Photo",
      colecaoId: "col-1",
      colecao: { precoFoto: 15.0 },
    });
    prisma.fotoLicenca.findUnique.mockResolvedValue(null);

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "pref-123", init_point: "http://mp.com" }),
    });

    const request = createRequest({
      pedidoId: "order-123",
      items: [{ id: "foto-1", title: "Great Photo" }],
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe("pref-123");
    expect(prisma.foto.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "foto-1" },
      })
    );
  });
});

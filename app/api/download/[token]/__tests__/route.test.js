import { GET } from "@/app/api/download/[token]/route";
import prisma from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  itemPedido: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
  foto: { update: jest.fn() },
  colecao: { update: jest.fn() },
}));

jest.mock("@aws-sdk/client-s3", () => ({
  S3Client: jest.fn(),
  GetObjectCommand: jest.fn(),
}));

jest.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: jest
    .fn()
    .mockResolvedValue("https://s3-signed-url.example/file"),
}));

jest.mock("@/lib/auth", () => ({
  getAuthenticatedUser: jest.fn().mockResolvedValue(null),
}));

jest.mock("@/lib/rate-limit", () => ({
  checkDownloadRateLimit: jest.fn().mockResolvedValue({ allowed: true }),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: (data, init = {}) => ({
      status: init.status ?? 200,
      json: async () => data,
      headers: new Map(),
    }),
    redirect: (url) => ({
      status: 302,
      headers: new Map([["location", url]]),
      redirect: url,
    }),
  },
}));

describe("/api/download/[token]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.S3_UPLOAD_BUCKET = "test-bucket";
    process.env.S3_UPLOAD_REGION = "sa-east-1";
    process.env.S3_UPLOAD_ACCESS_KEY_ID = "test-key";
    process.env.S3_UPLOAD_SECRET_ACCESS_KEY = "test-secret";
  });

  it("should return 400 for missing token", async () => {
    const request = new Request("http://localhost/api/download/");
    const response = await GET(request, { params: Promise.resolve({}) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Token inválido");
  });

  it("should return 404 for invalid token", async () => {
    prisma.itemPedido.findFirst.mockResolvedValue(null);

    const request = new Request("http://localhost/api/download/invalid-token");
    const response = await GET(request, {
      params: Promise.resolve({ token: "invalid-token" }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Download não encontrado");
  });

  it("should return 403 when order is not paid", async () => {
    prisma.itemPedido.findFirst.mockResolvedValue({
      id: "item-1",
      downloadToken: "valid-token",
      fotoId: "foto-1",
      pedido: { status: "PENDENTE" },
      foto: { s3Key: "uploads/photo.jpg", titulo: "Foto", colecaoId: null },
    });

    const request = new Request("http://localhost/api/download/valid-token");
    const response = await GET(request, {
      params: Promise.resolve({ token: "valid-token" }),
    });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("Pedido não finalizado ou pagamento pendente");
  });

  it("should redirect to signed URL when order is paid", async () => {
    prisma.itemPedido.findFirst.mockResolvedValue({
      id: "item-1",
      downloadToken: "valid-token",
      fotoId: "foto-1",
      downloadsCount: 0,
      pedido: { status: "PAGO", userId: "user-1" },
      foto: {
        s3Key: "uploads/photo.jpg",
        titulo: "Minha Foto",
        colecaoId: "col-1",
      },
    });

    prisma.foto.update.mockResolvedValue({});
    prisma.colecao.update.mockResolvedValue({});
    prisma.itemPedido.update.mockResolvedValue({});

    const request = new Request("http://localhost/api/download/valid-token");
    const response = await GET(request, {
      params: Promise.resolve({ token: "valid-token" }),
    });

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe(
      "https://s3-signed-url.example/file"
    );
  });
});

jest.mock("@/lib/prisma", () => ({
  pedido: {
    findUnique: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
  itemPedido: { findMany: jest.fn() },
  saldo: { upsert: jest.fn() },
  transacao: { create: jest.fn() },
  foto: { update: jest.fn() },
  colecao: { update: jest.fn() },
  $transaction: jest.fn((cb) =>
    typeof cb === "function"
      ? cb({
          pedido: {
            findUnique: jest.fn(),
            update: jest.fn(),
            updateMany: jest.fn(),
          },
          itemPedido: { findMany: jest.fn() },
          saldo: { upsert: jest.fn() },
          transacao: { create: jest.fn() },
          foto: { update: jest.fn() },
          colecao: { update: jest.fn() },
        })
      : Promise.resolve()
  ),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: (data, init = {}) => ({
      status: init.status ?? 200,
      json: async () => data,
      headers: new Map(),
    }),
  },
}));

import { POST } from "@/app/api/webhooks/mercadopago/route";
import prisma from "@/lib/prisma";

function createRequest(body, extraHeaders = {}) {
  return new Request("http://localhost/api/webhooks/mercadopago", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  });
}

describe("/api/webhooks/mercadopago", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.MERCADOPAGO_WEBHOOK_SECRET;
    process.env.MERCADOPAGO_ACCESS_TOKEN = "test-token";
  });

  it("should return received:true for test ping (no paymentId)", async () => {
    const request = createRequest({ type: "test" });
    global.fetch = jest.fn();

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.received).toBe(true);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("should reject invalid signature when MERCADOPAGO_WEBHOOK_SECRET is set", async () => {
    process.env.MERCADOPAGO_WEBHOOK_SECRET = "my-secret";

    const request = createRequest(
      { type: "payment", data: { id: "pay-123" } },
      { "x-signature": "ts=1,v1=invalid", "x-request-id": "req-1" }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Invalid signature");
    expect(prisma.pedido.findUnique).not.toHaveBeenCalled();
  });

  it("should process PAGO (approved) and return 200 when payment is approved", async () => {
    const orderId = "order-123";
    const paymentId = "pay-456";
    const mockPayment = {
      status: "approved",
      external_reference: orderId,
      id: paymentId,
    };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockPayment),
    });

    const mockPedido = {
      id: orderId,
      userId: "user-1",
      total: 100,
      itens: [],
      user: { email: "u@u.com" },
    };
    prisma.pedido.findUnique.mockResolvedValue(mockPedido);
    prisma.pedido.updateMany.mockResolvedValue({ count: 1 });
    prisma.itemPedido.findMany.mockResolvedValue([
      {
        pedidoId: orderId,
        fotoId: "foto-1",
        precoPago: 100,
        foto: {
          titulo: "Foto 1",
          fotografoId: "fotografo-1",
          fotografo: { user: { id: "user-foto-1" } },
          colecaoId: "col-1",
        },
      },
    ]);
    prisma.$transaction.mockImplementation((cb) =>
      typeof cb === "function"
        ? cb({
            pedido: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
            itemPedido: { findMany: prisma.itemPedido.findMany },
            saldo: { upsert: jest.fn() },
            transacao: { create: jest.fn() },
            foto: { update: jest.fn() },
            colecao: { update: jest.fn() },
          })
        : Promise.resolve()
    );

    jest.mock("@/lib/config", () => ({
      getConfigNumber: jest.fn().mockResolvedValue(10),
      CONFIG_KEYS: { TAXA_PLATAFORMA: "TAXA_PLATAFORMA" },
    }));

    const request = createRequest({ type: "payment", data: { id: paymentId } });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.received).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      expect.any(Object)
    );
    expect(prisma.pedido.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: orderId } })
    );
  });
});

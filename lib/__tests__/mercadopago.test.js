import { sendPixPayout } from "../mercadopago";

// Mock fetch globally
global.fetch = jest.fn();

describe("lib/mercadopago.js - Payout Automation", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv, MERCADOPAGO_ACCESS_TOKEN: "test-token" };
    global.fetch.mockClear();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("should send a successful Pix payout", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: "mp-123", status: "approved" }),
    });

    const result = await sendPixPayout({
      amount: 50.0,
      pixKey: "123.456.789-01",
      description: "Test Saque",
      externalReference: "saque-abc",
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/v1/payments"),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer test-token",
          "X-Idempotency-Key": "saque-abc",
        }),
        body: expect.stringContaining('"pix_key":"12345678901"'), // Sanitized
      }),
    );
    expect(result.success).toBe(true);
    expect(result.id).toBe("mp-123");
  });

  it("should handle Mercado Pago API errors gracefully", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Insufficient balance" }),
    });

    const result = await sendPixPayout({
      amount: 1000.0,
      pixKey: "123.456.789-01",
      externalReference: "saque-big",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Insufficient balance");
  });

  it("should throw error if access token is missing", async () => {
    delete process.env.MERCADOPAGO_ACCESS_TOKEN;

    await expect(
      sendPixPayout({
        amount: 10,
        pixKey: "key",
        externalReference: "ref",
      }),
    ).rejects.toThrow("MERCADOPAGO_ACCESS_TOKEN is not defined");
  });
});

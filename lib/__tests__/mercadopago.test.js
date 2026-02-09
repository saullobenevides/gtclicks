import { sendPixPayout } from "../mercadopago";

describe("lib/mercadopago.js - Payout", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv, MERCADOPAGO_ACCESS_TOKEN: "test-token" };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("returns manualRequired when API does not support PIX payout", async () => {
    const result = await sendPixPayout({
      amount: 50.0,
      pixKey: "123.456.789-01",
      description: "Test Saque",
      externalReference: "saque-abc",
    });

    expect(result.success).toBe(false);
    expect(result.manualRequired).toBe(true);
    expect(result.error).toContain("Processe manualmente");
  });

  it("throws error if access token is missing", async () => {
    delete process.env.MERCADOPAGO_ACCESS_TOKEN;

    await expect(
      sendPixPayout({
        amount: 10,
        pixKey: "12345678901",
        externalReference: "ref",
      }),
    ).rejects.toThrow("MERCADOPAGO_ACCESS_TOKEN is not defined");
  });
});

import { calculateCommission } from "@/lib/utils";

describe("Financial Logic", () => {
  test("calculates split correctly for standard amounts (default 15%)", () => {
    // R$ 100.00 -> 85% = 85.00, 15% = 15.00
    const result1 = calculateCommission(100.0);
    expect(result1.photographerAmount).toBe(85.0);
    expect(result1.platformFee).toBe(15.0);

    // R$ 50.00 -> 85% = 42.50, 15% = 7.50
    const result2 = calculateCommission(50.0);
    expect(result2.photographerAmount).toBe(42.5);
    expect(result2.platformFee).toBe(7.5);
  });

  test("handles decimal amounts correctly", () => {
    // R$ 29.90 -> 85% = 25.415 (toFixed(2) -> 25.41), 15% = total - 25.41 = 4.49
    const result = calculateCommission(29.9);
    expect(result.photographerAmount).toBe(25.41);
    expect(result.platformFee).toBe(4.49);
    expect(result.photographerAmount + result.platformFee).toBe(29.9);
  });

  test("allows custom fee percentage", () => {
    // R$ 100.00 with 20% fee
    const result = calculateCommission(100.0, 20);
    expect(result.photographerAmount).toBe(80.0);
    expect(result.platformFee).toBe(20.0);
  });

  test("handles zero correctly", () => {
    const result = calculateCommission(0);
    expect(result.photographerAmount).toBe(0);
    expect(result.platformFee).toBe(0);
  });
});

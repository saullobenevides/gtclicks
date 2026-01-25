import { calculateCommission } from "@/lib/utils";

describe("Financial Logic", () => {
  test("calculates 80/20 split correctly for standard amounts", () => {
    // R$ 100.00
    const result1 = calculateCommission(100.00);
    expect(result1.photographerAmount).toBe(80.00);
    expect(result1.platformFee).toBe(20.00);

    // R$ 50.00
    const result2 = calculateCommission(50.00);
    expect(result2.photographerAmount).toBe(40.00);
    expect(result2.platformFee).toBe(10.00);
  });

  test("handles decimal amounts correctly", () => {
    // R$ 29.90 -> 80% = 23.92, 20% = 5.98
    const result = calculateCommission(29.90);
    expect(result.photographerAmount).toBe(23.92);
    expect(result.platformFee).toBe(5.98);
  });

  test("handles zero correctly", () => {
    const result = calculateCommission(0);
    expect(result.photographerAmount).toBe(0);
    expect(result.platformFee).toBe(0);
  });
});

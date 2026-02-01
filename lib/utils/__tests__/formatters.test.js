/**
 * Testes dos formatadores em lib/utils/formatters.js
 */
import {
  formatCurrency,
  formatDate,
  formatDateLong,
  formatDateShort,
} from "@/lib/utils/formatters";

describe("lib/utils/formatters", () => {
  describe("formatCurrency", () => {
    it("formata número em BRL", () => {
      expect(formatCurrency(100)).toMatch(/100|R\$\s*100/);
      expect(formatCurrency(29.9)).toMatch(/29,90|29\.90/);
    });

    it("aceita string numérica", () => {
      expect(formatCurrency("50")).toMatch(/50|R\$\s*50/);
    });

    it("trata null/undefined/0 como zero", () => {
      expect(formatCurrency(0)).toMatch(/0|R\$\s*0/);
      expect(formatCurrency(null)).toMatch(/0|R\$\s*0/);
      expect(formatCurrency(undefined)).toMatch(/0|R\$\s*0/);
    });
  });

  describe("formatDate", () => {
    it("formata Date para DD/MM/YYYY em pt-BR", () => {
      const d = new Date(2025, 11, 25);
      expect(formatDate(d)).toBe("25/12/2025");
    });

    it("aceita Date local e formata em pt-BR", () => {
      const d = new Date(2025, 0, 15);
      const result = formatDate(d);
      expect(result).toMatch(/15/);
      expect(result).toMatch(/2025/);
      expect(result).toMatch(/1|01/);
    });

    it("retorna fallback para null/undefined", () => {
      expect(formatDate(null)).toBe("Data não informada");
      expect(formatDate(undefined)).toBe("Data não informada");
    });
  });

  describe("formatDateLong", () => {
    it("formata com mês por extenso", () => {
      const d = new Date("2025-12-25");
      const result = formatDateLong(d);
      expect(result).toContain("25");
      expect(result).toMatch(/dezembro|Dezembro/);
      expect(result).toContain("2025");
    });

    it("retorna fallback para null", () => {
      expect(formatDateLong(null)).toBe("Data não informada");
    });
  });

  describe("formatDateShort", () => {
    it("formata com mês abreviado", () => {
      const d = new Date("2025-12-25");
      const result = formatDateShort(d);
      expect(result).toContain("25");
      expect(result).toMatch(/dez\.?|Dez\.?/i);
      expect(result).toContain("2025");
    });

    it("retorna fallback para undefined", () => {
      expect(formatDateShort(undefined)).toBe("Data não informada");
    });
  });
});

import { formatCurrency, calcularDescontoProgressivo, aplicarDesconto } from '@/lib/utils';

describe('formatCurrency', () => {
  test('formats currency correctly', () => {
    expect(formatCurrency(10).replace(/\u00a0/g, ' ')).toBe('R$ 10,00');
    expect(formatCurrency(1234.56).replace(/\u00a0/g, ' ')).toBe('R$ 1.234,56');
    expect(formatCurrency(0).replace(/\u00a0/g, ' ')).toBe('R$ 0,00');
  });

  test('handles decimal values', () => {
    expect(formatCurrency(9.99).replace(/\u00a0/g, ' ')).toBe('R$ 9,99');
    expect(formatCurrency(100.5).replace(/\u00a0/g, ' ')).toBe('R$ 100,50');
  });

  test('handles large numbers', () => {
    expect(formatCurrency(1000000).replace(/\u00a0/g, ' ')).toBe('R$ 1.000.000,00');
    expect(formatCurrency(999999.99).replace(/\u00a0/g, ' ')).toBe('R$ 999.999,99');
  });
});

describe('calcularDescontoProgressivo', () => {
  test('returns 0% discount for less than 3 photos', () => {
    expect(calcularDescontoProgressivo(1)).toBe(0);
    expect(calcularDescontoProgressivo(2)).toBe(0);
  });

  test('returns 5% discount for 3-4 photos', () => {
    expect(calcularDescontoProgressivo(3)).toBe(0.05);
    expect(calcularDescontoProgressivo(4)).toBe(0.05);
  });

  test('returns 10% discount for 5-9 photos', () => {
    expect(calcularDescontoProgressivo(5)).toBe(0.10);
    expect(calcularDescontoProgressivo(9)).toBe(0.10);
  });

  test('returns 15% discount for 10-19 photos', () => {
    expect(calcularDescontoProgressivo(10)).toBe(0.15);
    expect(calcularDescontoProgressivo(19)).toBe(0.15);
  });

  test('returns 20% discount for 20+ photos', () => {
    expect(calcularDescontoProgressivo(20)).toBe(0.20);
    expect(calcularDescontoProgressivo(50)).toBe(0.20);
    expect(calcularDescontoProgressivo(100)).toBe(0.20);
  });
});

describe('aplicarDesconto', () => {
  test('applies discount correctly', () => {
    expect(aplicarDesconto(100, 0.10)).toBe(90);
    expect(aplicarDesconto(50, 0.20)).toBe(40);
    expect(aplicarDesconto(200, 0.05)).toBe(190);
  });

  test('returns original value when discount is 0', () => {
    expect(aplicarDesconto(100, 0)).toBe(100);
  });

  test('handles decimal values', () => {
    expect(aplicarDesconto(99.99, 0.10)).toBeCloseTo(89.99, 2);
    expect(aplicarDesconto(15.50, 0.15)).toBeCloseTo(13.175, 2);
  });

  test('returns 0 for 100% discount', () => {
    expect(aplicarDesconto(100, 1.0)).toBe(0);
  });
});

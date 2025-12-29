import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import { formatCurrency } from "./utils/formatters";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Calcula o percentual de desconto progressivo baseado na quantidade de fotos
 * @param {number} quantidade - Número de fotos no carrinho
 * @returns {number} - Percentual de desconto (0.05 = 5%)
 */
export function calcularDescontoProgressivo(quantidade) {
  if (quantidade >= 20) return 0.20; // 20%
  if (quantidade >= 10) return 0.15; // 15%
  if (quantidade >= 5) return 0.10;  // 10%
  if (quantidade >= 3) return 0.05;  // 5%
  return 0; // 0%
}

/**
 * Aplica desconto a um valor
 * @param {number} valor - Valor original
 * @param {number} desconto - Percentual de desconto (0.10 = 10%)
 * @returns {number} - Valor com desconto aplicado
 */
export function aplicarDesconto(valor, desconto) {
  return valor * (1 - desconto);
}

export { formatCurrency };


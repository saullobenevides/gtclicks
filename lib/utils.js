import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
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
  if (quantidade >= 20) return 0.2; // 20%
  if (quantidade >= 10) return 0.15; // 15%
  if (quantidade >= 5) return 0.1; // 10%
  if (quantidade >= 3) return 0.05; // 5%
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

/**
 * Calcula a comissão do fotógrafo e da plataforma (80/20)
 * @param {number} totalAmount - Valor total da venda
 * @returns {{photographerAmount: number, platformFee: number}}
 */
export function calculateCommission(totalAmount) {
  const photographerRate = 0.8;
  const photographerAmount = Number(
    (totalAmount * photographerRate).toFixed(2),
  );
  const platformFee = Number((totalAmount - photographerAmount).toFixed(2));

  return { photographerAmount, platformFee };
}

export { formatCurrency };

/**
 * Formata uma data para o formato "há X tempo"
 * @param {Date|string} date - Data a ser formatada
 * @returns {string}
 */
export function formatTimeAgo(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);

  if (diffInSeconds < 60) return "agora mesmo";

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60)
    return `há ${diffInMinutes} ${diffInMinutes === 1 ? "minuto" : "minutos"}`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24)
    return `há ${diffInHours} ${diffInHours === 1 ? "hora" : "horas"}`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30)
    return `há ${diffInDays} ${diffInDays === 1 ? "dia" : "dias"}`;

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12)
    return `há ${diffInMonths} ${diffInMonths === 1 ? "mês" : "meses"}`;

  const diffInYears = Math.floor(diffInMonths / 12);
  return `há ${diffInYears} ${diffInYears === 1 ? "ano" : "anos"}`;
}

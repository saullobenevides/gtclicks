/**
 * Centralized formatting utilities for GTClicks
 */

/**
 * Formats a number as BRL currency
 * @param {number|string} amount 
 * @returns {string}
 */
export function formatCurrency(amount) {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

/**
 * Formats a date string or object to DD/MM/YYYY
 * @param {Date|string} date 
 * @returns {string}
 */
export function formatDate(date) {
  if (!date) return 'Data não informada';
  return new Date(date).toLocaleDateString('pt-BR');
}

/**
 * Formats a date with long month (ex: 25 de Dezembro de 2025)
 * @param {Date|string} date 
 * @returns {string}
 */
export function formatDateLong(date) {
  if (!date) return 'Data não informada';
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Formats a date with short month (ex: 25 Dez 2025)
 * @param {Date|string} date 
 * @returns {string}
 */
export function formatDateShort(date) {
  if (!date) return 'Data não informada';
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

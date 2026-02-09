/**
 * Validação de CPF para chave PIX.
 * Usamos CPF como chave Pix obrigatória por política do GTClicks.
 */

/**
 * Remove caracteres não numéricos do CPF
 */
export function sanitizeCpf(cpf: string): string {
  return cpf.replace(/\D/g, "");
}

/**
 * Valida se o CPF tem 11 dígitos e checksum correto.
 * Retorna true se válido.
 */
export function isValidCpf(cpf: string): boolean {
  const digits = sanitizeCpf(cpf);

  if (digits.length !== 11) return false;

  // Rejeita CPFs com todos os dígitos iguais
  if (/^(\d)\1{10}$/.test(digits)) return false;

  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits[i], 10) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(digits[9], 10)) return false;

  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits[i], 10) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(digits[10], 10)) return false;

  return true;
}

/**
 * Formata CPF para exibição mascarada: ***.***.***-34
 */
export function maskCpf(cpf: string): string {
  const digits = sanitizeCpf(cpf);
  if (digits.length !== 11) return "***.***.***-**";
  return `***.***.***-${digits.slice(-2)}`;
}

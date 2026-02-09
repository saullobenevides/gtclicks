import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatCurrency } from "./utils/formatters";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calcula o percentual de desconto progressivo baseado na quantidade de fotos
 */
export function calcularDescontoProgressivo(quantidade: number): number {
  if (quantidade >= 20) return 0.2; // 20%
  if (quantidade >= 10) return 0.15; // 15%
  if (quantidade >= 5) return 0.1; // 10%
  if (quantidade >= 3) return 0.05; // 5%
  return 0; // 0%
}

/**
 * Aplica desconto a um valor
 */
export function aplicarDesconto(valor: number, desconto: number): number {
  return valor * (1 - desconto);
}

/**
 * Calcula a comissão do fotógrafo e da plataforma
 * @note This function uses Number (float) math.
 * For financial transactions, prefer using Prisma.Decimal/Decimal.js to ensure precision.
 */
export function calculateCommission(
  totalAmount: number,
  platformFeePercent = 15
): { photographerAmount: number; platformFee: number } {
  const photographerRate = 1 - platformFeePercent / 100;
  const photographerAmount = Number(
    (totalAmount * photographerRate).toFixed(2)
  );
  const platformFee = Number((totalAmount - photographerAmount).toFixed(2));

  return { photographerAmount, platformFee };
}

export { formatCurrency };

export interface FormatCartItemTitleOptions {
  collectionName?: string;
  numeroSequencial?: number | null;
  photoId?: string;
}

/**
 * Formata o título do item do carrinho: "nome da coleção + IMG_id"
 */
export function formatCartItemTitle({
  collectionName,
  numeroSequencial,
  photoId = "",
}: FormatCartItemTitleOptions): string {
  const nome = (collectionName || "Foto").trim();
  const idPart =
    numeroSequencial != null
      ? `IMG_${String(numeroSequencial).padStart(4, "0")}`
      : `IMG_${String(photoId).replace(/\D/g, "").slice(-4) || "0000"}`;
  return `${nome} ${idPart}`;
}

/**
 * Formata uma data para o formato "há X tempo"
 */
export function formatTimeAgo(date: Date | string): string {
  const now = new Date();
  const diffInSeconds = Math.floor(
    (now.getTime() - new Date(date).getTime()) / 1000
  );

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

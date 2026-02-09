/**
 * Mercado Pago Payout Helper
 *
 * NOTA: A API v1 payments do Mercado Pago NÃO suporta PIX payout (envio para chave).
 * Erro: point_of_interaction.transaction_data.pix_key - wrong parameters.
 * Saques devem ser processados manualmente via app/website do Mercado Pago.
 */

export interface SendPixPayoutOptions {
  amount: number;
  pixKey: string;
  description?: string;
  externalReference: string;
}

export interface PixPayoutResult {
  success: boolean;
  id?: string;
  status?: string;
  details?: Record<string, unknown>;
  error?: string;
  /** Quando true, não reverte saldo; saque permanece PENDENTE para processamento manual */
  manualRequired?: boolean;
}

/**
 * Envio de PIX para saques. A API do Mercado Pago não suporta PIX payout;
 * retorna manualRequired para processamento manual via app do MP.
 *
 * @param options - Payout configuration
 * @returns Result com manualRequired quando a API não suporta
 */
export async function sendPixPayout({
  amount,
  pixKey,
  description,
  externalReference,
}: SendPixPayoutOptions): Promise<PixPayoutResult> {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error(
      "MERCADOPAGO_ACCESS_TOKEN is not defined in environment variables."
    );
  }

  const sanitizedPixKey = pixKey.replace(/\D/g, "");

  // A API v1 payments do Mercado Pago NÃO suporta PIX payout (envio para chave arbitrária).
  // Erro: "point_of_interaction.transaction_data.pix_key, pix_key_type" - wrong parameters.
  // A API é para RECEBER PIX (cliente paga loja), não para enviar.
  // Saques devem ser processados manualmente via app Mercado Pago (Transferir → PIX).
  console.log(
    `[MercadoPago] PIX payout não suportado via API. Saque manual: ${sanitizedPixKey.slice(-4)} R$ ${amount}`
  );
  return {
    success: false,
    error:
      "A API do Mercado Pago não suporta envio automático de PIX. " +
      "Processe manualmente via app/website do Mercado Pago (Transferir → PIX).",
    manualRequired: true,
  };
}

/**
 * Mercado Pago Webhook - Validação de assinatura
 * Conforme documentação: https://www.mercadopago.com.br/developers/en/docs/your-integrations/notifications/webhooks
 *
 * O header x-signature contém: ts=timestamp,v1=hash
 * O manifest é: id:[data.id];request-id:[x-request-id];ts:[ts];
 * HMAC-SHA256(manifest, secret) deve ser igual ao hash do header.
 */

import crypto from "crypto";

const TOLERANCE_SECONDS = 300; // 5 minutos - rejeita notificações muito antigas

/**
 * Valida a assinatura do webhook do Mercado Pago
 *
 * @param {Object} options
 * @param {string} options.xSignature - Valor do header x-signature
 * @param {string} options.xRequestId - Valor do header x-request-id
 * @param {string} options.dataId - ID do recurso (ex: body.data.id para pagamentos)
 * @param {string} options.secret - Secret do webhook (Your integrations > Webhooks)
 * @returns {{ valid: boolean; reason?: string }}
 */
export function validateWebhookSignature({
  xSignature,
  xRequestId,
  dataId,
  secret,
}) {
  if (!secret) {
    return { valid: true, reason: "NO_SECRET" };
  }

  if (!xSignature || !dataId) {
    return { valid: false, reason: "MISSING_HEADERS_OR_DATA" };
  }

  const parts = xSignature.split(",");
  let ts = null;
  let hash = null;

  for (const part of parts) {
    const [key, value] = part.split("=").map((s) => s.trim());
    if (key === "ts") ts = value;
    else if (key === "v1") hash = value;
  }

  if (!ts || !hash) {
    return { valid: false, reason: "INVALID_X_SIGNATURE_FORMAT" };
  }

  const tsNum = parseInt(ts, 10);
  if (isNaN(tsNum)) {
    return { valid: false, reason: "INVALID_TIMESTAMP" };
  }

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - tsNum) > TOLERANCE_SECONDS) {
    return { valid: false, reason: "TIMESTAMP_EXPIRED" };
  }

  const dataIdStr =
    typeof dataId === "string" ? dataId.toLowerCase() : String(dataId);
  const requestId = xRequestId || "";
  const manifest = `id:${dataIdStr};request-id:${requestId};ts:${ts};`;

  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(manifest);
  const expectedHash = hmac.digest("hex");

  if (expectedHash !== hash) {
    return { valid: false, reason: "SIGNATURE_MISMATCH" };
  }

  return { valid: true };
}

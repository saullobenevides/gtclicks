/**
 * Mercado Pago Payout Helper
 * This handles automated Pix transfers to photographers.
 */

const MP_API_URL = "https://api.mercadopago.com";

/**
 * Sends a Pix payout to a specific key.
 *
 * @param {Object} options
 * @param {number} options.amount - The amount in BRL
 * @param {string} options.pixKey - The Pix Key (CPF for this project)
 * @param {string} options.description - Transaction description
 * @param {string} options.externalReference - Unique ID for correlation
 * @returns {Promise<Object>} The result of the operation
 */
export async function sendPixPayout({
  amount,
  pixKey,
  description,
  externalReference,
}) {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error(
      "MERCADOPAGO_ACCESS_TOKEN is not defined in environment variables.",
    );
  }

  // Sanitize PIX Key (remove dots, dashes if it's a CPF)
  const sanitizedPixKey = pixKey.replace(/\D/g, "");

  try {
    console.log(
      `[MercadoPago] Initiating Pix payout for ${sanitizedPixKey}: R$ ${amount}`,
    );

    // Using the Payments API for Payouts (Standard PIX transfer)
    // Note: This requires the account to have balance and "Payouts" enabled.
    // If this specific endpoint doesn't suit the account type, the error response
    // will guide on which alternative (Transfers API) to use.
    const payload = {
      transaction_amount: Number(amount),
      description: description || "Saque GT Clicks",
      payment_method_id: "pix",
      external_reference: externalReference,
      // For payouts, the "payer" is the GT Clicks platform (identified by the token owner)
      // The "point_of_interaction" specifies where the money goes.
      point_of_interaction: {
        type: "payout",
        transaction_data: {
          pix_key: sanitizedPixKey,
          pix_key_type: "cpf", // We assume CPF as per project rules
        },
      },
    };

    const response = await fetch(`${MP_API_URL}/v1/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "X-Idempotency-Key": externalReference, // Use saqueId for idempotency
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(
        "[MercadoPago] Payout Error:",
        JSON.stringify(data, null, 2),
      );
      throw new Error(
        data.message || "Falha ao processar pagamento no Mercado Pago",
      );
    }

    console.log(
      `[MercadoPago] Payout Successful: ${data.id} - Status: ${data.status}`,
    );

    return {
      success: true,
      id: data.id,
      status: data.status,
      details: data,
    };
  } catch (error) {
    console.error("[MercadoPago] Payout Exception:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

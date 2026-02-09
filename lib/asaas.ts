/**
 * Asaas API - Transferências PIX
 *
 * Usado para saques automáticos aos fotógrafos.
 * POST /v3/transfers com pixAddressKey + pixAddressKeyType.
 * Docs: https://docs.asaas.com/docs/transfer-to-accounts-at-another-institution-pix-ted
 */

export type AsaasPixKeyType = "CPF" | "CNPJ" | "EMAIL" | "PHONE" | "EVP";

export interface AsaasTransferOptions {
  value: number;
  pixAddressKey: string;
  pixAddressKeyType: AsaasPixKeyType;
  description?: string;
  scheduleDate?: string | null;
}

export interface AsaasTransferResult {
  success: boolean;
  id?: string;
  status?: string;
  dateCreated?: string;
  error?: string;
  details?: Record<string, unknown>;
}

const ASAAS_API_BASE =
  process.env.ASAAS_SANDBOX === "true"
    ? "https://api-sandbox.asaas.com"
    : "https://api.asaas.com";

/**
 * Detecta o tipo da chave PIX pelo formato.
 * O app atualmente cadastra apenas CPF (11 dígitos).
 */
function detectPixKeyType(key: string): AsaasPixKeyType {
  const digits = key.replace(/\D/g, "");
  if (digits.length === 11) return "CPF";
  if (digits.length === 14) return "CNPJ";
  if (key.includes("@")) return "EMAIL";
  if (digits.length >= 10 && digits.length <= 11) return "PHONE";
  return "EVP"; // Chave aleatória
}

/**
 * Normaliza a chave para o formato esperado pelo Asaas.
 * CPF/CNPJ: apenas dígitos. PHONE: 11 dígitos com DDD.
 */
function normalizePixKey(key: string, type: AsaasPixKeyType): string {
  const digits = key.replace(/\D/g, "");
  if (type === "CPF" || type === "CNPJ") return digits;
  if (type === "EMAIL") return key.trim();
  return digits;
}

/**
 * Envia um PIX para a chave informada via API Asaas.
 *
 * @param options - value, pixAddressKey, pixAddressKeyType, description
 * @returns Result com success/error
 */
export async function sendPixTransfer(
  options: AsaasTransferOptions
): Promise<AsaasTransferResult> {
  const apiKey = process.env.ASAAS_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: "ASAAS_API_KEY não configurada. Configure Asaas para saques automáticos.",
    };
  }

  const { value, pixAddressKey, pixAddressKeyType, description } = options;
  const keyType = pixAddressKeyType || detectPixKeyType(pixAddressKey);
  const normalizedKey = normalizePixKey(pixAddressKey, keyType);

  if (!normalizedKey) {
    return { success: false, error: "Chave PIX inválida ou vazia" };
  }

  if (value <= 0) {
    return { success: false, error: "Valor da transferência deve ser maior que zero" };
  }

  const body: Record<string, unknown> = {
    value: Number(value.toFixed(2)),
    pixAddressKey: normalizedKey,
    pixAddressKeyType: keyType,
    description: description || "Saque GT Clicks",
  };

  if (options.scheduleDate) {
    body.scheduleDate = options.scheduleDate;
  }

  try {
    const res = await fetch(`${ASAAS_API_BASE}/v3/transfers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "GTClicks/1.0",
        access_token: apiKey,
      },
      body: JSON.stringify(body),
    });

    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;

    if (!res.ok) {
      const errMsg =
        (data.errors as Array<{ description?: string }>)?.[0]?.description ||
        (data.error as string) ||
        data.message ||
        `HTTP ${res.status}`;
      console.error("[Asaas] Transfer failed:", res.status, data);
      return {
        success: false,
        error: typeof errMsg === "string" ? errMsg : "Erro ao processar transferência",
        details: data,
      };
    }

    return {
      success: true,
      id: data.id as string,
      status: data.status as string,
      dateCreated: data.dateCreated as string,
      details: data,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro de rede ao enviar PIX";
    console.error("[Asaas] Transfer error:", err);
    return { success: false, error: message };
  }
}

/**
 * Verifica se o Asaas está configurado e disponível para saques automáticos.
 */
export function isAsaasConfigured(): boolean {
  return Boolean(process.env.ASAAS_API_KEY?.trim());
}

export interface AsaasBalanceResult {
  success: boolean;
  balance?: number;
  error?: string;
}

/**
 * Recupera o saldo disponível da conta Asaas.
 * Endpoint: GET /v3/finance/balance (permissão FINANCIAL_TRANSACTION:READ)
 * Docs: https://docs.asaas.com/reference/recuperar-saldo-da-conta
 */
export async function getAsaasBalance(): Promise<AsaasBalanceResult> {
  const apiKey = process.env.ASAAS_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: "ASAAS_API_KEY não configurada",
    };
  }

  try {
    const res = await fetch(`${ASAAS_API_BASE}/v3/finance/balance`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "GTClicks/1.0",
        access_token: apiKey,
      },
    });

    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;

    if (!res.ok) {
      const errMsg =
        (data.errors as Array<{ description?: string }>)?.[0]?.description ||
        (data.error as string) ||
        `HTTP ${res.status}`;
      return {
        success: false,
        error: typeof errMsg === "string" ? errMsg : "Erro ao consultar saldo",
      };
    }

    // Asaas pode retornar balance, Balance, value ou saldo
    const raw =
      (data.balance as number | undefined) ??
      (data as { Balance?: number }).Balance ??
      (data.value as number | undefined) ??
      (data as { saldo?: number }).saldo;
    const balance = typeof raw === "number" ? raw : 0;

    return {
      success: true,
      balance,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro de rede ao consultar saldo";
    console.error("[Asaas] Balance error:", err);
    return { success: false, error: message };
  }
}

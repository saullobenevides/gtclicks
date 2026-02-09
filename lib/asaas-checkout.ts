/**
 * Asaas Checkout API
 *
 * Cria checkout Asaas para pagamento via PIX e cartão.
 * Redireciona o cliente para a página do Asaas.
 * Docs: https://docs.asaas.com/docs/checkout-asaas
 */

const ASAAS_API_BASE =
  process.env.ASAAS_SANDBOX === "true"
    ? "https://api-sandbox.asaas.com"
    : "https://api.asaas.com";

const ASAAS_CHECKOUT_BASE =
  process.env.ASAAS_SANDBOX === "true"
    ? "https://sandbox.asaas.com"
    : "https://asaas.com";

export interface AsaasCheckoutItem {
  name: string;
  description?: string;
  quantity: number;
  value: number;
}

export interface AsaasCheckoutCustomerData {
  name: string;
  email: string;
  cpfCnpj?: string;
  phone?: string;
}

export interface CreateAsaasCheckoutOptions {
  /** Itens do pedido */
  items: AsaasCheckoutItem[];
  /** Referência externa (ex: nosso pedidoId) */
  externalReference: string;
  /** Dados do cliente para pré-preencher */
  customerData?: AsaasCheckoutCustomerData;
  /** URLs de callback (todas obrigatórias para o Asaas) */
  successUrl: string;
  cancelUrl: string;
  expiredUrl: string;
  /** Minutos até expirar (default: 60) */
  minutesToExpire?: number;
}

export interface AsaasCheckoutResult {
  success: boolean;
  checkoutUrl?: string;
  checkoutId?: string;
  error?: string;
}

/**
 * Cria um checkout Asaas e retorna a URL para redirecionar o cliente.
 */
export async function createAsaasCheckout(
  options: CreateAsaasCheckoutOptions
): Promise<AsaasCheckoutResult> {
  const apiKey = process.env.ASAAS_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: "ASAAS_API_KEY não configurada",
    };
  }

  if (!options.items || options.items.length === 0) {
    return { success: false, error: "Nenhum item no checkout" };
  }

  const total = options.items.reduce(
    (sum, i) => sum + i.value * (i.quantity || 1),
    0
  );
  if (total <= 0) {
    return { success: false, error: "Valor do pedido inválido" };
  }

  const callback: Record<string, string> = {
    successUrl: options.successUrl,
    cancelUrl: options.cancelUrl,
    expiredUrl: options.expiredUrl,
  };

  const body: Record<string, unknown> = {
    billingTypes: ["PIX"],
    chargeTypes: ["DETACHED"],
    minutesToExpire: options.minutesToExpire ?? 60,
    callback,
    items: options.items.map((i) => ({
      name: i.name,
      description: i.description ?? "",
      quantity: i.quantity || 1,
      value: Number((i.value * (i.quantity || 1)).toFixed(2)),
    })),
    externalReference: options.externalReference,
  };

  if (options.customerData) {
    body.customerData = {
      name: options.customerData.name,
      email: options.customerData.email,
      ...(options.customerData.cpfCnpj && {
        cpfCnpj: options.customerData.cpfCnpj.replace(/\D/g, ""),
      }),
      ...(options.customerData.phone && {
        phone: options.customerData.phone.replace(/\D/g, ""),
      }),
    };
  }

  try {
    const res = await fetch(`${ASAAS_API_BASE}/v3/checkouts`, {
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
        `HTTP ${res.status}`;
      console.error("[Asaas] Checkout failed:", res.status, data);
      const baseError =
        typeof errMsg === "string" ? errMsg : "Erro ao criar checkout";
      if (
        baseError.toLowerCase().includes("successurl") ||
        baseError.toLowerCase().includes("success url")
      ) {
        return {
          success: false,
          error:
            `${baseError} (URL enviada: ${options.successUrl}). ` +
            "Cadastre o domínio em sandbox.asaas.com > Minha Conta > Configurações > Informações, ou use ngrok + NEXT_PUBLIC_APP_URL.",
        };
      }
      return { success: false, error: baseError };
    }

    const checkoutId = data.id as string;
    const checkoutUrl = `${ASAAS_CHECKOUT_BASE}/checkoutSession/show?id=${checkoutId}`;

    return {
      success: true,
      checkoutUrl,
      checkoutId,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro de rede ao criar checkout";
    console.error("[Asaas] Checkout error:", err);
    return { success: false, error: message };
  }
}

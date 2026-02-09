"use client";

import { useEffect, useState } from "react";
import { Payment } from "@mercadopago/sdk-react";
import { initMercadoPago } from "@mercadopago/sdk-react";
import { Loader2 } from "lucide-react";
import { ErrorState } from "@/components/shared/states";

interface Payer {
  email?: string | null;
  firstName?: string;
  lastName?: string;
  identification?: { type?: string; number?: string };
}

export interface PaymentResult {
  status?: string;
  orderId?: string;
  error?: unknown;
  [key: string]: unknown;
}

interface PaymentBrickProps {
  amount: number;
  preferenceId?: string;
  payer?: Payer;
  onPaymentResult?: (result: PaymentResult) => void;
  orderId?: string;
}

/**
 * PaymentBrick Component
 * Wraps Mercado Pago Payment Brick for transparent checkout.
 */
export default function PaymentBrick({
  amount,
  preferenceId = undefined,
  payer,
  onPaymentResult,
  orderId,
}: PaymentBrickProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize Mercado Pago with Public Key
    const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;
    if (publicKey) {
      initMercadoPago(publicKey, { locale: "pt-BR" });
    } else {
      console.error("Mercado Pago Public Key not found");
    }
  }, []);

  const customization = {
    paymentMethods: {
      bankTransfer: "pix",
    },
    visual: {
      style: {
        theme: "dark" as const,
        customVariables: {
          formBackgroundColor: "#3a3a3a",
          baseColor: "#ff0000",
          baseColorFirstVariant: "#cc0000",
          baseColorSecondVariant: "#990000",
          buttonTextColor: "#ffffff",
          outlinePrimaryColor: "#ff0000",
        },
      },
    },
  };

  const onSubmit = async (payload: {
    selectedPaymentMethod?: string;
    formData?: Record<string, unknown>;
  }) => {
    try {
      const response = await fetch("/api/checkout/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formData: payload.formData,
          orderId,
        }),
      });

      const result = (await response.json()) as PaymentResult;

      if (onPaymentResult) {
        onPaymentResult(result);
      }
    } catch (error) {
      console.error("Payment error:", error);
      if (onPaymentResult) {
        onPaymentResult({ status: "error", error });
      }
    }
  };

  const onError = async (error: unknown) => {
    console.error("Brick error:", error);
  };

  const onReady = async () => {
    setIsLoading(false);
  };

  if (!process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY) {
    return (
      <ErrorState
        title="Erro de configuração"
        message="O pagamento não está disponível no momento. Entre em contato com o suporte."
        variant="alert"
      />
    );
  }

  const initialization = {
    amount,
    ...(payer && {
      payer: {
        email: payer.email ?? undefined,
        firstName: payer.firstName,
        lastName: payer.lastName,
        identification: payer.identification,
      },
    }),
  };

  return (
    <div className="payment-brick-container w-full max-w-xl mx-auto relative">
      {isLoading && (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Payment
        initialization={initialization as any}
        customization={customization as any}
        onSubmit={onSubmit as any}
        onReady={onReady}
        onError={onError as any}
      />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Payment } from "@mercadopago/sdk-react";
import { initMercadoPago } from "@mercadopago/sdk-react";
import { Loader2 } from "lucide-react";

/**
 * PaymentBrick Component
 * Wraps Mercado Pago Payment Brick for transparent checkout.
 */
export default function PaymentBrick({
  amount,
  preferenceId,
  payer,
  onPaymentResult,
  orderId,
}) {
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
      ticket: "all",
      bankTransfer: "all",
      creditCard: "all",
      debitCard: "all",
      // mercadoPago: "all" - Removed: requires preferenceId which is not being used
    },
    visual: {
      style: {
        theme: "dark",
        customVariables: {
          // DESIGN_SYSTEM: surface-card–like (#0a0a0a) / text-on-dark (#ffffff); SDK exige hex
          formBackgroundColor: "#0a0a0a",
          baseColor: "#ffffff",
        },
      },
    },
  };

  const onSubmit = async ({ selectedPaymentMethod, formData }) => {
    try {
      // Send data to our backend to process payment
      const response = await fetch("/api/checkout/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formData,
          orderId, // Pass orderId if retrying existing order
        }),
      });

      const result = await response.json();

      // Callback to parent component to handle result (success/fail)
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

  const onError = async (error) => {
    console.error("Brick error:", error);
  };

  const onReady = async () => {
    setIsLoading(false);
  };

  if (!process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY) {
    return (
      <div className="text-red-500 text-center p-4">
        Erro de configuração de pagamento
      </div>
    );
  }

  return (
    <div className="payment-brick-container w-full max-w-xl mx-auto relative">
      {isLoading && (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      <Payment
        initialization={{
          amount: amount,
          ...(payer && { payer }),
        }}
        customization={customization}
        onSubmit={onSubmit}
        onReady={onReady}
        onError={onError}
      />
    </div>
  );
}

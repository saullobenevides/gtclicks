"use client";

import { useEffect, useState } from "react";
import { Payment } from "@mercadopago/sdk-react";
import { initMercadoPago } from "@mercadopago/sdk-react";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

/**
 * Busca endereço por CEP via ViaCEP (gratuito, sem auth).
 * O Brick do MP usa api.mercadolibre.com que retorna 401 com nossa chave.
 */
async function fetchAddressByCep(cep) {
  const digits = cep.replace(/\D/g, "");
  if (digits.length !== 8) return null;
  const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
  const data = await res.json();
  if (data.erro) return null;
  return {
    zipCode: data.cep,
    federalUnit: data.uf,
    city: data.localidade,
    neighborhood: data.bairro,
    streetName: data.logradouro || "",
    streetNumber: "",
    complement: "",
  };
}

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
  const [cep, setCep] = useState("");
  const [addressFromCep, setAddressFromCep] = useState(null);
  const [cepLoading, setCepLoading] = useState(false);

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

  const handleBuscarCep = async () => {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) return;
    setCepLoading(true);
    try {
      const addr = await fetchAddressByCep(cep);
      if (addr) {
        setAddressFromCep(addr);
      }
    } catch (e) {
      console.error("CEP lookup failed:", e);
    } finally {
      setCepLoading(false);
    }
  };

  const mergedPayer =
    payer && addressFromCep ? { ...payer, address: addressFromCep } : payer;

  if (!process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY) {
    return (
      <div className="text-red-500 text-center p-4">
        Erro de configuração de pagamento
      </div>
    );
  }

  return (
    <div className="payment-brick-container w-full max-w-xl mx-auto relative space-y-4">
      <div className="space-y-2">
        <Label className="text-muted-foreground text-sm">
          Buscar endereço por CEP (preenche automaticamente para Boleto)
        </Label>
        <div className="flex gap-2">
          <Input
            placeholder="00000-000"
            value={cep}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(0, 8);
              setCep(v.length > 5 ? `${v.slice(0, 5)}-${v.slice(5)}` : v);
            }}
            onBlur={() =>
              cep.replace(/\D/g, "").length === 8 && handleBuscarCep()
            }
            maxLength={9}
            className="flex-1"
          />
          <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={handleBuscarCep}
            disabled={cepLoading || cep.replace(/\D/g, "").length !== 8}
          >
            {cepLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>
        {addressFromCep && (
          <p className="text-xs text-green-500/80">
            ✓ {addressFromCep.streetName}, {addressFromCep.neighborhood} -{" "}
            {addressFromCep.city}/{addressFromCep.federalUnit}
          </p>
        )}
      </div>

      {isLoading && (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      <Payment
        initialization={{
          amount: amount,
          ...(mergedPayer && { payer: mergedPayer }),
        }}
        customization={customization}
        onSubmit={onSubmit}
        onReady={onReady}
        onError={onError}
      />
    </div>
  );
}

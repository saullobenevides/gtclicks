"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

const appearance = {
  theme: "night",
  variables: {
    colorPrimary: "#ef233c",
    colorBackground: "#0a0a0a",
    colorText: "#fafafa",
    colorDanger: "#ef4444",
  },
};

function CheckoutForm({ onError, returnUrl, orderId }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl,
          receipt_email: undefined,
        },
      });

      if (error) {
        onError?.(error?.message || "Erro ao processar pagamento");
      }
    } catch (err) {
      onError?.(err?.message || "Erro inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement
        options={{
          layout: "tabs",
          defaultValues: { billingDetails: { address: { country: "BR" } } },
        }}
      />
      <Button
        type="submit"
        disabled={!stripe || !elements || loading}
        className="w-full"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processando...
          </>
        ) : (
          "Pagar"
        )}
      </Button>
    </form>
  );
}

export default function StripePaymentElementWrapper({
  amount,
  orderId,
  onError,
}) {
  const [clientSecret, setClientSecret] = useState(null);
  const [returnUrl, setReturnUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL || "https://gtclicks.com.br";

    const fetchIntent = async () => {
      try {
        const res = await fetch("/api/checkout/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Erro ao criar pagamento");
        }

        setClientSecret(data.clientSecret);
        setReturnUrl(
          data.returnUrl ||
            `${baseUrl}/checkout/sucesso?orderId=${data.orderId}`
        );
      } catch (err) {
        setError(err.message);
        onError?.(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchIntent();
  }, [orderId, onError]);

  const handleError = (msg) => {
    setError(msg);
    onError?.(msg);
  };

  if (!publishableKey) {
    return (
      <div className="text-status-error text-center p-4">
        Stripe não configurado (NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !clientSecret) {
    return (
      <div className="text-status-error text-center p-4 rounded-lg bg-status-error/10">
        {error}
      </div>
    );
  }

  if (!clientSecret) {
    return null;
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance,
        locale: "pt-BR",
      }}
    >
      <CheckoutForm
        onError={handleError}
        returnUrl={returnUrl}
        orderId={orderId}
      />
    </Elements>
  );
}

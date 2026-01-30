"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard } from "lucide-react";

export default function RetryPaymentButton({ orderId, items, user }) {
  const [loading, setLoading] = useState(false);

  const handleRetry = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/mercadopago/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pedidoId: orderId,
          items: items.map((item) => ({
            id: item.fotoId,
            title: item.titulo,
            quantity: 1,
            unit_price: Number(item.precoPaid),
            currency_id: "BRL",
            licencaId: item.licencaId,
          })),
          payer: {
            email: user.email || "cliente@gtclicks.com",
            name: (user.name || "Cliente GTClicks").split(" ")[0],
            surname: (user.name || "").split(" ").slice(1).join(" ") || "Teste",
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao gerar link de pagamento");
      }

      const data = await response.json();
      window.location.href = data.init_point;
    } catch (error) {
      console.error("Retry payment error:", error);
      alert("Erro ao processar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleRetry}
      disabled={loading}
      className="w-full gap-2 font-bold"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <CreditCard className="h-4 w-4" />
      )}
      {loading ? "Processando..." : "Finalizar Pagamento"}
    </Button>
  );
}

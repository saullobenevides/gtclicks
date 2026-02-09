import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@stackframe/stack";
import { useCart } from "../context/CartContext";

/**
 * Hook de checkout - usa Asaas (PIX).
 * Redireciona para /checkout para fluxo completo.
 */
export function useCheckout() {
  const router = useRouter();
  const user = useUser();
  const { items, getTotalPrice, getItemPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const processCheckout = async () => {
    if (!user) {
      router.push("/login?redirect=/checkout");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/asaas/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao processar checkout");
      }

      if (data.checkoutUrl) {
        clearCart();
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error("Resposta inválida do checkout");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  return { processCheckout, loading, error };
}

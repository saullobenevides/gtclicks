import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@stackframe/stack";
import { useCart } from "../context/CartContext";

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
      // Create order in database
      const orderResponse = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteId: user.id,
          itens: items.map((item) => ({
            fotoId: item.fotoId,
            licencaId: item.licencaId,
            precoUnitario: getItemPrice(item),
          })),
          total: getTotalPrice(),
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || "Erro ao criar pedido");
      }

      const orderData = await orderResponse.json();
      const pedidoId = orderData.data.id;

      // Create Mercado Pago preference
      const payerEmail =
        user.email || user.primaryEmail || "cliente@gtclicks.com";
      console.log("Preparing MP Preference for:", payerEmail);

      const mpResponse = await fetch("/api/mercadopago/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pedidoId,
          items: items.map((item) => ({
            id: item.fotoId,
            title: item.titulo,
            quantity: 1,
            unit_price: Number(getItemPrice(item)),
            currency_id: "BRL",
            licencaId: item.licencaId,
          })),
          payer: {
            email: payerEmail,
            name: (user.name || "Cliente GTClicks").split(" ")[0],
            surname: (user.name || "").split(" ").slice(1).join(" ") || "Teste",
          },
        }),
      });

      if (!mpResponse.ok) {
        const errorData = await mpResponse.json();
        throw new Error(errorData.error || "Erro ao criar pagamento");
      }

      const mpData = await mpResponse.json();

      clearCart();
      window.location.href = mpData.init_point;
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  return { processCheckout, loading, error };
}

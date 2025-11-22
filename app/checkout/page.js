"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@stackframe/stack";
import { useCart } from "@/components/CartContext";
import styles from "./page.module.css";

export default function CheckoutPage() {
  const router = useRouter();
  const user = useUser();
  const { items, getTotalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (items.length === 0) {
      router.push("/carrinho");
    }
  }, [items, router]);

  const handleCheckout = async () => {
    if (!user) {
      router.push("/login");
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
          itens: items.map(item => ({
            fotoId: item.fotoId,
            licencaId: item.licencaId,
            precoUnitario: item.preco,
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
      const mpResponse = await fetch("/api/mercadopago/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pedidoId,
          items: items.map(item => ({
            title: item.titulo,
            quantity: 1,
            unit_price: item.preco,
            currency_id: "BRL",
          })),
          payer: {
            email: user.primaryEmail || user.email,
            name: user.displayName || user.name,
          },
        }),
      });

      if (!mpResponse.ok) {
        const errorData = await mpResponse.json();
        throw new Error(errorData.error || "Erro ao criar pagamento");
      }

      const mpData = await mpResponse.json();
      
      // Clear cart and redirect to Mercado Pago
      clearCart();
      window.location.href = mpData.init_point;
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="container">
      <section className={styles.page}>
        <div className={styles.header}>
          <h1>Finalizar Compra</h1>
          <p>Revise seu pedido e prossiga para o pagamento</p>
        </div>

        <div className={styles.content}>
          <div className={styles.orderSummary}>
            <h2>Resumo do Pedido</h2>
            {items.map((item) => (
              <div key={`${item.fotoId}-${item.licencaId}`} className={styles.summaryItem}>
                <div className={styles.summaryInfo}>
                  <h4>{item.titulo}</h4>
                  <p>{item.licenca}</p>
                </div>
                <div className={styles.summaryPrice}>
                  R$ {Number(item.preco).toFixed(2)}
                </div>
              </div>
            ))}
            
            <div className={styles.summaryTotal}>
              <span>Total</span>
              <strong>R$ {getTotalPrice().toFixed(2)}</strong>
            </div>
          </div>

          <div className={styles.paymentSection}>
            <h2>Pagamento</h2>
            <div className={styles.paymentInfo}>
              <p>
                Você será redirecionado para o Mercado Pago para completar o pagamento
                de forma segura.
              </p>
              <p>
                Aceitamos cartão de crédito, débito e PIX.
              </p>
            </div>

            {error && (
              <div className={styles.error}>
                ❌ {error}
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={loading || !user}
              className="btn btn-primary"
              style={{ width: "100%", fontSize: "1.1rem", padding: "1rem" }}
            >
              {loading ? "Processando..." : "Ir para Pagamento"}
            </button>

            {!user && (
              <p className={styles.loginPrompt}>
                Você precisa estar logado para finalizar a compra.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

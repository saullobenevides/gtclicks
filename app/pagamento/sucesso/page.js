"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const pedidoId = searchParams.get("pedidoId");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pedidoId) {
      // Poll for order status
      const checkOrder = async () => {
        try {
          const response = await fetch(`/api/pedidos/${pedidoId}`);
          if (response.ok) {
            const data = await response.json();
            setOrder(data.data);
            setLoading(false);
          }
        } catch (error) {
          console.error("Error fetching order:", error);
        }
      };

      checkOrder();
      // Check again after a few seconds in case webhook hasn't processed yet
      const timer = setTimeout(checkOrder, 3000);
      return () => clearTimeout(timer);
    } else {
      setLoading(false);
    }
  }, [pedidoId]);

  return (
    <div className="container">
      <section className={styles.page}>
        <div className={styles.success}>
          <div className={styles.icon}>✓</div>
          <h1>Pagamento Aprovado!</h1>
          <p className={styles.subtitle}>
            Obrigado pela sua compra. Seu pedido foi processado com sucesso.
          </p>

          {loading ? (
            <p>Processando seu pedido...</p>
          ) : order && order.status === "PAGO" ? (
            <div className={styles.orderInfo}>
              <p>
                <strong>Pedido:</strong> #{pedidoId?.slice(0, 8)}
              </p>
              <p>
                <strong>Total:</strong> R$ {Number(order.total).toFixed(2)}
              </p>
              <p>
                <strong>Itens:</strong> {order.itens?.length || 0} {order.itens?.length === 1 ? 'foto' : 'fotos'}
              </p>
            </div>
          ) : (
            <p className={styles.processing}>
              Seu pedido está sendo processado. Você receberá um email de confirmação em breve.
            </p>
          )}

          <div className={styles.actions}>
            <Link href="/meus-downloads" className="btn btn-primary">
              Ver Meus Downloads
            </Link>
            <Link href="/busca" className="btn btn-outline">
              Continuar Comprando
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

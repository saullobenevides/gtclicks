"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import styles from "../sucesso/page.module.css";

export default function PaymentPendingPage() {
  const searchParams = useSearchParams();
  const pedidoId = searchParams.get("pedidoId");

  return (
    <div className="container">
      <section className={styles.page}>
        <div className={styles.pending}>
          <div className={styles.icon}>⏱</div>
          <h1>Pagamento Pendente</h1>
          <p className={styles.subtitle}>
            Seu pagamento está sendo processado.
          </p>

          <div className={styles.orderInfo}>
            <p>
              <strong>Pedido:</strong> #{pedidoId?.slice(0, 8)}
            </p>
            <p>
              Isso é comum para pagamentos via PIX ou boleto. Você receberá uma
              confirmação por email assim que o pagamento for aprovado.
            </p>
          </div>

          <div className={styles.actions}>
            <Link href="/meus-downloads" className="btn btn-primary">
              Ver Meus Pedidos
            </Link>
            <Link href="/busca" className="btn btn-outline">
              Continuar Navegando
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

"use client";

import Link from "next/link";
import styles from "../sucesso/page.module.css";

export default function PaymentFailurePage() {
  return (
    <div className="container">
      <section className={styles.page}>
        <div className={styles.failure}>
          <div className={styles.icon}>✗</div>
          <h1>Pagamento Não Aprovado</h1>
          <p className={styles.subtitle}>
            Infelizmente, não foi possível processar seu pagamento.
          </p>

          <div className={styles.orderInfo}>
            <p>
              Isso pode ter acontecido por diversos motivos, como dados incorretos,
              saldo insuficiente ou problemas com seu método de pagamento.
            </p>
          </div>

          <div className={styles.actions}>
            <Link href="/carrinho" className="btn btn-primary">
              Voltar ao Carrinho
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

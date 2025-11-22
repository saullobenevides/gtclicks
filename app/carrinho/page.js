"use client";

import Link from "next/link";
import { useCart } from "@/components/CartContext";
import styles from "./page.module.css";

export default function CartPage() {
  const { items, removeFromCart, clearCart, getTotalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="container">
        <section className={styles.page}>
          <div className={styles.header}>
            <h1>Seu carrinho está vazio</h1>
            <p>Explore nossas fotos incríveis e adicione as que você gostar!</p>
            <Link href="/busca" className="btn btn-primary">
              Explorar Fotos
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="container">
      <section className={styles.page}>
        <div className={styles.header}>
          <h1>Seu Carrinho</h1>
          <p>{items.length} {items.length === 1 ? 'item' : 'itens'} selecionado{items.length === 1 ? '' : 's'}</p>
        </div>

        <div className={styles.content}>
          <div className={styles.items}>
            {items.map((item) => (
              <div key={`${item.fotoId}-${item.licencaId}`} className={styles.item}>
                <div className={styles.itemImage}>
                  {item.previewUrl ? (
                    <img src={item.previewUrl} alt={item.titulo} />
                  ) : (
                    <div className={styles.placeholderImage}></div>
                  )}
                </div>
                <div className={styles.itemDetails}>
                  <h3>{item.titulo}</h3>
                  <p className={styles.itemLicense}>{item.licenca}</p>
                </div>
                <div className={styles.itemPrice}>
                  R$ {Number(item.preco).toFixed(2)}
                </div>
                <button
                  className={styles.itemRemove}
                  onClick={() => removeFromCart(item.fotoId, item.licencaId)}
                >
                  Remover
                </button>
              </div>
            ))}
          </div>

          <div className={styles.summary}>
            <h2>Resumo</h2>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>R$ {getTotalPrice().toFixed(2)}</span>
            </div>
            <div className={styles.summaryRow}>
              <strong>Total</strong>
              <strong>R$ {getTotalPrice().toFixed(2)}</strong>
            </div>
            <Link href="/checkout" className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }}>
              Finalizar Compra
            </Link>
            <button
              onClick={clearCart}
              className="btn btn-outline"
              style={{ width: "100%", marginTop: "0.5rem" }}
            >
              Limpar Carrinho
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

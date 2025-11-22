"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@stackframe/stack";
import styles from "./page.module.css";

export default function DownloadsPage() {
  const user = useUser();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Fetch user's purchases
    fetch(`/api/meus-downloads?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        setPurchases(data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch downloads:", err);
        setLoading(false);
      });
  }, [user]);

  if (!user) {
    return (
      <div className="container">
        <section className={styles.page}>
          <div className={styles.header}>
            <h1>Meus Downloads</h1>
            <p>Faça login para ver suas fotos compradas</p>
            <Link href="/login" className="btn btn-primary">
              Fazer Login
            </Link>
          </div>
        </section>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container">
        <section className={styles.page}>
          <div className={styles.header}>
            <h1>Meus Downloads</h1>
            <p>Carregando suas compras...</p>
          </div>
        </section>
      </div>
    );
  }

  if (purchases.length === 0) {
    return (
      <div className="container">
        <section className={styles.page}>
          <div className={styles.header}>
            <h1>Meus Downloads</h1>
            <p>Você ainda não comprou nenhuma foto</p>
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
          <h1>Meus Downloads</h1>
          <p>{purchases.length} {purchases.length === 1 ? 'foto comprada' : 'fotos compradas'}</p>
        </div>

        <div className={styles.grid}>
          {purchases.map((item) => (
            <div key={item.id} className={styles.card}>
              <div className={styles.cardImage}>
                {item.foto?.previewUrl ? (
                  <img src={item.foto.previewUrl} alt={item.foto.titulo} />
                ) : (
                  <div className={styles.placeholderImage}></div>
                )}
              </div>
              <div className={styles.cardContent}>
                <h3>{item.foto?.titulo || "Foto sem título"}</h3>
                <p className={styles.cardLicense}>{item.licenca?.nome}</p>
                <p className={styles.cardDate}>
                  Comprada em {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                </p>
                {item.downloadUrlAssinada ? (
                  <a
                    href={item.downloadUrlAssinada}
                    className="btn btn-primary"
                    style={{ width: "100%", marginTop: "1rem" }}
                    download
                  >
                    Baixar Original
                  </a>
                ) : (
                  <button
                    className="btn btn-outline"
                    style={{ width: "100%", marginTop: "1rem" }}
                    disabled
                  >
                    Em processamento...
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useUser } from "@stackframe/stack";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";

export default function MinhasFotosPage() {
  const user = useUser();
  const router = useRouter();
  const [fotos, setFotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    fetch(`/api/fotografos/fotos?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        setFotos(data.data || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching photos:", error);
        setLoading(false);
      });
  }, [user]);

  if (loading) {
    return (
      <div className="container">
        <div className={styles.page}>
          <p>Carregando suas fotos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <section className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1>Minhas Fotos</h1>
            <p>{fotos.length} {fotos.length === 1 ? 'foto publicada' : 'fotos publicadas'}</p>
          </div>
          <Link href="/dashboard/fotografo/upload" className="btn btn-primary">
            + Nova Foto
          </Link>
        </div>

        {fotos.length === 0 ? (
          <div className={styles.empty}>
            <h2>Nenhuma foto ainda</h2>
            <p>Comece fazendo upload das suas primeiras fotos!</p>
            <Link href="/dashboard/fotografo/upload" className="btn btn-primary">
              Fazer Upload
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {fotos.map((foto) => (
              <div key={foto.id} className={styles.card}>
                <div className={styles.cardImage}>
                  {foto.previewUrl ? (
                    <img src={foto.previewUrl} alt={foto.titulo} />
                  ) : (
                    <div className={styles.placeholder}></div>
                  )}
                </div>
                <div className={styles.cardContent}>
                  <h3>{foto.titulo}</h3>
                  <div className={styles.cardMeta}>
                    <span className={styles.tag}>{foto.categoria || 'Sem categoria'}</span>
                    <span className={styles.tag}>{foto.orientacao}</span>
                  </div>
                  <div className={styles.cardStats}>
                    <span>👁️ {foto.views || 0} views</span>
                    <span>❤️ {foto.likes || 0} likes</span>
                    <span>📥 {foto.downloads || 0} vendas</span>
                  </div>
                  <div className={styles.cardActions}>
                    <Link href={`/foto/${foto.id}`} className="btn btn-outline btn-sm">
                      Ver Detalhes
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

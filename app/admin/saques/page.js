"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function AdminSaquesPage() {
  const router = useRouter();
  const [saques, setSaques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    fetchSaques();
  }, []);

  const fetchSaques = async () => {
    try {
      const response = await fetch("/api/admin/saques");
      if (response.ok) {
        const data = await response.json();
        setSaques(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessar = async (saqueId, action) => {
    setProcessing(saqueId);
    try {
      const response = await fetch(`/api/admin/saques/${saqueId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        alert(`Saque ${action === "aprovar" ? "aprovado" : "cancelado"} com sucesso!`);
        fetchSaques();
      } else {
        alert("Erro ao processar saque");
      }
    } catch (error) {
      alert("Erro ao processar saque");
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className={styles.page}>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  const pendentes = saques.filter(s => s.status === "PENDENTE");
  const processados = saques.filter(s => s.status !== "PENDENTE");

  return (
    <div className="container">
      <section className={styles.page}>
        <div className={styles.header}>
          <h1>Gerenciar Saques</h1>
          <p>Processar solicitações de saque dos fotógrafos</p>
        </div>

        {/* Pendentes */}
        <div className={styles.section}>
          <h2>Pendentes ({pendentes.length})</h2>
          {pendentes.length === 0 ? (
            <p className={styles.empty}>Nenhum saque pendente</p>
          ) : (
            <div className={styles.grid}>
              {pendentes.map((saque) => (
                <div key={saque.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <span className={styles.badge}>PENDENTE</span>
                    <span className={styles.date}>
                      {new Date(saque.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.info}>
                      <strong>Fotógrafo:</strong> {saque.fotografo.username}
                    </div>
                    <div className={styles.info}>
                      <strong>Valor:</strong> R$ {Number(saque.valor).toFixed(2)}
                    </div>
                    <div className={styles.info}>
                      <strong>Chave PIX:</strong> 
                      <code className={styles.pix}>{saque.chavePix}</code>
                    </div>
                  </div>
                  <div className={styles.actions}>
                    <button
                      onClick={() => handleProcessar(saque.id, "aprovar")}
                      disabled={processing === saque.id}
                      className="btn btn-primary"
                    >
                      {processing === saque.id ? "Processando..." : "Aprovar"}
                    </button>
                    <button
                      onClick={() => handleProcessar(saque.id, "cancelar")}
                      disabled={processing === saque.id}
                      className="btn btn-outline"
                      style={{ borderColor: "var(--color-danger)", color: "var(--color-danger)" }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Processados */}
        <div className={styles.section}>
          <h2>Processados ({processados.length})</h2>
          {processados.length === 0 ? (
            <p className={styles.empty}>Nenhum saque processado</p>
          ) : (
            <div className={styles.list}>
              {processados.map((saque) => (
                <div key={saque.id} className={styles.listItem}>
                  <div className={styles.listInfo}>
                    <strong>{saque.fotografo.username}</strong>
                    <span>R$ {Number(saque.valor).toFixed(2)}</span>
                    <span>{new Date(saque.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <span className={`${styles.status} ${styles[saque.status.toLowerCase()]}`}>
                    {saque.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

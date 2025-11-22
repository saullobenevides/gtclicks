"use client";

import { useState, useEffect } from "react";
import { useUser } from "@stackframe/stack";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function FinanceiroPage() {
  const user = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saldo, setSaldo] = useState(null);
  const [transacoes, setTransacoes] = useState([]);
  const [chavePix, setChavePix] = useState("");
  const [editingPix, setEditingPix] = useState(false);
  const [valorSaque, setValorSaque] = useState("");
  const [solicitandoSaque, setSolicitandoSaque] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/fotografos/financeiro?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setSaldo(data.saldo);
        setTransacoes(data.transacoes || []);
        setChavePix(data.saldo?.chavePix || "");
      }
    } catch (error) {
      console.error("Error fetching financial data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePix = async () => {
    try {
      const response = await fetch("/api/fotografos/pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, chavePix }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Chave PIX salva com sucesso!" });
        setEditingPix(false);
        fetchData();
      } else {
        setMessage({ type: "error", text: "Erro ao salvar chave PIX" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao salvar chave PIX" });
    }
  };

  const handleSolicitarSaque = async () => {
    if (!chavePix) {
      setMessage({ type: "error", text: "Cadastre uma chave PIX primeiro" });
      return;
    }

    const valor = parseFloat(valorSaque);
    if (!valor || valor < 50) {
      setMessage({ type: "error", text: "Valor mínimo para saque: R$ 50,00" });
      return;
    }

    if (valor > parseFloat(saldo?.disponivel || 0)) {
      setMessage({ type: "error", text: "Saldo insuficiente" });
      return;
    }

    setSolicitandoSaque(true);
    try {
      const response = await fetch("/api/fotografos/saques", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, valor, chavePix }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Saque solicitado com sucesso! Será processado em até 2 dias úteis." });
        setValorSaque("");
        fetchData();
      } else {
        const data = await response.json();
        setMessage({ type: "error", text: data.error || "Erro ao solicitar saque" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao solicitar saque" });
    } finally {
      setSolicitandoSaque(false);
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

  return (
    <div className="container">
      <section className={styles.page}>
        <div className={styles.header}>
          <h1>Financeiro</h1>
          <p>Gerencie seus ganhos e saques</p>
        </div>

        {message.text && (
          <div className={`${styles.message} ${styles[message.type]}`}>
            {message.text}
          </div>
        )}

        <div className={styles.grid}>
          {/* Saldo */}
          <div className={styles.card}>
            <h2>Saldo Disponível</h2>
            <div className={styles.balance}>
              R$ {Number(saldo?.disponivel || 0).toFixed(2)}
            </div>
            {saldo?.bloqueado > 0 && (
              <p className={styles.blocked}>
                Bloqueado: R$ {Number(saldo.bloqueado).toFixed(2)}
              </p>
            )}
          </div>

          {/* Chave PIX */}
          <div className={styles.card}>
            <h2>Chave PIX</h2>
            {editingPix ? (
              <div className={styles.pixForm}>
                <input
                  type="text"
                  value={chavePix}
                  onChange={(e) => setChavePix(e.target.value)}
                  placeholder="Digite sua chave PIX"
                  className={styles.input}
                />
                <div className={styles.buttonRow}>
                  <button onClick={handleSavePix} className="btn btn-primary">
                    Salvar
                  </button>
                  <button onClick={() => setEditingPix(false)} className="btn btn-outline">
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className={styles.pixKey}>{chavePix || "Não cadastrada"}</p>
                <button onClick={() => setEditingPix(true)} className="btn btn-outline">
                  {chavePix ? "Alterar" : "Cadastrar"} Chave PIX
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Saque */}
        <div className={styles.card}>
          <h2>Solicitar Saque</h2>
          <p className={styles.info}>
            Valor mínimo: R$ 50,00 • Processamento em até 2 dias úteis
          </p>
          <div className={styles.withdrawForm}>
            <input
              type="number"
              value={valorSaque}
              onChange={(e) => setValorSaque(e.target.value)}
              placeholder="Valor do saque"
              min="50"
              step="0.01"
              className={styles.input}
            />
            <button
              onClick={handleSolicitarSaque}
              disabled={solicitandoSaque || !chavePix}
              className="btn btn-primary"
            >
              {solicitandoSaque ? "Solicitando..." : "Solicitar Saque"}
            </button>
          </div>
        </div>

        {/* Histórico */}
        <div className={styles.card}>
          <h2>Histórico de Transações</h2>
          {transacoes.length === 0 ? (
            <p className={styles.empty}>Nenhuma transação ainda</p>
          ) : (
            <div className={styles.transactions}>
              {transacoes.map((t) => (
                <div key={t.id} className={styles.transaction}>
                  <div className={styles.transactionInfo}>
                    <span className={styles.transactionType}>
                      {t.tipo === "VENDA" && "💰"}
                      {t.tipo === "COMISSAO" && "📊"}
                      {t.tipo === "SAQUE" && "💸"}
                      {" "}{t.descricao || t.tipo}
                    </span>
                    <span className={styles.transactionDate}>
                      {new Date(t.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <span className={`${styles.transactionValue} ${Number(t.valor) > 0 ? styles.positive : styles.negative}`}>
                    {Number(t.valor) > 0 ? "+" : ""}R$ {Math.abs(Number(t.valor)).toFixed(2)}
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

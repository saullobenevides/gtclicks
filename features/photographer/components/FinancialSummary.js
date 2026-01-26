"use client";

import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";
import {
  Wallet,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function FinancialSummary() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/fotografo/financeiro");
        if (!res.ok) throw new Error("Falha ao carregar dados");
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error(error);
        toast.error("Erro ao carregar saldo financeiro.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse h-48 bg-gray-100 dark:bg-zinc-800 rounded-lg w-full"></div>
    );
  }

  if (!data) return null;

  const { saldo, transacoes } = data;

  return (
    <div className="space-y-6">
      <span className="heading-display font-display font-black text-xl text-white">
        Financeiro
      </span>

      {/* Cards de Saldo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Disponível */}
        <div className="p-6 rounded-xl border border-white/10 bg-black/20 text-card-foreground shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">
              Saldo Disponível
            </h3>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-emerald-500">
            {formatCurrency(saldo.disponivel)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Pronto para saque
          </p>
          <Button
            className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10"
            disabled={saldo.disponivel <= 0}
            onClick={() => toast.info("Funcionalidade em desenvolvimento")}
          >
            Solicitar Saque
          </Button>
        </div>

        {/* Bloqueado (Futuro) */}
        <div className="p-6 rounded-xl border border-white/10 bg-black/20 text-card-foreground shadow-sm opacity-60">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">
              Em Processamento
            </h3>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-3xl font-bold text-zinc-500">
            {formatCurrency(saldo.bloqueado)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Liberado após período de segurança
          </p>
        </div>
      </div>

      {/* Lista de Transações */}
      <div className="rounded-xl border border-white/10 bg-black/20 text-card-foreground shadow-sm overflow-hidden text-white">
        <div className="p-6 border-b border-white/10">
          <h3 className="font-semibold">Histórico Recente</h3>
        </div>
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm text-left">
            <thead className="[&_tr]:border-b border-white/10">
              <tr className="border-b border-white/10 transition-colors hover:bg-white/5 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                  Data
                </th>
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                  Descrição
                </th>
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">
                  Valor
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0 text-white">
              {transacoes.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="p-4 text-center text-muted-foreground"
                  >
                    Nenhuma transação encontrada.
                  </td>
                </tr>
              ) : (
                transacoes.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-white/10 transition-colors hover:bg-white/5 data-[state=selected]:bg-muted"
                  >
                    <td className="p-4 align-middle">
                      {new Date(t.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="p-4 align-middle font-medium">
                      {t.descricao}
                    </td>
                    <td className="p-4 align-middle text-right">
                      <span
                        className={`font-bold flex items-center justify-end gap-1 ${t.tipo === "VENDA" ? "text-emerald-500" : "text-red-500"}`}
                      >
                        {t.tipo === "VENDA" ? (
                          <ArrowDownLeft className="w-3 h-3" />
                        ) : (
                          <ArrowUpRight className="w-3 h-3" />
                        )}
                        {formatCurrency(t.valor)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useMemo } from "react";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  Wallet,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SortableTableHead } from "@/components/shared/SortableTableHead";
import { toast } from "sonner";

import { getFinancialData } from "@/actions/photographers";

export default function FinancialSummary() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("createdAt");
  const [order, setOrder] = useState("desc");

  const handleSort = (field) => {
    setSort(field);
    setOrder((o) => (sort === field ? (o === "asc" ? "desc" : "asc") : "desc"));
  };
  const transacoes = data?.transacoes ?? [];
  const sortedTransacoes = useMemo(() => {
    if (!transacoes?.length) return [];
    return [...transacoes].sort((a, b) => {
      let va, vb;
      if (sort === "descricao") {
        va = (a.descricao ?? "").toLowerCase();
        vb = (b.descricao ?? "").toLowerCase();
      } else if (sort === "createdAt") {
        va = new Date(a.createdAt ?? 0).getTime();
        vb = new Date(b.createdAt ?? 0).getTime();
      } else if (sort === "valor") {
        va = Number(a.valor ?? 0);
        vb = Number(b.valor ?? 0);
      } else {
        va = a[sort];
        vb = b[sort];
      }
      if (va < vb) return order === "asc" ? -1 : 1;
      if (va > vb) return order === "asc" ? 1 : -1;
      return 0;
    });
  }, [transacoes, sort, order]);

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await getFinancialData();
        if (result.error) throw new Error(result.error);
        setData(result.data);
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

  const { saldo } = data;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="space-y-2">
        <h2 className="heading-display font-display font-black text-xl md:text-2xl text-white tracking-tight">
          Financeiro
        </h2>
        <p className="text-sm text-muted-foreground">
          Acompanhe seu saldo e histórico de transações
        </p>
      </div>

      {/* Saldo Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Disponível */}
        <Card className="bg-black/20 border-white/10 hover:bg-black/30 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">
              Saldo Disponível
            </h3>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold text-emerald-500">
              {formatCurrency(saldo.disponivel)}
            </div>
            <p className="text-xs text-muted-foreground">
              Pronto para saque via PIX
            </p>
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-10"
              disabled={saldo.disponivel <= 0}
              onClick={() => toast.info("Funcionalidade em desenvolvimento")}
            >
              Solicitar Saque
            </Button>
          </CardContent>
        </Card>

        {/* Bloqueado */}
        <Card className="bg-black/20 border-white/10 opacity-75">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">
              Em Processamento
            </h3>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold text-zinc-400">
              {formatCurrency(saldo.bloqueado)}
            </div>
            <p className="text-xs text-muted-foreground">
              Liberado após período de segurança (14 dias)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Histórico de Transações */}
      <Card className="bg-black/20 border-white/10 overflow-hidden">
        <CardHeader className="border-b border-white/10">
          <CardTitle className="text-white">Histórico Recente</CardTitle>
          <p className="text-sm text-muted-foreground">
            Últimas transações da sua conta
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-white/10">
                  <SortableTableHead
                    field="createdAt"
                    sort={sort}
                    order={order}
                    onSort={handleSort}
                    className="text-muted-foreground"
                  >
                    Data
                  </SortableTableHead>
                  <SortableTableHead
                    field="descricao"
                    sort={sort}
                    order={order}
                    onSort={handleSort}
                    className="text-muted-foreground"
                  >
                    Descrição
                  </SortableTableHead>
                  <SortableTableHead
                    field="valor"
                    sort={sort}
                    order={order}
                    onSort={handleSort}
                    className="text-right text-muted-foreground"
                  >
                    Valor
                  </SortableTableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transacoes.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="h-24 text-center text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Wallet className="h-8 w-8 opacity-20" />
                        <p>Nenhuma transação encontrada</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedTransacoes.map((t) => (
                    <TableRow
                      key={t.id}
                      className="border-white/10 hover:bg-white/5"
                    >
                      <TableCell className="font-medium whitespace-nowrap">
                        {new Date(t.createdAt).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {t.descricao}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "font-bold inline-flex items-center gap-1",
                            t.tipo === "VENDA"
                              ? "text-emerald-500"
                              : "text-red-500"
                          )}
                        >
                          {t.tipo === "VENDA" ? (
                            <ArrowDownLeft className="w-3 h-3" />
                          ) : (
                            <ArrowUpRight className="w-3 h-3" />
                          )}
                          {formatCurrency(t.valor)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

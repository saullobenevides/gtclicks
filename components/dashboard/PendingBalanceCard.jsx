"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Wallet, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PendingBalanceCard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/fotografos/stripe-connect/pending-balance")
      .then((res) => (res.ok ? res.json() : null))
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card className="bg-black/20 border-white/10">
        <CardContent className="py-8">
          <div className="animate-pulse h-24 bg-white/5 rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const { saldo, transacoes, pendingTransfers } = data;
  const totalPendente = (pendingTransfers?.totalCents || 0) / 100;
  const disponivel = Number(saldo?.disponivel || 0);
  const temSaldo = disponivel > 0 || totalPendente > 0;

  return (
    <div className="space-y-4">
      <Card className="bg-black/20 border-white/10">
        <CardHeader>
          <CardTitle className="text-base text-white flex items-center gap-2">
            <Wallet className="h-5 w-5 text-amber-500" />
            Saldo pendente de repasse
          </CardTitle>
          <CardDescription>
            Você tem vendas que serão repassadas automaticamente assim que
            configurar sua conta Stripe. Configure agora para receber.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-lg border border-white/10 bg-black/20 p-4">
              <p className="text-sm text-muted-foreground">Disponível</p>
              <p className="text-2xl font-bold text-green-500">
                R$ {disponivel.toFixed(2)}
              </p>
            </div>
            {pendingTransfers?.count > 0 && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
                <p className="text-sm text-muted-foreground">
                  Repasses na fila ({pendingTransfers.count})
                </p>
                <p className="text-2xl font-bold text-amber-400">
                  R$ {totalPendente.toFixed(2)}
                </p>
              </div>
            )}
          </div>

          {temSaldo && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
              <p className="text-sm text-white font-medium">
                Configure sua conta Stripe para receber estes valores na sua
                conta bancária. O repasse é automático.
              </p>
              <Button asChild className="mt-3" size="sm">
                <Link href="/dashboard/fotografo/stripe-connect">
                  Configurar conta agora
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}

          {transacoes?.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-white mb-2">
                Histórico recente
              </h4>
              <div className="rounded-lg border border-white/10 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-muted-foreground">
                        Descrição
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Data
                      </TableHead>
                      <TableHead className="text-right text-muted-foreground">
                        Valor
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transacoes.slice(0, 10).map((t) => (
                      <TableRow
                        key={t.id}
                        className="border-white/10 hover:bg-white/5"
                      >
                        <TableCell className="font-medium">
                          {t.descricao || t.tipo}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(t.createdAt).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-right font-bold",
                            Number(t.valor) > 0
                              ? "text-green-500"
                              : "text-muted-foreground"
                          )}
                        >
                          {Number(t.valor) > 0 ? "+" : ""}R${" "}
                          {Number(t.valor).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

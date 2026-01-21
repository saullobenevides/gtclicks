"use client";

import { useState, useEffect } from "react";
import { useUser } from "@stackframe/stack";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

function FinanceiroSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="mb-4 h-12 w-48" />
            <Skeleton className="h-4 w-24" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-32" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="mt-2 h-10 w-full" />
          <Skeleton className="mt-2 h-10 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function FinanceiroPage() {
  const user = useUser();
  const isUserLoading = user === undefined;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saldo, setSaldo] = useState(null);
  const [transacoes, setTransacoes] = useState([]);
  const [chavePix, setChavePix] = useState("");
  const [editingPix, setEditingPix] = useState(false);
  const [valorSaque, setValorSaque] = useState("");
  const [solicitandoSaque, setSolicitandoSaque] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const fetchData = async (userId) => {
    try {
      const response = await fetch(
        `/api/fotografos/financeiro?userId=${userId}`
      );
      if (response.ok) {
        const data = await response.json();
        setSaldo(data.saldo);
        setTransacoes(data.transacoes || []);
        setChavePix(data.saldo?.chavePix || "");
      }
    } catch (error) {
      console.error("Error fetching financial data:", error);
      setMessage({
        type: "error",
        text: "Não foi possível carregar os dados financeiros.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isUserLoading) return;
    if (!user) {
      router.push("/login?redirect=/dashboard/fotografo/financeiro");
      return;
    }
    fetchData(user.id);
  }, [user, isUserLoading, router]);

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
        fetchData(user.id);
      } else {
        setMessage({ type: "error", text: "Erro ao salvar chave PIX" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao salvar chave PIX" });
    }
  };

  const handleSolicitarSaque = async () => {
    if (!chavePix) {
      setMessage({ type: "error", text: "Cadastre uma chave PIX primeiro." });
      return;
    }
    const valor = parseFloat(valorSaque);
    if (!valor || valor < 50) {
      setMessage({ type: "error", text: "Valor mínimo para saque: R$ 50,00" });
      return;
    }
    if (valor > parseFloat(saldo?.disponivel || 0)) {
      setMessage({ type: "error", text: "Saldo insuficiente." });
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
        setMessage({
          type: "success",
          text: "Saque solicitado com sucesso! Será processado em até 2 dias úteis.",
        });
        setValorSaque("");
        fetchData(user.id);
      } else {
        const data = await response.json();
        setMessage({
          type: "error",
          text: data.error || "Erro ao solicitar saque.",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao solicitar saque." });
    } finally {
      setSolicitandoSaque(false);
    }
  };

  if (loading || isUserLoading) {
    return <FinanceiroSkeleton />;
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
        <p className="text-muted-foreground">Gerencie seus ganhos e saques.</p>
      </div>

      {message.text && (
        <Alert variant={message.type === "error" ? "destructive" : "default"}>
          {message.type === "error" ? (
            <AlertCircle className="h-4 w-4" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          <AlertTitle>
            {message.type === "error" ? "Erro" : "Sucesso"}
          </AlertTitle>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <Card className="bg-black/20 border-white/10">
          <CardHeader>
            <CardTitle>Saldo Disponível</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-green-500">
              R$ {Number(saldo?.disponivel || 0).toFixed(2)}
            </div>
            {saldo?.bloqueado > 0 && (
              <p className="text-sm text-muted-foreground">
                Saldo bloqueado: R$ {Number(saldo.bloqueado).toFixed(2)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-black/20 border-white/10">
          <CardHeader>
            <CardTitle>Chave PIX</CardTitle>
          </CardHeader>
          <CardContent>
            {editingPix ? (
              <div className="flex flex-col gap-4">
                <Input
                  type="text"
                  value={chavePix}
                  onChange={(e) => setChavePix(e.target.value)}
                  placeholder="Digite sua chave PIX"
                />
                <div className="flex gap-4">
                  <Button onClick={handleSavePix}>Salvar</Button>
                  <Button
                    onClick={() => setEditingPix(false)}
                    variant="outline"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="break-all rounded-md border border-white/10 bg-black/40 p-3 text-sm">
                  {chavePix || "Não cadastrada"}
                </p>
                <Button onClick={() => setEditingPix(true)} variant="outline">
                  {chavePix ? "Alterar" : "Cadastrar"} Chave PIX
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-black/20 border-white/10">
        <CardHeader>
          <CardTitle>Solicitar Saque</CardTitle>
          <CardDescription>
            Valor mínimo: R$ 50,00 • Processamento em até 2 dias úteis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              type="number"
              value={valorSaque}
              onChange={(e) => setValorSaque(e.target.value)}
              placeholder="Valor do saque"
              min="50"
              step="0.01"
              className="flex-1 bg-black/40 border-white/10"
            />
            <Button
              onClick={handleSolicitarSaque}
              disabled={solicitandoSaque || !chavePix}
            >
              {solicitandoSaque && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {solicitandoSaque ? "Solicitando..." : "Solicitar Saque"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-black/20 border-white/10">
        <CardHeader>
          <CardTitle>Histórico de Transações</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mobile View */}
          <div className="md:hidden space-y-4">
            {transacoes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma transação ainda.
              </div>
            ) : (
              transacoes.map((t) => (
                <div
                  key={t.id}
                  className="flex justify-between items-center py-3 border-b border-white/10 last:border-0"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-sm text-white">
                      {t.descricao || t.tipo}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(t.createdAt).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <span
                    className={`font-bold text-sm ${
                      Number(t.valor) > 0
                        ? "text-green-500"
                        : "text-muted-foreground"
                    }`}
                  >
                    {Number(t.valor) > 0 ? "+" : ""}R${" "}
                    {Number(t.valor).toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Desktop View */}
          <Table className="hidden md:table">
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead>Descrição</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transacoes.length === 0 ? (
                <TableRow className="border-white/10 hover:bg-white/5">
                  <TableCell colSpan={3} className="h-24 text-center">
                    Nenhuma transação ainda.
                  </TableCell>
                </TableRow>
              ) : (
                transacoes.map((t) => (
                  <TableRow
                    key={t.id}
                    className="border-white/10 hover:bg-white/5"
                  >
                    <TableCell>{t.descricao || t.tipo}</TableCell>
                    <TableCell>
                      {new Date(t.createdAt).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell
                      className={`text-right font-bold ${
                        Number(t.valor) > 0
                          ? "text-green-500"
                          : "text-muted-foreground"
                      }`}
                    >
                      {Number(t.valor) > 0 ? "+" : ""}R${" "}
                      {Number(t.valor).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

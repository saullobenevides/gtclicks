"use client";

import { useState, useEffect, useMemo } from "react";
import { useUser } from "@stackframe/stack";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
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
import { SortableTableHead } from "@/components/shared/SortableTableHead";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle2, Loader2, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import AppPagination from "@/components/shared/AppPagination";
import { toast } from "sonner";
import { getFinancialData, updatePixKey } from "@/actions/photographers";
import { requestWithdrawal } from "@/actions/payouts";
import { maskCpf } from "@/lib/cpf";

function FinanceiroSkeleton() {
  return (
    <div className="flex flex-col gap-6 md:gap-8 p-0">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40 bg-white/10" />
        <Skeleton className="h-4 w-64 bg-white/5" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
        <Card className="bg-black/20 border-white/10">
          <CardHeader>
            <Skeleton className="h-5 w-32 bg-white/10" />
          </CardHeader>
          <CardContent>
            <Skeleton className="mb-4 h-12 w-48 bg-white/10" />
            <Skeleton className="h-4 w-24 bg-white/5" />
          </CardContent>
        </Card>
        <Card className="bg-black/20 border-white/10">
          <CardHeader>
            <Skeleton className="h-5 w-24 bg-white/10" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full bg-white/5" />
            <Skeleton className="h-10 w-36 bg-white/5" />
          </CardContent>
        </Card>
      </div>
      <Card className="bg-black/20 border-white/10">
        <CardHeader>
          <Skeleton className="h-5 w-40 bg-white/10" />
          <Skeleton className="h-4 w-64 bg-white/5" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Skeleton className="h-10 flex-1 bg-white/5" />
            <Skeleton className="h-10 w-40 bg-white/10" />
          </div>
        </CardContent>
      </Card>
      <Card className="bg-black/20 border-white/10">
        <CardHeader>
          <Skeleton className="h-5 w-48 bg-white/10" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full bg-white/5" />
          <Skeleton className="mt-2 h-10 w-full bg-white/5" />
          <Skeleton className="mt-2 h-10 w-full bg-white/5" />
        </CardContent>
      </Card>
    </div>
  );
}

interface Transacao {
  id: string;
  descricao?: string | null;
  tipo?: string;
  valor: number;
  status?: string | null;
  observacao?: string | null;
  createdAt: string | Date;
}

function getStatusLabel(t: Transacao): string {
  const status = (t.status || "").toUpperCase();
  const tipo = (t.tipo || "").toUpperCase();
  if (status === "FALHOU") return "Falhou";
  if (status === "PENDENTE") {
    return tipo === "SAQUE" ? "Pendente (saque)" : "Pendente";
  }
  if (status === "PROCESSADO") {
    return Number(t.valor) > 0 ? "Creditado" : "Descontado";
  }
  // Transações antigas sem status: VENDA com valor positivo = creditado; SAQUE negativo = descontado se não pendente
  if (tipo === "VENDA" && Number(t.valor) > 0) return "Creditado";
  if (tipo === "SAQUE" && Number(t.valor) < 0) return "Descontado";
  return status || "—";
}

function getStatusLabelClass(t: Transacao): string {
  const label = getStatusLabel(t);
  if (label === "Creditado") return "text-emerald-500";
  if (label === "Descontado") return "text-amber-500";
  if (label === "Falhou") return "text-red-400";
  if (label.startsWith("Pendente")) return "text-muted-foreground";
  return "text-muted-foreground";
}

/** Mesma cor do status, para o valor (Creditado=verde, Descontado=âmbar, Falhou=vermelho). */
function getValorClass(t: Transacao): string {
  return getStatusLabelClass(t);
}

interface Saldo {
  disponivel?: number;
  bloqueado?: number;
}

export default function FinanceiroPage() {
  const user = useUser();
  const isUserLoading = user === undefined;
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const [loading, setLoading] = useState(true);
  const [saldo, setSaldo] = useState<Saldo | null>(null);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [chavePix, setChavePix] = useState("");
  const [editingPix, setEditingPix] = useState(false);
  const [valorSaque, setValorSaque] = useState("");
  const [solicitandoSaque, setSolicitandoSaque] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string }>({
    type: "",
    text: "",
  });
  const [minSaque, setMinSaque] = useState(50);
  const [sort, setSort] = useState("createdAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [verificationCode, setVerificationCode] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);

  const handleSort = (field: string) => {
    setSort(field);
    setOrder((o) => (sort === field ? (o === "asc" ? "desc" : "asc") : "desc"));
  };
  const sortedTransacoes = useMemo(() => {
    if (!transacoes?.length) return [];
    return [...transacoes].sort((a, b) => {
      let va: string | number;
      let vb: string | number;
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
        va = (a as unknown as Record<string, unknown>)[sort] as string | number;
        vb = (b as unknown as Record<string, unknown>)[sort] as string | number;
      }
      if (va < vb) return order === "asc" ? -1 : 1;
      if (va > vb) return order === "asc" ? 1 : -1;
      return 0;
    });
  }, [transacoes, sort, order]);

  const fetchData = async () => {
    try {
      const result = await getFinancialData();
      if (result.error) {
        throw new Error(result.error);
      }
      if (result.data) {
        const list = result.data.transacoes || [];
        setSaldo(result.data.saldo);
        setTransacoes(list);
        setChavePix(result.data.chavePix || "");
        if (typeof result.data.minSaque === "number") {
          setMinSaque(result.data.minSaque);
        }
        // Toast com a resposta do webhook quando há saque que falhou recentemente
        const falhaSaque = list.find(
          (t) =>
            (t.status || "").toUpperCase() === "FALHOU" &&
            t.observacao &&
            (Date.now() - new Date(t.createdAt).getTime() < 24 * 60 * 60 * 1000)
        );
        if (falhaSaque?.observacao) {
          toast.error("Saque não concluído", {
            description: falhaSaque.observacao,
          });
        }
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
    fetchData();
  }, [user, isUserLoading, router, page]);

  const handleSendCode = async () => {
    setSendingCode(true);
    setMessage({ type: "", text: "" });
    try {
      const response = await fetch("/api/auth/code/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "PIX_UPDATE" }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setMessage({ type: "success", text: "Código enviado para seu email!" });
        setShowCodeInput(true);
      } else {
        setMessage({
          type: "error",
          text: data.error || "Erro ao enviar código.",
        });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Erro ao enviar código." });
    } finally {
      setSendingCode(false);
    }
  };

  const handleSavePix = async () => {
    if (!verificationCode) {
      setMessage({ type: "error", text: "Digite o código de verificação." });
      return;
    }

    try {
      const result = await updatePixKey({
        chavePix,
        code: verificationCode,
      });
      if (result.success) {
        setMessage({
          type: "success",
          text: "Chave PIX atualizada com sucesso!",
        });
        setEditingPix(false);
        setShowCodeInput(false);
        setVerificationCode("");
        fetchData();
      } else {
        setMessage({
          type: "error",
          text: result.error || "Erro ao salvar chave PIX",
        });
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
    if (!valor || valor < minSaque) {
      setMessage({
        type: "error",
        text: `Valor mínimo para saque: R$ ${minSaque.toFixed(2)}`,
      });
      return;
    }
    if (valor > parseFloat(String(saldo?.disponivel || 0))) {
      setMessage({ type: "error", text: "Saldo insuficiente." });
      return;
    }

    setSolicitandoSaque(true);
    try {
      const result = await requestWithdrawal({ valor });
      if (result.success) {
        const msg =
          result.message ||
          "Saque enviado! O valor foi transferido para sua conta PIX.";
        setMessage({ type: "success", text: msg });
        toast.success(msg);
        setValorSaque("");
        fetchData();
      } else {
        const errMsg = result.error || "Erro ao solicitar saque.";
        setMessage({ type: "error", text: errMsg });
        toast.error("Saque não enviado", { description: errMsg });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao solicitar saque." });
      toast.error("Erro ao solicitar saque.");
    } finally {
      setSolicitandoSaque(false);
    }
  };

  if (loading || isUserLoading) {
    return <FinanceiroSkeleton />;
  }

  return (
    <div className="flex flex-col gap-6 md:gap-8 p-0">
      <div className="space-y-1">
        <h1 className="heading-display font-display text-2xl md:text-3xl font-black text-white tracking-tight">
          Financeiro
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Gerencie seus ganhos e saques
        </p>
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

      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
        <Card className="bg-black/20 border-white/10 hover:bg-black/30 transition-colors">
          <CardHeader>
            <CardTitle>Saldo Disponível</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-green-500">
              R$ {Number(saldo?.disponivel || 0).toFixed(2)}
            </div>
            {(saldo?.bloqueado ?? 0) > 0 && (
              <p className="text-sm text-muted-foreground">
                Saldo bloqueado: R$ {Number(saldo?.bloqueado).toFixed(2)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-black/20 border-white/10 hover:bg-black/30 transition-colors">
          <CardHeader>
            <CardTitle>CPF (Chave PIX)</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Para sua segurança, usamos o CPF como chave Pix obrigatória.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {editingPix ? (
              <div className="flex flex-col gap-4">
                <Input
                  type="text"
                  inputMode="numeric"
                  value={chavePix}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "");
                    if (v.length <= 11) setChavePix(v);
                  }}
                  placeholder="11 dígitos do CPF"
                  maxLength={11}
                />
                <div className="flex gap-4">
                  {showCodeInput ? (
                    <div className="flex flex-col gap-2 w-full">
                      <Input
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="Código de 6 dígitos"
                        maxLength={6}
                      />
                      <div className="flex gap-2">
                        <Button onClick={handleSavePix}>
                          Confirmar Código
                        </Button>
                        <Button
                          onClick={() => setShowCodeInput(false)}
                          variant="ghost"
                        >
                          Voltar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Button onClick={handleSendCode} disabled={sendingCode}>
                        {sendingCode
                          ? "Enviando..."
                          : "Enviar Código de Verificação"}
                      </Button>
                      <Button
                        onClick={() => setEditingPix(false)}
                        variant="outline"
                      >
                        Cancelar
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="break-all rounded-md border border-white/10 bg-black/40 p-3 text-sm font-mono">
                  {chavePix ? maskCpf(chavePix) : "Não cadastrada"}
                </p>
                <Button onClick={() => setEditingPix(true)} variant="outline">
                  {chavePix ? "Alterar" : "Cadastrar"} Chave PIX
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-black/20 border-white/10 hover:bg-black/30 transition-colors">
        <CardHeader>
          <CardTitle>Solicitar Saque</CardTitle>
          <CardDescription>
            {minSaque > 0
              ? `Valor mínimo: R$ ${minSaque.toFixed(2)} • `
              : ""}
            Transferência via PIX (processamento em até 24h).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {Number(saldo?.disponivel || 0) < minSaque ? (
            <div className="rounded-md bg-yellow-900/20 border border-yellow-700/50 p-4 text-sm text-yellow-200">
              {minSaque > 0 ? (
                <>
                  Você precisa acumular no mínimo{" "}
                  <strong>R$ {minSaque.toFixed(2)}</strong> para solicitar um
                  saque.
                </>
              ) : (
                <>
                  Você precisa ter saldo disponível para solicitar um saque.
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                type="number"
                value={valorSaque}
                onChange={(e) => setValorSaque(e.target.value)}
                placeholder="Valor do saque"
                min={minSaque}
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
          )}
        </CardContent>
      </Card>

      <Card className="bg-black/20 border-white/10 overflow-hidden">
        <CardHeader>
          <CardTitle>Histórico de Transações</CardTitle>
          <CardDescription>Últimas transações da sua conta</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="md:hidden space-y-3">
            {transacoes.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
                <Wallet className="h-10 w-10 opacity-20" />
                <div className="text-center space-y-1">
                  <p className="font-medium text-white">
                    Nenhuma transação ainda
                  </p>
                  <p className="text-xs">As vendas e saques aparecerão aqui</p>
                </div>
              </div>
            ) : (
              sortedTransacoes.map((t) => (
                <div
                  key={t.id}
                  className="flex justify-between items-center py-4 px-3 rounded-lg border-b border-white/10 last:border-0 hover:bg-white/5 transition-colors"
                >
                  <div className="flex flex-col gap-1.5">
                    <span className="font-semibold text-sm text-white">
                      {t.descricao || t.tipo}
                    </span>
                    <span className="text-xs text-muted-foreground/60">
                      {new Date(t.createdAt).toLocaleDateString("pt-BR")}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-medium",
                        getStatusLabelClass(t)
                      )}
                    >
                      {getStatusLabel(t)}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "font-black text-sm tracking-tight",
                      getValorClass(t)
                    )}
                  >
                    {Number(t.valor) > 0 ? "+" : ""}R${" "}
                    {Number(t.valor).toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>

          <Table className="hidden md:table">
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
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
                  field="createdAt"
                  sort={sort}
                  order={order}
                  onSort={handleSort}
                  className="text-muted-foreground"
                >
                  Data
                </SortableTableHead>
                <TableHead className="text-muted-foreground">
                  Status
                </TableHead>
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
              {sortedTransacoes.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Wallet className="h-8 w-8 opacity-20" />
                      <p>Nenhuma transação ainda</p>
                      <p className="text-xs">
                        As vendas e saques aparecerão aqui
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                sortedTransacoes.map((t) => (
                  <TableRow
                    key={t.id}
                    className="border-white/10 hover:bg-white/5"
                  >
                    <TableCell className="font-medium">
                      {t.descricao || t.tipo}
                    </TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {new Date(t.createdAt).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "font-medium",
                        getStatusLabelClass(t)
                      )}
                    >
                      {getStatusLabel(t)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-bold",
                        getValorClass(t)
                      )}
                    >
                      {Number(t.valor) > 0 ? "+" : ""}R${" "}
                      {Number(t.valor).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="mt-4">
            <AppPagination
              currentPage={page}
              totalPages={totalPages}
              baseUrl="/dashboard/fotografo/financeiro"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

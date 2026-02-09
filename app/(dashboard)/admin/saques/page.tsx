"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

interface Saque {
  id: string;
  valor: number;
  chavePix: string;
  status: string;
  observacao?: string;
  createdAt: string;
  fotografo: { username: string };
}

function SaquesSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
              <CardFooter className="gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
      <div>
        <Skeleton className="h-8 w-56 mb-6" />
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Skeleton className="h-5 w-24" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-5 w-20" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-5 w-28" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-5 w-24" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(3)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}

type ConfirmAction =
  | "aprovar"
  | "cancelar"
  | "reprocessar"
  | "confirmar_manual"
  | null;

export default function AdminSaquesPage() {
  const [saques, setSaques] = useState<Saque[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: string; text: string }>({
    type: "",
    text: "",
  });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmSaque, setConfirmSaque] = useState<Saque | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  const [asaasBalance, setAsaasBalance] = useState<number | null>(null);
  const [asaasBalanceError, setAsaasBalanceError] = useState<string | null>(null);

  const fetchSaques = async () => {
    try {
      const response = await fetch("/api/admin/saques");
      if (response.ok) {
        const data = await response.json();
        setSaques(data.data || []);
        setAsaasBalance(
          typeof data.asaasBalance === "number" ? data.asaasBalance : null
        );
        setAsaasBalanceError(data.asaasBalanceError || null);
      } else {
        setMessage({ type: "error", text: "Falha ao carregar saques." });
      }
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
      setMessage({ type: "error", text: "Erro de rede ao carregar saques." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaques();
  }, []);

  const openConfirm = (saque: Saque, action: ConfirmAction) => {
    setConfirmSaque(saque);
    setConfirmAction(action);
    setConfirmOpen(true);
  };

  const handleConfirmProcessar = async () => {
    if (!confirmSaque || !confirmAction) return;
    setConfirmOpen(false);
    setProcessing(confirmSaque.id);
    setMessage({ type: "", text: "" });
    try {
      const response = await fetch(`/api/admin/saques/${confirmSaque.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: confirmAction }),
      });

      if (response.ok) {
        setMessage({
          type: "success",
          text: `Saque ${
            confirmAction === "reprocessar"
              ? "reprocessado"
              : confirmAction === "aprovar"
                ? "aprovado"
                : confirmAction === "confirmar_manual"
                  ? "confirmado (processamento manual)"
                  : "cancelado"
          } com sucesso!`,
        });
        fetchSaques();
      } else {
        const data = await response.json();
        setMessage({
          type: "error",
          text: data.error || "Erro ao processar saque.",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erro de rede ao processar saque." });
    } finally {
      setProcessing(null);
      setConfirmSaque(null);
      setConfirmAction(null);
    }
  };

  const pendentes = saques.filter((s) => s.status === "PENDENTE");
  const falhas = saques.filter((s) => s.status === "FALHOU");
  const processados = saques.filter(
    (s) => !["PENDENTE", "FALHOU"].includes(s.status)
  );

  const [sort, setSort] = useState("createdAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const handleSort = (field: string) => {
    setSort(field);
    setOrder((o) => (sort === field ? (o === "asc" ? "desc" : "asc") : "desc"));
  };
  const sortedProcessados = useMemo(() => {
    const arr = [...processados];
    arr.sort((a, b) => {
      let va: string | number;
      let vb: string | number;
      if (sort === "valor") {
        va = Number(a.valor);
        vb = Number(b.valor);
      } else if (sort === "createdAt") {
        va = new Date(a.createdAt).getTime();
        vb = new Date(b.createdAt).getTime();
      } else if (sort === "fotografo") {
        va = (a.fotografo?.username ?? "").toLowerCase();
        vb = (b.fotografo?.username ?? "").toLowerCase();
      } else if (sort === "status") {
        va = (a.status ?? "").toLowerCase();
        vb = (b.status ?? "").toLowerCase();
      } else {
        va = (a as unknown as Record<string, unknown>)[sort] as string | number;
        vb = (b as unknown as Record<string, unknown>)[sort] as string | number;
      }
      if (va < vb) return order === "asc" ? -1 : 1;
      if (va > vb) return order === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [processados, sort, order]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold">Gerenciar Saques</h1>
        <p className="text-muted-foreground">
          Saques são processados automaticamente via PIX. Use esta página para
          reprocessar falhas ou cancelar pendentes.
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

      {loading ? (
        <SaquesSkeleton />
      ) : (
        <>
          {asaasBalance !== null && (
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg">Saldo Asaas</CardTitle>
                <CardDescription>
                  Saldo disponível na conta Asaas para saques PIX automáticos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  R$ {asaasBalance.toFixed(2)}
                </p>
              </CardContent>
            </Card>
          )}
          {asaasBalanceError && (
            <Alert variant="warning">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Saldo Asaas indisponível</AlertTitle>
              <AlertDescription>{asaasBalanceError}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">
              Pendentes e Falhas ({pendentes.length + falhas.length})
            </h2>
            {(pendentes.length === 0 && falhas.length === 0) ? (
              <Card className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">
                  Nenhum saque pendente ou com falha.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {[...pendentes, ...falhas].map((saque) => {
                  const isFalha = saque.status === "FALHOU";
                  return (
                  <Card key={saque.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{saque.fotografo.username}</span>
                        <Badge variant={isFalha ? "secondary" : "destructive"}>
                          {isFalha ? "FALHOU" : "PENDENTE"}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {new Date(saque.createdAt).toLocaleDateString("pt-BR")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-3xl font-bold">
                        R$ {Number(saque.valor).toFixed(2)}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-muted-foreground">
                          Chave PIX
                        </h4>
                        <p className="mt-1 break-all rounded-md border bg-muted p-2 font-mono text-sm">
                          {saque.chavePix}
                        </p>
                      </div>
                      {(isFalha || saque.observacao) && (
                        <div>
                          <h4 className="text-sm font-semibold text-muted-foreground">
                            {isFalha ? "Motivo da falha" : "Instrução"}
                          </h4>
                          <p
                            className={`mt-1 text-sm ${isFalha ? "text-destructive" : "text-muted-foreground"}`}
                          >
                            {saque.observacao}
                          </p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="gap-4">
                      {isFalha ? (
                        <Button
                          onClick={() => openConfirm(saque, "reprocessar")}
                          disabled={processing === saque.id}
                          className="flex-1"
                        >
                          {processing === saque.id && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Reprocessar
                        </Button>
                      ) : (
                        <>
                          <Button
                            onClick={() => openConfirm(saque, "confirmar_manual")}
                            disabled={processing === saque.id}
                            className="flex-1"
                          >
                            {processing === saque.id && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Confirmar manual
                          </Button>
                          <Button
                            onClick={() => openConfirm(saque, "cancelar")}
                            disabled={processing === saque.id}
                            variant="destructive"
                            className="flex-1"
                          >
                            Cancelar
                          </Button>
                        </>
                      )}
                    </CardFooter>
                  </Card>
                );})}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold">
              Processados ({processados.length})
            </h2>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fotógrafo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        Nenhum saque processado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedProcessados.map((saque) => (
                      <TableRow key={saque.id}>
                        <TableCell>{saque.fotografo.username}</TableCell>
                        <TableCell>
                          R$ {Number(saque.valor).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {new Date(saque.createdAt).toLocaleDateString(
                            "pt-BR"
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              saque.status === "APROVADO" ||
                              saque.status === "PROCESSADO"
                                ? "default"
                                : "outline"
                            }
                          >
                            {saque.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </div>
        </>
      )}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction === "reprocessar"
                ? "Reprocessar saque"
                : confirmAction === "confirmar_manual"
                  ? "Confirmar processamento manual"
                  : "Confirmar cancelamento do saque"}
            </DialogTitle>
            <DialogDescription>
              {confirmSaque && (
                <>
                  {confirmAction === "reprocessar" ? (
                    <>
                      Será tentado novamente o envio de R${" "}
                      {Number(confirmSaque.valor).toFixed(2)} para a chave PIX{" "}
                      <span className="font-mono">{confirmSaque.chavePix}</span>.
                      Tem certeza?
                    </>
                  ) : confirmAction === "confirmar_manual" ? (
                    <>
                      Confirma que você já transferiu R${" "}
                      {Number(confirmSaque.valor).toFixed(2)} para a chave PIX{" "}
                      <span className="font-mono">{confirmSaque.chavePix}</span>{" "}
                      manualmente?
                    </>
                  ) : (
                    <>
                      O saque de R$ {Number(confirmSaque.valor).toFixed(2)} será
                      cancelado e o valor retornará ao saldo do fotógrafo.
                    </>
                  )}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmProcessar}
              variant={
                confirmAction === "cancelar"
                  ? "destructive"
                  : "default"
              }
            >
              {confirmAction === "reprocessar"
                ? "Sim, reprocessar"
                : confirmAction === "confirmar_manual"
                  ? "Sim, já processei"
                  : confirmAction === "cancelar"
                    ? "Sim, cancelar"
                    : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

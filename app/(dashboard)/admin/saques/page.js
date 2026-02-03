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
import { SortableTableHead } from "@/components/shared/SortableTableHead";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

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

export default function AdminSaquesPage() {
  const [saques, setSaques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  const fetchSaques = async () => {
    try {
      const response = await fetch("/api/admin/saques");
      if (response.ok) {
        const data = await response.json();
        setSaques(data.data || []);
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

  const handleProcessar = async (saqueId, action) => {
    setProcessing(saqueId);
    setMessage({ type: "", text: "" });
    try {
      const response = await fetch(`/api/admin/saques/${saqueId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        setMessage({
          type: "success",
          text: `Saque ${
            action === "aprovar" ? "aprovado" : "cancelado"
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
    }
  };

  const pendentes = saques.filter((s) => s.status === "PENDENTE");
  const processados = saques.filter((s) => s.status !== "PENDENTE");

  const [sort, setSort] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const handleSort = (field) => {
    setSort(field);
    setOrder((o) => (sort === field ? (o === "asc" ? "desc" : "asc") : "desc"));
  };
  const sortedProcessados = useMemo(() => {
    const arr = [...processados];
    arr.sort((a, b) => {
      let va, vb;
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
        va = a[sort];
        vb = b[sort];
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
          Processar solicitações de saque dos fotógrafos.
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
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">
              Pendentes ({pendentes.length})
            </h2>
            {pendentes.length === 0 ? (
              <Card className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Nenhum saque pendente.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {pendentes.map((saque) => (
                  <Card key={saque.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{saque.fotografo.username}</span>
                        <Badge variant="destructive">PENDENTE</Badge>
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
                    </CardContent>
                    <CardFooter className="gap-4">
                      <Button
                        onClick={() => handleProcessar(saque.id, "aprovar")}
                        disabled={processing === saque.id}
                        className="flex-1"
                      >
                        {processing === saque.id && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Aprovar
                      </Button>
                      <Button
                        onClick={() => handleProcessar(saque.id, "cancelar")}
                        disabled={processing === saque.id}
                        variant="destructive"
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
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
                              saque.status === "APROVADO"
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
    </div>
  );
}

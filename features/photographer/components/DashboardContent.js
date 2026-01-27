"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useUser } from "@stackframe/stack";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Images, DollarSign, Upload, ArrowRight, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import FotografoOnboarding from "@/features/photographer/components/FotografoOnboarding";
import FinancialSummary from "./FinancialSummary";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, ExternalLink, Edit } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { Skeleton } from "@/components/ui/skeleton";

const AnalyticsOverview = dynamic(() => import("./AnalyticsOverview"), {
  ssr: false,
  loading: () => <Skeleton className="h-[400px] w-full bg-white/5" />,
});

export default function DashboardContent() {
  const user = useUser({ or: "redirect" });
  const router = useRouter();
  const [fotografo, setFotografo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetch(`/api/fotografos/resolve?userId=${user.id}`)
        .then(async (res) => {
          const payload = await res.json();
          if (res.ok) {
            if (payload.data) {
              setFotografo(payload.data);
            } else {
              router.replace("/dashboard/fotografo/onboarding");
            }
          }
        })
        .finally(() => setLoading(false));
    }
  }, [user, router]); // Adicionado router como dependência

  if (loading || !fotografo) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // Aggregate stats from ALL collections (if available) or use the summary from backend
  // For now, we use the collections returned (top 5) + generic counts to simulate totals if needed
  // In a real scenario, the backend should return 'totalSales', 'totalViews' separately.
  // We will sum the top 5 for now as a proxy or use the 'carrinhoCount' we added.

  // Let's assume the backend returned aggregating logic or we sum what we have.
  // Ideally, 'fotografo.colecoes' are just the recent ones.
  // We will rely on what we have:
  // Use aggregated stats from backend (or fallback to empty)
  const backendStats = fotografo.stats || {};

  const stats = {
    views: backendStats.views || 0,
    sales: backendStats.sales || 0,
    downloads: backendStats.downloads || 0,
    cartAdds: backendStats.cart || 0,
    revenue: backendStats.revenue || 0,
    ordersCount: backendStats.orders || 0,
  };

  // Derived KPIs
  const conversionRate =
    stats.views > 0 ? ((stats.sales / stats.views) * 100).toFixed(1) : "0.0";
  const avgTicket =
    stats.ordersCount > 0
      ? formatCurrency(stats.revenue / stats.ordersCount)
      : formatCurrency(0);

  return (
    <div className="flex flex-col gap-8 p-4 md:p-0">
      {/* Header & Main Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="heading-display font-display text-3xl font-black text-white sm:text-4xl">
            Visão Geral
          </h1>
          <p className="text-muted-foreground">
            Acompanhe o desempenho das suas coleções e vendas.
          </p>
        </div>
        <Button
          asChild
          size="lg"
          className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
        >
          <Link href="/dashboard/fotografo/colecoes">
            <PlusCircle className="mr-2 h-5 w-5" />
            Nova Coleção
          </Link>
        </Button>
      </div>

      {/* Analytics Section */}
      <AnalyticsOverview stats={{ ...stats, avgTicket, conversionRate }} />

      {/* Recent Events Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="heading-display font-display font-black text-xl md:text-2xl text-white">
            Coleções Recentes
          </h2>
          <Link
            href="/dashboard/fotografo/colecoes"
            className="text-sm text-primary hover:underline"
          >
            Ver todas
          </Link>
        </div>

        {/* Mobile View: Cards */}
        <div className="md:hidden space-y-4">
          {(fotografo.colecoes || []).length === 0 ? (
            <Card className="bg-black/20 border-white/10">
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhuma coleção encontrada.
              </CardContent>
            </Card>
          ) : (
            fotografo.colecoes.map((col) => (
              <Card key={col.id} className="bg-black/20 border-white/10">
                <CardContent className="p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-white">{col.nome}</h3>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(col.createdAt)}
                      </p>
                    </div>
                    <Badge
                      variant={
                        col.status === "PUBLICADA" ? "default" : "secondary"
                      }
                      className={
                        col.status === "PUBLICADA"
                          ? "bg-green-500/10 text-green-500"
                          : ""
                      }
                    >
                      {col.status === "PUBLICADA" ? "Ativo" : "Rascunho"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="flex flex-col">
                      <span className="text-muted-foreground text-xs">
                        Views
                      </span>
                      <span>{col.views}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground text-xs">
                        Carrinho
                      </span>
                      <span>{col.carrinhoCount}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground text-xs">
                        Vendas
                      </span>
                      <span className="text-green-400 font-bold">
                        {col.vendas}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      className="h-11 w-11 text-muted-foreground hover:text-white bg-white/5"
                    >
                      <Link
                        href={`/dashboard/fotografo/colecoes/${col.id}/editar`}
                      >
                        <Edit className="h-5 w-5" />
                      </Link>
                    </Button>
                    {col.status === "PUBLICADA" && (
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="h-11 w-11 text-muted-foreground hover:text-white bg-white/5"
                      >
                        <Link href={`/colecoes/${col.slug}`} target="_blank">
                          <ExternalLink className="h-5 w-5" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Desktop View: Table */}
        <Card className="hidden md:block overflow-hidden border-white/10 bg-black/20">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-white/10">
                  <TableHead className="w-[300px]">Coleção</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Visualizações</TableHead>
                  <TableHead className="text-right">No Carrinho</TableHead>
                  <TableHead className="text-right">Vendas</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(fotografo.colecoes || []).length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Nenhuma coleção encontrada. Crie a sua primeira!
                    </TableCell>
                  </TableRow>
                ) : (
                  fotografo.colecoes.map((col) => (
                    <TableRow
                      key={col.id}
                      className="border-white/10 hover:bg-white/5"
                    >
                      <TableCell className="font-medium min-w-[200px]">
                        <div className="flex flex-col">
                          <span className="text-base text-white">
                            {col.nome}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(col.createdAt)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            col.status === "PUBLICADA" ? "default" : "secondary"
                          }
                          className={
                            col.status === "PUBLICADA"
                              ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                              : ""
                          }
                        >
                          {col.status === "PUBLICADA" ? "Ativo" : "Rascunho"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{col.views}</TableCell>
                      <TableCell className="text-right">
                        {col.carrinhoCount}
                      </TableCell>
                      <TableCell className="text-right font-bold text-green-400">
                        {col.vendas}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-white"
                          >
                            <Link
                              href={`/dashboard/fotografo/colecoes/${col.id}/editar`}
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          {col.status === "PUBLICADA" && (
                            <Button
                              asChild
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-white"
                            >
                              <Link
                                href={`/colecoes/${col.slug}`}
                                target="_blank"
                                title="Ver Página"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Link>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Financials */}
      <div className="mt-4">
        <FinancialSummary />
      </div>
    </div>
  );
}

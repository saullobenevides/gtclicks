"use client";

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
import AnalyticsOverview from "./AnalyticsOverview";
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

function DashboardInner() {
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
            setFotografo(payload.data);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!fotografo) {
    return (
      <FotografoOnboarding
        onSuccess={(data) => {
          setFotografo(data);
          router.push("/dashboard/fotografo/colecoes");
        }}
      />
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
    cartAdds: (fotografo.colecoes || []).reduce(
      (acc, col) => acc + (col.carrinhoCount || 0),
      0
    ), // Cart count is still per collection for now
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
    <div className="flex flex-col gap-8">
      {/* Header & Main Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Visão Geral</h1>
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
          <h2 className="text-xl font-bold">Coleções Recentes</h2>
          <Link
            href="/dashboard/fotografo/colecoes"
            className="text-sm text-primary hover:underline"
          >
            Ver todas
          </Link>
        </div>

        <Card className="overflow-hidden border-white/10 bg-black/20">
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

export default function DashboardContent() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return <DashboardInner />;
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

interface AuditReport {
  checkedOrders: number;
  discrepancies: Array<{
    severity: string;
    type: string;
    message: string;
    orderId?: string;
    action?: string;
  }>;
}

export default function FinanceiroAdminPage() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AuditReport | null>(null);

  const runAudit = async () => {
    setLoading(true);
    setReport(null);
    try {
      const res = await fetch("/api/admin/audit", { method: "POST" });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Falha na auditoria");

      setReport(data);
      if (data.discrepancies?.length === 0) {
        toast.success("Auditoria completa: Nenhuma discrepância encontrada!");
      } else {
        toast.warning(
          `Auditoria completa: ${data.discrepancies.length} problemas encontrados.`
        );
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro na auditoria");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Auditoria Financeira
        </h1>
        <p className="text-muted-foreground">
          Ferramenta de reconciliação e integridade de dados.
        </p>
      </div>

      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            Executar Verificação
          </CardTitle>
          <CardDescription>
            Este processo analisa os últimos 50 pedidos, verifica status no
            Asaas/pagamentos, recálcula totais e valida contadores de vendas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={runAudit}
            disabled={loading}
            size="lg"
            className="w-full md:w-auto"
          >
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Auditando Sistema...
              </>
            ) : (
              "Iniciar Auditoria Completa"
            )}
          </Button>
        </CardContent>
      </Card>

      {report && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Pedidos Verificados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{report.checkedOrders}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
              </CardHeader>
              <CardContent>
                {report.discrepancies.length === 0 ? (
                  <div className="flex items-center text-green-500 font-bold">
                    <CheckCircle className="mr-2 h-5 w-5" />
                    INTEGRAL
                  </div>
                ) : (
                  <div className="flex items-center text-amber-500 font-bold">
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    ALERTA
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {report.discrepancies.length > 0 && (
            <Card className="border-red-500/20 bg-red-500/5">
              <CardHeader>
                <CardTitle className="text-red-500">
                  Discrepâncias Encontradas ({report.discrepancies.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {report.discrepancies.map((issue, idx) => (
                    <div
                      key={idx}
                      className="flex items-start justify-between p-4 bg-background rounded-lg border border-red-200 dark:border-red-900/30"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              issue.severity === "CRITICAL"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {issue.severity}
                          </Badge>
                          <span className="font-semibold text-sm">
                            {issue.type}
                          </span>
                        </div>
                        <p className="text-sm text-foreground/80">
                          {issue.message}
                        </p>
                        {issue.orderId && (
                          <p className="text-xs text-muted-foreground font-mono">
                            Order ID: {issue.orderId}
                          </p>
                        )}
                      </div>
                      {issue.action === "FIX_METRICS_COLLECTION" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            toast.info("Correção automática em breve")
                          }
                        >
                          Corrigir
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

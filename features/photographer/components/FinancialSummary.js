"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Wallet, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Resumo financeiro - redireciona para a página Financeiro (Stripe).
 * Os dados reais (saldo, saques, histórico) são exibidos lá.
 */
export default function FinancialSummary() {
  const [stripeStatus, setStripeStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/fotografos/stripe-connect/status")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setStripeStatus(data))
      .catch(() => setStripeStatus(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card className="bg-black/20 border-white/10">
        <CardContent className="py-8">
          <Skeleton className="h-24 w-full bg-white/5" />
        </CardContent>
      </Card>
    );
  }

  const stripePronto =
    stripeStatus?.stripeOnboarded && stripeStatus?.chargesEnabled;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="heading-display font-display font-black text-xl md:text-2xl text-white tracking-tight">
          Financeiro
        </h2>
        <p className="text-sm text-muted-foreground">
          {stripePronto
            ? "Gerencie saldo, saques e histórico de transações"
            : "Configure sua conta para receber pagamentos das vendas"}
        </p>
      </div>

      <Card className="bg-black/20 border-white/10 hover:bg-black/30 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium text-white flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" />
            {stripePronto ? "Painel Stripe" : "Configurar conta"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {stripePronto
              ? "Acesse a página Financeiro para ver saldo, saques e histórico em tempo real."
              : "Assim que sua conta estiver disponível após a verificação do Stripe, os dados reais serão exibidos."}
          </p>
          <Button asChild variant="default" size="sm">
            <Link href="/dashboard/fotografo/financeiro">
              {stripePronto ? "Ver Financeiro" : "Configurar conta"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

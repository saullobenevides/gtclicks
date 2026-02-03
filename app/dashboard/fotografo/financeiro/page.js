"use client";

import { useState, useEffect } from "react";
import { useUser } from "@stackframe/stack";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import StripeFinanceiroSection from "@/components/dashboard/StripeFinanceiroSection";
import StripeStatusSteps from "@/components/dashboard/StripeStatusSteps";
import PendingBalanceCard from "@/components/dashboard/PendingBalanceCard";

function FinanceiroSkeleton() {
  return (
    <div className="flex flex-col gap-6 md:gap-8 p-0">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40 bg-white/10" />
        <Skeleton className="h-4 w-64 bg-white/5" />
      </div>
      <Card className="bg-black/20 border-white/10">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Skeleton className="h-12 w-48 bg-white/10 mb-4" />
          <Skeleton className="h-4 w-64 bg-white/5" />
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
  const [stripeStatus, setStripeStatus] = useState(null);

  const fetchStripeStatus = async () => {
    try {
      const res = await fetch("/api/fotografos/stripe-connect/status");
      if (res.ok) {
        const data = await res.json();
        setStripeStatus(data);
      }
    } catch {
      // Silently ignore - Stripe pode não estar configurado
    }
  };

  useEffect(() => {
    if (isUserLoading) return;
    if (!user) {
      router.push("/login?redirect=/dashboard/fotografo/financeiro");
      return;
    }
    fetchStripeStatus().finally(() => setLoading(false));
  }, [user, isUserLoading, router]);

  if (loading || isUserLoading) {
    return <FinanceiroSkeleton />;
  }

  const stripePronto =
    stripeStatus?.stripeOnboarded && stripeStatus?.chargesEnabled;
  const temContaPendente =
    stripeStatus?.hasAccount && !stripeStatus?.stripeOnboarded;

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

      {stripeStatus && !stripeStatus.hasAccount && (
        <Alert variant="default" className="border-primary/30 bg-primary/5">
          <Wallet className="h-4 w-4" />
          <AlertTitle>Configurar conta para receber pagamentos</AlertTitle>
          <AlertDescription>
            Configure sua conta para receber os valores das vendas diretamente
            na sua conta bancária.{" "}
            <Link
              href="/dashboard/fotografo/stripe-connect"
              className="font-semibold text-primary underline underline-offset-2 hover:no-underline"
            >
              Configurar agora →
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {temContaPendente && (
        <StripeStatusSteps status={stripeStatus} showConfigurarLink />
      )}

      {stripePronto && <StripeFinanceiroSection />}

      {!stripePronto && (
        <>
          <PendingBalanceCard />
          <Card className="bg-black/20 border-white/10">
            <CardHeader>
              <CardTitle className="text-base text-white flex items-center gap-2">
                <Wallet className="h-5 w-5 text-muted-foreground" />
                Próximos passos
              </CardTitle>
              <CardDescription>
                Assim que sua conta estiver disponível após a verificação do
                Stripe, os repasses pendentes serão processados automaticamente
                e o painel completo será exibido aqui.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Acompanhe o status acima e use o botão{" "}
                <Link
                  href="/dashboard/fotografo/stripe-connect"
                  className="font-medium text-primary underline underline-offset-2 hover:no-underline"
                >
                  Configurar conta
                </Link>{" "}
                para completar ou atualizar seus dados.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

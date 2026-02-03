"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { loadConnectAndInitialize } from "@stripe/connect-js";
import {
  ConnectComponentsProvider,
  ConnectAccountOnboarding,
} from "@stripe/react-connect-js";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import StripeStatusSteps from "@/components/dashboard/StripeStatusSteps";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

export default function StripeConnectPage() {
  const router = useRouter();
  const [stripeConnectInstance, setStripeConnectInstance] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creatingAccount, setCreatingAccount] = useState(false);

  const fetchStatus = useCallback(async () => {
    const res = await fetch("/api/fotografos/stripe-connect/status");
    if (!res.ok) throw new Error("Erro ao verificar status");
    return res.json();
  }, []);

  const ensureAccountAndInit = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const statusData = await fetchStatus();
      setStatus(statusData);

      if (statusData.stripeOnboarded && statusData.chargesEnabled) {
        router.push("/dashboard/fotografo/financeiro");
        return;
      }

      if (!statusData.hasAccount) {
        setCreatingAccount(true);
        const createRes = await fetch(
          "/api/fotografos/stripe-connect/create-account",
          { method: "POST" }
        );
        if (!createRes.ok) {
          const errData = await createRes.json();
          throw new Error(errData.error || "Erro ao criar conta");
        }
        setCreatingAccount(false);
      }

      const fetchClientSecret = async () => {
        const res = await fetch(
          "/api/fotografos/stripe-connect/account-session",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              components: { account_onboarding: { enabled: true } },
            }),
          }
        );
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Erro ao obter sessão");
        }
        const { clientSecret } = await res.json();
        return clientSecret;
      };

      const instance = loadConnectAndInitialize({
        publishableKey: publishableKey || "pk_test_placeholder",
        fetchClientSecret,
        appearance: {
          variables: {
            colorPrimary: "#ef233c",
            colorBackground: "#0a0a0a",
            colorText: "#fafafa",
            colorDanger: "#ef4444",
          },
        },
        locale: "pt-BR",
      });

      setStripeConnectInstance(instance);
    } catch (err) {
      console.error("[StripeConnect]", err);
      setError(err.message);
    } finally {
      setLoading(false);
      setCreatingAccount(false);
    }
  }, [fetchStatus, router]);

  useEffect(() => {
    if (!publishableKey) {
      setError("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY não configurada");
      setLoading(false);
      return;
    }
    ensureAccountAndInit();
  }, [ensureAccountAndInit]);

  const handleOnExit = async () => {
    const statusData = await fetchStatus();
    setStatus(statusData);
    if (statusData.stripeOnboarded && statusData.chargesEnabled) {
      router.push("/dashboard/fotografo/financeiro");
    }
  };

  if (!publishableKey) {
    return (
      <div className="container-wide px-4 py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Stripe não está configurado. Adicione
            NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY no .env
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading || creatingAccount) {
    return (
      <div className="container-wide px-4 py-12 flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">
          {creatingAccount ? "Criando conta..." : "Carregando..."}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-wide px-4 py-12 max-w-xl mx-auto">
        <Card className="border-status-error/30 bg-status-error/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-status-error">
              <AlertCircle className="h-5 w-5" />
              Erro
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Button variant="outline" onClick={ensureAccountAndInit}>
              Tentar novamente
            </Button>
            <Button asChild variant="secondary">
              <Link href="/dashboard/fotografo/financeiro">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Financeiro
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container-wide px-4 py-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href="/dashboard/fotografo/financeiro">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Financeiro
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-white">
          Configurar conta para receber pagamentos
        </h1>
        <p className="text-muted-foreground mt-1">
          Preencha os dados abaixo para receber os valores das suas vendas
          diretamente na sua conta bancária. Tudo fica na plataforma.
        </p>
      </div>

      {status && (
        <div className="mb-6">
          <StripeStatusSteps status={status} />
        </div>
      )}

      <Card className="border-border-subtle bg-surface-card">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-status-success" />
            Dados da conta
          </CardTitle>
          <CardDescription>
            Informe seus dados pessoais e conta bancária para receber os
            repasses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stripeConnectInstance && (
            <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
              <ConnectAccountOnboarding
                onExit={handleOnExit}
                onLoadError={({ error }) => {
                  console.error("[Connect Onboarding Load Error]", error);
                  setError(error?.message || "Erro ao carregar formulário");
                }}
              />
            </ConnectComponentsProvider>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

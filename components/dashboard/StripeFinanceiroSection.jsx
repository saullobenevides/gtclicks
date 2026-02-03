"use client";

import { useState, useEffect, useCallback } from "react";
import { loadConnectAndInitialize } from "@stripe/connect-js";
import {
  ConnectComponentsProvider,
  ConnectBalances,
  ConnectPayouts,
  ConnectAccountManagement,
  ConnectPayoutsList,
  ConnectNotificationBanner,
} from "@stripe/react-connect-js";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Wallet, CreditCard, Settings, List } from "lucide-react";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

/** Componentes habilitados para o painel financeiro Stripe (API usa snake_case) */
const FINANCEIRO_COMPONENTS = {
  balances: {
    enabled: true,
    features: {
      instant_payouts: true,
      standard_payouts: true,
      edit_payout_schedule: true,
      external_account_collection: true,
    },
  },
  payouts: {
    enabled: true,
    features: {
      instant_payouts: true,
      standard_payouts: true,
      edit_payout_schedule: true,
      external_account_collection: true,
    },
  },
  payouts_list: { enabled: true },
  account_management: { enabled: true },
  notification_banner: { enabled: true },
};

export default function StripeFinanceiroSection() {
  const [stripeConnectInstance, setStripeConnectInstance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Processa repasses pendentes ao carregar (fotógrafo acabou de configurar Stripe)
  useEffect(() => {
    fetch("/api/fotografos/stripe-connect/process-pending-transfers", {
      method: "POST",
    }).catch(() => {});
  }, []);

  const fetchClientSecret = useCallback(async () => {
    const res = await fetch("/api/fotografos/stripe-connect/account-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ components: FINANCEIRO_COMPONENTS }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Erro ao obter sessão Stripe");
    }
    const { clientSecret } = await res.json();
    return clientSecret;
  }, []);

  useEffect(() => {
    if (!publishableKey) {
      setError("Stripe não configurado");
      setLoading(false);
      return;
    }

    let mounted = true;

    (async () => {
      try {
        const instance = loadConnectAndInitialize({
          publishableKey,
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

        if (mounted) {
          setStripeConnectInstance(instance);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [fetchClientSecret]);

  if (loading) {
    return (
      <Card className="bg-black/20 border-white/10">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Carregando painel Stripe...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-black/20 border-white/10 border-status-error/30">
        <CardHeader>
          <CardTitle className="text-status-error">
            Erro ao carregar Stripe
          </CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!stripeConnectInstance) return null;

  return (
    <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
      <Card className="bg-black/20 border-white/10 overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Wallet className="h-5 w-5 text-primary" />
            Conta Stripe
          </CardTitle>
          <CardDescription>
            Saldo, saques, conta bancária e dados da conta — tudo gerenciado
            pelo Stripe.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <ConnectNotificationBanner
              onLoadError={({ error }) =>
                console.error("[ConnectNotificationBanner]", error)
              }
            />
          </div>
          <Tabs defaultValue="balances" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-4">
              <TabsTrigger value="balances" className="flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Saldo
              </TabsTrigger>
              <TabsTrigger value="payouts" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Saques
              </TabsTrigger>
              <TabsTrigger
                value="payouts-list"
                className="flex items-center gap-2"
              >
                <List className="h-4 w-4" />
                Histórico
              </TabsTrigger>
              <TabsTrigger value="account" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Conta
              </TabsTrigger>
            </TabsList>
            <TabsContent value="balances" className="mt-0">
              <div className="min-h-[200px] rounded-lg border border-white/10 overflow-hidden">
                <ConnectBalances
                  onLoadError={({ error }) => {
                    console.error("[ConnectBalances]", error);
                  }}
                />
              </div>
            </TabsContent>
            <TabsContent value="payouts" className="mt-0">
              <div className="min-h-[200px] rounded-lg border border-white/10 overflow-hidden">
                <ConnectPayouts
                  onLoadError={({ error }) => {
                    console.error("[ConnectPayouts]", error);
                  }}
                />
              </div>
            </TabsContent>
            <TabsContent value="payouts-list" className="mt-0">
              <div className="min-h-[200px] rounded-lg border border-white/10 overflow-hidden">
                <ConnectPayoutsList
                  onLoadError={({ error }) => {
                    console.error("[ConnectPayoutsList]", error);
                  }}
                />
              </div>
            </TabsContent>
            <TabsContent value="account" className="mt-0">
              <div className="min-h-[200px] rounded-lg border border-white/10 overflow-hidden">
                <ConnectAccountManagement
                  onLoadError={({ error }) => {
                    console.error("[ConnectAccountManagement]", error);
                  }}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </ConnectComponentsProvider>
  );
}

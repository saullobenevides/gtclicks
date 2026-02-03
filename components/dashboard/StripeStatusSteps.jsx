"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const ETAPAS = [
  {
    key: "hasAccount",
    label: "Conta Stripe criada",
    desc: "Sua conta foi criada na plataforma",
  },
  {
    key: "detailsSubmitted",
    label: "Dados enviados",
    desc: "Documentos e informações pessoais foram enviados",
  },
  {
    key: "chargesEnabled",
    label: "Pagamentos habilitados",
    desc: "Sua conta pode receber pagamentos das vendas",
  },
  {
    key: "payoutsEnabled",
    label: "Saques habilitados",
    desc: "Sua conta pode receber saques na conta bancária",
  },
];

function getEtapaStatus(status, key) {
  if (!status) return "pending";
  if (key === "hasAccount") return status.hasAccount ? "done" : "pending";
  if (key === "detailsSubmitted") {
    if (!status.hasAccount) return "pending";
    return status.detailsSubmitted ? "done" : "pending";
  }
  if (key === "chargesEnabled") {
    if (!status.detailsSubmitted) return "pending";
    return status.chargesEnabled ? "done" : "current";
  }
  if (key === "payoutsEnabled") {
    if (!status.chargesEnabled) return "pending";
    return status.payoutsEnabled ? "done" : "current";
  }
  return "pending";
}

export default function StripeStatusSteps({
  status,
  showConfigurarLink = false,
}) {
  if (!status?.hasAccount) return null;

  const allDone =
    status.stripeOnboarded && status.chargesEnabled && status.payoutsEnabled;

  return (
    <Card className="bg-black/20 border-white/10">
      <CardHeader>
        <CardTitle className="text-base text-white flex items-center gap-2">
          {allDone ? (
            <>
              <CheckCircle2 className="h-5 w-5 text-status-success" />
              Conta Stripe configurada
            </>
          ) : (
            <>
              <Loader2 className="h-5 w-5 text-primary animate-spin" />
              Status da sua conta
            </>
          )}
        </CardTitle>
        <CardDescription>
          {allDone
            ? "Tudo pronto! Você já pode receber pagamentos e saques."
            : "Acompanhe em qual etapa está a verificação da sua conta."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {ETAPAS.map((etapa, i) => {
            const state = getEtapaStatus(status, etapa.key);
            return (
              <div
                key={etapa.key}
                className="flex items-start gap-3 rounded-lg border border-white/10 bg-black/20 p-3"
              >
                <div className="mt-0.5">
                  {state === "done" && (
                    <CheckCircle2 className="h-5 w-5 text-status-success shrink-0" />
                  )}
                  {state === "current" && (
                    <Loader2 className="h-5 w-5 text-primary animate-spin shrink-0" />
                  )}
                  {state === "pending" && (
                    <Circle className="h-5 w-5 text-muted-foreground/50 shrink-0" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-medium text-sm ${
                      state === "done"
                        ? "text-status-success"
                        : state === "current"
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {etapa.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {etapa.desc}
                  </p>
                  {state === "current" && (
                    <p className="text-xs text-amber-500 mt-1">
                      Aguardando verificação do Stripe. Pode levar alguns
                      minutos ou dias úteis. Verifique seu e-mail.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {showConfigurarLink && !allDone && (
          <Button
            asChild
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
          >
            <Link href="/dashboard/fotografo/stripe-connect">
              {status.detailsSubmitted
                ? "Completar ou atualizar dados"
                : "Configurar conta agora"}
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

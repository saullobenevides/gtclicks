"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { XCircle } from "lucide-react";

const MAX_MESSAGE_LENGTH = 200;

function safeMessage(str) {
  if (typeof str !== "string") return "";
  const trimmed = str.trim().slice(0, MAX_MESSAGE_LENGTH);
  return trimmed.replace(/[<>"']/g, "");
}

function safeStatus(str) {
  if (typeof str !== "string") return "";
  return str
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 50);
}

export default function PaymentFailurePage() {
  const searchParams = useSearchParams();
  const status = safeStatus(searchParams?.get("status") ?? "");
  const rawMessage = searchParams?.get("message") ?? "";
  const message = safeMessage(rawMessage);
  const showStatus = status.length > 0;
  const showMessage = message.length > 0;

  return (
    <div className="container-wide px-4">
      <section className="py-12 sm:py-24">
        <Card className="glass-panel border-border/50 mx-auto max-w-2xl overflow-hidden text-center">
          <CardContent className="p-6 sm:p-12">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-status-error/20 text-status-error">
              <XCircle className="h-10 w-10" />
            </div>
            <h1 className="heading-display font-display mb-3 text-2xl font-black text-foreground sm:text-3xl">
              Pagamento não aprovado
            </h1>
            <p className="text-lg text-muted-foreground">
              Infelizmente, não foi possível processar seu pagamento.
            </p>
            {showStatus && (
              <p className="mt-2 text-sm text-muted-foreground" role="status">
                Status: {status}
              </p>
            )}
            {showMessage && (
              <p className="mt-2 text-sm text-muted-foreground" role="status">
                {message}
              </p>
            )}

            <div className="bg-surface-subtle/50 border-border-subtle mt-8 rounded-radius-lg border p-6 text-left">
              <p className="text-muted-foreground text-sm">
                Isso pode ter acontecido por diversos motivos, como dados
                incorretos, saldo insuficiente ou problemas com seu método de
                pagamento.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                asChild
                className="min-h-[48px] w-full sm:w-auto"
                size="lg"
              >
                <Link href="/carrinho">Voltar ao Carrinho</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="min-h-[48px] w-full sm:w-auto"
                size="lg"
              >
                <Link href="/busca">Continuar Navegando</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

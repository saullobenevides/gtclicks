"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

export default function PaymentPendingPage() {
  const searchParams = useSearchParams();
  const pedidoId = searchParams.get("pedidoId");

  return (
    <div className="container-wide px-4">
      <section className="py-12 sm:py-24">
        <Card className="glass-panel border-border/50 mx-auto max-w-2xl overflow-hidden text-center">
          <CardContent className="p-6 sm:p-12">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-status-warning/20 text-status-warning">
              <Clock className="h-10 w-10" />
            </div>
            <h1 className="heading-display font-display mb-3 text-2xl font-black text-foreground sm:text-3xl">
              Pagamento pendente
            </h1>
            <p className="text-lg text-muted-foreground">
              Seu pagamento está sendo processado.
            </p>

            <div className="bg-surface-subtle/50 border-border-subtle mt-8 rounded-radius-lg border p-6 text-left">
              {pedidoId && (
                <p className="text-foreground text-sm font-medium">
                  Pedido: #{pedidoId.slice(0, 8)}
                </p>
              )}
              <p className="text-muted-foreground mt-2 text-sm">
                Isso é comum para pagamentos via PIX ou boleto. Você receberá
                uma confirmação por e-mail assim que o pagamento for aprovado.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
              <Button
                asChild
                className="min-h-[48px] w-full sm:w-auto"
                size="lg"
              >
                <Link href="/pedidos">Ver Meus Pedidos</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="min-h-[48px] w-full sm:w-auto"
                size="lg"
              >
                <Link href="/meus-downloads">Meus Downloads</Link>
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

"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Download,
  ArrowRight,
  Clock,
  AlertCircle,
} from "lucide-react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { toast } from "sonner";
import { PageBreadcrumbs } from "@/components/shared/layout";
import BackButton from "@/components/shared/BackButton";
import CheckoutSteps from "@/components/checkout/CheckoutSteps";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const status = searchParams.get("status");

  const isApproved = status === "approved" || status === "PAGO" || status === "paid";
  const isPending =
    status === "in_process" || status === "pending" || status === "PENDENTE";

  const [showConfetti, setShowConfetti] = useState(isApproved);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const { width, height } = useWindowSize();
  const [loadingPayment, setLoadingPayment] = useState(
    (isPending || isApproved) && !!orderId
  );
  const isApprovedDisplay = isApproved || paymentConfirmed;
  const isPendingDisplay = isPending && !paymentConfirmed;

  const pollOrderStatus = useCallback(async () => {
    if (!orderId) return;
    try {
      const res = await fetch(`/api/pedidos/${orderId}`);
      if (!res.ok) return;
      const json = (await res.json()) as { data?: { status?: string } };
      if (json.data?.status === "PAGO") {
        setPaymentConfirmed(true);
        setShowConfetti(true);
        toast.success("Pagamento confirmado! Você já pode baixar suas fotos.");
      }
    } catch {
      // ignore
    } finally {
      setLoadingPayment(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (isApprovedDisplay) {
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isApprovedDisplay]);

  // Poll order status when approved (Asaas) or pending (webhook delay)
  useEffect(() => {
    if (!orderId || paymentConfirmed) return;
    if (!isApprovedDisplay && !isPendingDisplay) return;

    pollOrderStatus();
    const interval = setInterval(pollOrderStatus, 4000);
    return () => clearInterval(interval);
  }, [orderId, paymentConfirmed, isApprovedDisplay, isPendingDisplay, pollOrderStatus]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center container-wide px-4 text-center py-12 sm:py-20 relative overflow-hidden">
      <div className="absolute top-20 left-4 right-4 z-10 container-wide flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <PageBreadcrumbs
            items={[
              { label: "Carrinho", href: "/carrinho", isLast: false },
              { label: "Pagamento", href: "/checkout", isLast: false },
              { label: "Confirmação", isLast: true },
            ]}
            className="shrink-0 min-w-0 mb-0"
          />
          <BackButton href="/checkout" label="Voltar ao pagamento" />
        </div>
        <CheckoutSteps className="w-full" />
      </div>
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          numberOfPieces={200}
          recycle={false}
        />
      )}

      <div className="z-10 animate-fade-in-up w-full max-w-2xl mx-auto">
        <div
          className={`mb-6 flex h-24 w-24 items-center justify-center rounded-full mx-auto ${
            isApprovedDisplay
              ? "bg-green-500/10 ring-1 ring-green-500/20"
              : isPendingDisplay
              ? "bg-yellow-500/10 ring-1 ring-yellow-500/20"
              : "bg-red-500/10 ring-1 ring-red-500/20"
          }`}
        >
          {isApprovedDisplay && (
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          )}
          {isPendingDisplay && <Clock className="h-12 w-12 text-yellow-500" />}
          {!isApprovedDisplay && !isPendingDisplay && (
            <AlertCircle className="h-12 w-12 text-red-500" />
          )}
        </div>

        <h1 className="text-3xl md:text-5xl font-black text-white mb-4">
          {isApprovedDisplay
            ? "Pagamento Confirmado!"
            : isPendingDisplay
            ? "Pedido Recebido!"
            : "Atenção no Pedido"}
        </h1>

        <p className="text-muted-foreground text-lg max-w-lg mx-auto mb-8">
          {isApprovedDisplay
            ? "Sua compra foi processada com sucesso. Você já pode baixar suas fotos em alta resolução."
            : isPendingDisplay
            ? "Aguardando confirmação do pagamento. Verifique em Meus Pedidos."
            : "Houve um problema com a confirmação. Verifique seus pedidos ou tente novamente."}
        </p>

        {(isApprovedDisplay || isPendingDisplay) && loadingPayment && (
          <div className="mb-8 flex flex-col items-center gap-4 py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-muted-foreground text-sm">
              Verificando status do pagamento...
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {isApprovedDisplay && (
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href={orderId ? `/pedidos/${orderId}` : "/meus-downloads"}>
                <Download className="mr-2 h-5 w-5" />
                Baixar Fotos
              </Link>
            </Button>
          )}

          {isPendingDisplay && (
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/pedidos">
                <Clock className="mr-2 h-5 w-5" />
                Acompanhar Pedido
              </Link>
            </Button>
          )}

          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-white/10 text-white hover:bg-white/5 w-full sm:w-auto"
          >
            <Link href="/busca">
              Continuar Comprando
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>

        {orderId && (
          <p className="mt-8 text-xs text-muted-foreground">
            ID do Pedido:{" "}
            <span className="font-mono text-white/50">{orderId}</span>
          </p>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
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

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const status = searchParams.get("status"); // 'approved', 'in_process', 'pending', 'rejected'

  // Determine if successful based on Mercado Pago status
  const isApproved = status === "approved" || status === "PAGO";
  const isPending =
    status === "in_process" || status === "pending" || status === "PENDENTE";

  const [showConfetti, setShowConfetti] = useState(isApproved);
  const { width, height } = useWindowSize();

  useEffect(() => {
    if (isApproved) {
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isApproved]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center container-wide text-center py-20 relative overflow-hidden">
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          numberOfPieces={200}
          recycle={false}
        />
      )}

      <div className="z-10 animate-fade-in-up">
        {/* Status Icon */}
        <div
          className={`mb-6 flex h-24 w-24 items-center justify-center rounded-full mx-auto ${
            isApproved
              ? "bg-green-500/10 ring-1 ring-green-500/20"
              : isPending
                ? "bg-yellow-500/10 ring-1 ring-yellow-500/20"
                : "bg-red-500/10 ring-1 ring-red-500/20"
          }`}
        >
          {isApproved && <CheckCircle2 className="h-12 w-12 text-green-500" />}
          {isPending && <Clock className="h-12 w-12 text-yellow-500" />}
          {!isApproved && !isPending && (
            <AlertCircle className="h-12 w-12 text-red-500" />
          )}
        </div>

        {/* Headline */}
        <h1 className="text-3xl md:text-5xl font-black text-white mb-4">
          {isApproved
            ? "Pagamento Confirmado!"
            : isPending
              ? "Pedido Recebido!"
              : "Atenção no Pedido"}
        </h1>

        {/* Description */}
        <p className="text-muted-foreground text-lg max-w-lg mx-auto mb-8">
          {isApproved
            ? "Sua compra foi processada com sucesso. Você já pode baixar suas fotos em alta resolução."
            : isPending
              ? "Estamos aguardando a confirmação do pagamento. Assim que aprovado, enviaremos um e-mail com o link para download."
              : "Houve um problema com a confirmação. Verifique seus pedidos ou tente novamente."}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {isApproved && (
            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto"
            >
              <Link href={orderId ? `/meus-pedidos` : "/meus-downloads"}>
                <Download className="mr-2 h-5 w-5" />
                Baixar Fotos
              </Link>
            </Button>
          )}

          {isPending && (
            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto"
            >
              <Link href="/meus-pedidos">
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

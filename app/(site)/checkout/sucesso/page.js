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
  Copy,
  QrCode,
  FileText,
} from "lucide-react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { getPaymentDetails } from "@/actions/checkout";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { PageBreadcrumbs } from "@/components/shared/layout";
import BackButton from "@/components/shared/BackButton";
import CheckoutSteps from "@/components/checkout/CheckoutSteps";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const status = searchParams.get("status"); // 'approved', 'in_process', 'pending', 'rejected'

  // Determine if successful based on Mercado Pago status
  const isApproved = status === "approved" || status === "PAGO";
  const isPending =
    status === "in_process" || status === "pending" || status === "PENDENTE";

  const [showConfetti, setShowConfetti] = useState(isApproved);
  const { width, height } = useWindowSize(); // Hooks should be at top level
  const [pixData, setPixData] = useState(null);
  const [boletoData, setBoletoData] = useState(null);
  const [loadingPayment, setLoadingPayment] = useState(isPending && !!orderId);

  useEffect(() => {
    if (isApproved) {
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isApproved]);

  // Fetch Pix/Boleto Data if pending
  useEffect(() => {
    if (isPending && orderId) {
      getPaymentDetails(orderId)
        .then((res) => {
          if (res.success) {
            if (res.pix) setPixData(res.pix);
            if (res.boleto) setBoletoData(res.boleto);
          }
        })
        .catch((err) => console.error("Error loading payment details:", err))
        .finally(() => setLoadingPayment(false));
    }
  }, [isPending, orderId]);

  const copyToClipboard = () => {
    if (pixData?.qrCode) {
      navigator.clipboard.writeText(pixData.qrCode);
      toast.success("Código Pix copiado!");
    }
  };

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
            ? "Estamos aguardando a confirmação do pagamento. Finalize o Pix abaixo para liberar seus downloads."
            : "Houve um problema com a confirmação. Verifique seus pedidos ou tente novamente."}
        </p>

        {/* PIX DISPLAY SECTION */}
        {isPending && pixData && (
          <Card className="glass-panel border-yellow-500/20 bg-yellow-500/5 mb-8 overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col items-center gap-6">
                <div className="flex items-center gap-2 text-yellow-400 font-bold text-lg">
                  <QrCode className="w-6 h-6" />
                  Escaneie para pagar
                </div>

                {/* QR Code Image */}
                <div className="bg-white p-4 rounded-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`data:image/png;base64,${pixData.qrCodeBase64}`}
                    alt="QR Code Pix"
                    className="w-48 h-48 sm:w-64 sm:h-64 object-contain"
                  />
                </div>

                <div className="w-full max-w-md space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Ou copie e cole o código abaixo:
                  </p>
                  <div className="flex gap-2">
                    <code className="flex-1 bg-black/40 border border-white/10 rounded-lg p-3 text-xs sm:text-sm text-white/70 overflow-hidden text-nowrap text-ellipsis font-mono">
                      {pixData.qrCode}
                    </code>
                    <Button
                      onClick={copyToClipboard}
                      variant="secondary"
                      size="icon"
                      className="shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="text-xs text-yellow-500/70">
                  ⚠️ O pagamento pode levar alguns segundos para ser confirmado
                  automaticamente.
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* BOLETO DISPLAY SECTION */}
        {isPending && boletoData && (
          <Card className="glass-panel border-white/10 bg-white/5 mb-8">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col items-center gap-6">
                <div className="flex items-center gap-2 text-white font-bold text-lg">
                  <FileText className="w-6 h-6" />
                  Boleto Bancário Gerado
                </div>

                <p className="text-muted-foreground max-w-md">
                  Seu boleto foi gerado com sucesso. Clique abaixo para
                  visualizar e imprimir, ou copie o código de barras.
                </p>

                <div className="flex flex-col gap-3 w-full max-w-sm">
                  {boletoData.ticketUrl && (
                    <Button
                      asChild
                      className="w-full bg-white text-black hover:bg-white/90"
                    >
                      <a
                        href={boletoData.ticketUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Baixar / Visualizar Boleto
                      </a>
                    </Button>
                  )}

                  {boletoData.barcode && (
                    <div className="flex gap-2">
                      <code className="flex-1 bg-black/40 border border-white/10 rounded-lg p-3 text-xs text-white/70 overflow-hidden text-nowrap text-ellipsis font-mono flex items-center">
                        {boletoData.barcode}
                      </code>
                      <Button
                        onClick={() => {
                          navigator.clipboard.writeText(boletoData.barcode);
                          toast.success("Código de barras copiado!");
                        }}
                        variant="secondary"
                        size="icon"
                        className="shrink-0"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="text-xs text-white/50 bg-white/5 p-3 rounded-md border border-white/5">
                  ⏳ A compensação de boletos pode levar de 1 a 3 dias úteis.
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {isApproved && (
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href={orderId ? `/pedidos/${orderId}` : "/meus-downloads"}>
                <Download className="mr-2 h-5 w-5" />
                Baixar Fotos
              </Link>
            </Button>
          )}

          {isPending && (
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

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  QrCode,
  Copy,
  FileText,
  Download,
  Loader2,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";

/**
 * Exibe Pix, boleto ou botão de finalizar conforme o tipo de pagamento.
 * Usado na página individual do pedido e na lista.
 */
export default function PendingPaymentDisplay({
  orderId,
  paymentId,
  user,
  variant = "full", // "full" | "compact"
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!!paymentId);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!paymentId || !orderId) {
      setLoading(false);
      return;
    }

    const fetchPayment = async () => {
      try {
        const res = await fetch(`/api/pedidos/${orderId}/pagamento`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Erro ao buscar pagamento");
        setData(json);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPayment();
  }, [orderId, paymentId]);

  const copyToClipboard = (text) => {
    if (text) {
      navigator.clipboard.writeText(text);
      toast.success("Copiado!");
    }
  };

  // Sem paymentId: redireciona para checkout
  if (!paymentId) {
    return (
      <Button asChild className="w-full gap-2 font-bold">
        <Link href={`/checkout?orderId=${orderId}`}>
          <CreditCard className="h-4 w-4" />
          Finalizar Pagamento
        </Link>
      </Button>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Carregando pagamento...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Button asChild variant="outline" className="w-full gap-2">
        <Link href={`/checkout?orderId=${orderId}`}>
          <CreditCard className="h-4 w-4" />
          Finalizar Pagamento
        </Link>
      </Button>
    );
  }

  // Pix
  if (data?.pix && variant === "full") {
    return (
      <Card className="overflow-hidden border-status-warning/30 bg-status-warning/5">
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 font-bold text-status-warning">
              <QrCode className="w-5 h-5" />
              Pague com Pix
            </div>
            <div className="rounded-radius-xl bg-white p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`data:image/png;base64,${data.pix.qrCodeBase64}`}
                alt="QR Code Pix"
                className="w-40 h-40 sm:w-48 sm:h-48 object-contain"
              />
            </div>
            <div className="w-full space-y-2">
              <p className="text-xs text-muted-foreground text-center">
                Ou copie o código:
              </p>
              <div className="flex gap-2">
                <code className="flex-1 overflow-hidden text-ellipsis rounded-radius-lg border border-border-subtle bg-surface-subtle p-2 font-mono text-xs text-muted-foreground">
                  {data.pix.qrCode}
                </code>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => copyToClipboard(data.pix.qrCode)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-status-warning/80">
              O pagamento é confirmado automaticamente em segundos.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Boleto
  if (data?.boleto && variant === "full") {
    return (
      <Card className="overflow-hidden border-border-subtle bg-surface-subtle">
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <FileText className="w-5 h-5" />
              Boleto Bancário
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Clique para visualizar e pagar seu boleto.
            </p>
            {data.boleto.ticketUrl && (
              <Button
                asChild
                className="w-full bg-action-strong text-black hover:bg-action-strong-hover"
              >
                <a
                  href={data.boleto.ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Ver / Pagar Boleto
                </a>
              </Button>
            )}
            {data.boleto.barcode && (
              <div className="flex gap-2 w-full">
                <code className="flex-1 overflow-hidden text-ellipsis rounded-radius-lg border border-border-subtle bg-surface-subtle p-2 font-mono text-xs text-muted-foreground">
                  {data.boleto.barcode}
                </code>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => copyToClipboard(data.boleto.barcode)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Compensação em 1 a 3 dias úteis.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Cartão ou outro método: redireciona para checkout transparente
  return (
    <div className="space-y-3">
      {variant === "full" && (
        <p className="text-sm text-muted-foreground">
          Pagamento pendente. Complete no checkout para liberar seus downloads.
        </p>
      )}
      <Button asChild className="w-full gap-2 font-bold">
        <Link href={`/checkout?orderId=${orderId}`}>
          <CreditCard className="h-4 w-4" />
          Finalizar Pagamento
        </Link>
      </Button>
    </div>
  );
}

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CreditCard, QrCode } from "lucide-react";

/**
 * Redireciona para checkout transparente (Payment Brick) ou para a página
 * do pedido quando Pix/boleto já foi gerado.
 */
export default function RetryPaymentButton({ orderId, paymentId }) {
  if (paymentId) {
    return (
      <Button asChild variant="secondary" className="w-full gap-2">
        <Link href={`/pedidos/${orderId}`}>
          <QrCode className="h-4 w-4" />
          Ver pagamento
        </Link>
      </Button>
    );
  }

  return (
    <Button asChild className="w-full gap-2 font-bold">
      <Link href={`/checkout?orderId=${orderId}`}>
        <CreditCard className="h-4 w-4" />
        Finalizar Pagamento
      </Link>
    </Button>
  );
}

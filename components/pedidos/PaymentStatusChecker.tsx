"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

type PedidoStatusDisplay = "PENDENTE" | "PAGO";

interface PaymentStatusCheckerProps {
  orderId: string;
  initialStatus: string;
}

export default function PaymentStatusChecker({
  orderId,
  initialStatus,
}: PaymentStatusCheckerProps) {
  const [status, setStatus] = useState<PedidoStatusDisplay>(
    initialStatus === "PAGO" ? "PAGO" : "PENDENTE"
  );
  const [checking, setChecking] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (status === "PENDENTE") {
      const verifyPayment = async () => {
        try {
          setChecking(true);
          const response = await fetch(
            `/api/pedidos/${orderId}/verificar-pagamento`,
            {
              method: "POST",
            }
          );

          if (response.ok) {
            const data = await response.json();
            if (data.status === "PAGO") {
              setStatus("PAGO");
              router.refresh();
            }
          }
        } catch (error) {
          console.error("Verification failed", error);
        } finally {
          setChecking(false);
        }
      };

      verifyPayment();

      const interval = setInterval(verifyPayment, 5000);
      return () => clearInterval(interval);
    }
  }, [status, orderId, router]);

  if (status === "PAGO") {
    return (
      <Badge variant="success" className="px-4 py-1.5 text-sm">
        <CheckCircle className="mr-2 h-4 w-4" />
        Pedido Pago
      </Badge>
    );
  }

  return (
    <Badge variant="warning" className="px-4 py-1.5 text-sm">
      <Clock className={`mr-2 h-4 w-4 ${checking ? "animate-pulse" : ""}`} />
      {checking ? "Verificando..." : "Aguardando Pagamento"}
    </Badge>
  );
}

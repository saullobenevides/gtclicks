"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PaymentStatusChecker({ orderId, initialStatus }) {
  const [status, setStatus] = useState(initialStatus);
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
            },
          );

          if (response.ok) {
            const data = await response.json();
            if (data.status === "PAGO") {
              setStatus("PAGO");
              router.refresh(); // Reload server data to update UI buttons (download links etc)
            }
          }
        } catch (error) {
          console.error("Verification failed", error);
        } finally {
          setChecking(false);
        }
      };

      // Initial check
      verifyPayment();

      // Poll every 5s for 30s max (classic user wait time)
      const interval = setInterval(verifyPayment, 5000);
      return () => clearInterval(interval);
    }
  }, [status, orderId, router]);

  if (status === "PAGO") {
    return (
      <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border-green-500/50 px-4 py-1.5 text-sm">
        <CheckCircle className="h-4 w-4 mr-2" />
        Pedido Pago
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 px-4 py-1.5 text-sm"
    >
      <Clock className={`h-4 w-4 mr-2 ${checking ? "animate-pulse" : ""}`} />
      {checking ? "Verificando..." : "Aguardando Pagamento"}
    </Badge>
  );
}

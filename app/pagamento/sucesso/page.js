"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const pedidoId = searchParams.get("pedidoId");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(Boolean(pedidoId));

  useEffect(() => {
    if (pedidoId) {
      const checkOrder = async () => {
        try {
          const response = await fetch(`/api/pedidos/${pedidoId}`);
          if (response.ok) {
            const data = await response.json();
            const orderData = data.data;
            setOrder(orderData);

            // If still pending, try to force verification with Mercado Pago
            if (orderData && orderData.status !== "PAGO") {
              console.log("Order pending, attempting manual verification...");
              const verifyRes = await fetch(
                `/api/pedidos/${pedidoId}/verificar-pagamento`,
                {
                  method: "POST",
                },
              );
              if (verifyRes.ok) {
                const verifyData = await verifyRes.json();
                if (verifyData.status === "PAGO") {
                  // If verified successfully, update local state immediately
                  setOrder((prev) => ({ ...prev, status: "PAGO" }));
                }
              }
            }
          }
        } catch (error) {
          console.error("Error fetching order:", error);
        } finally {
          setLoading(false);
        }
      };

      checkOrder();
      // Keep polling every 5 seconds just in case
      const timer = setInterval(checkOrder, 5000);
      return () => clearInterval(timer);
    }
  }, [pedidoId]);

  return (
    <div className="container">
      <section className="py-24">
        <div className="text-center max-w-2xl mx-auto p-12 bg-card border rounded-lg">
          <div className="w-20 h-20 mx-auto mb-8 rounded-full flex items-center justify-center text-5xl font-bold text-white bg-green-500">
            ✓
          </div>
          <h1 className="text-4xl font-bold mb-4 text-heading">
            Tudo certo! Suas fotos são suas.
          </h1>
          <p className="text-xl text-body mb-8">
            O pagamento foi confirmado e seus arquivos em alta resolução já
            estão liberados para download.
          </p>

          {loading ? (
            <p>Processando seu pedido...</p>
          ) : order && order.status === "PAGO" ? (
            <div className="bg-background p-6 rounded-md my-8 text-left">
              <p className="my-2 text-base">
                <strong>Pedido:</strong> #{pedidoId?.slice(0, 8)}
              </p>
              <p className="my-2 text-base">
                <strong>Total:</strong> R$ {Number(order.total).toFixed(2)}
              </p>
              <p className="my-2 text-base">
                <strong>Itens:</strong> {order.itens?.length || 0}{" "}
                {order.itens?.length === 1 ? "foto" : "fotos"}
              </p>
            </div>
          ) : (
            <p className="bg-primary/10 p-4 rounded-sm text-body my-8 border border-primary/20">
              Seu pedido está sendo processado. Você receberá um email de
              confirmação em breve.
            </p>
          )}

          <div className="flex flex-col gap-4 mt-8">
            <Button asChild size="lg" className="h-12 text-lg">
              <Link href="/meus-downloads">Baixar Minhas Fotos Agora</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/busca">Continuar Comprando</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import ImageWithFallback from "@/components/shared/ImageWithFallback";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Loader2, Undo2 } from "lucide-react";
import { toast } from "sonner";

interface Item {
  id: string;
  precoPago: number;
  foto: {
    id: string;
    titulo: string;
    previewUrl: string;
    width: number;
    height: number;
    tamanhoBytes: number;
  };
  licenca: { nome: string } | null;
}

interface Pedido {
  id: string;
  total: number;
  status: string;
  paymentId: string | null;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
  itens: Item[];
}

export default function AdminPedidoDetailClient({
  pedido,
}: {
  pedido: Pedido;
}) {
  const [status, setStatus] = useState(pedido.status);
  const [refundOpen, setRefundOpen] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [refunding, setRefunding] = useState(false);

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(v);

  const copyPaymentLink = () => {
    if (!pedido.paymentId) {
      toast.error("Pedido sem link de pagamento");
      return;
    }
    navigator.clipboard.writeText(pedido.paymentId);
    toast.success("ID copiado para a área de transferência");
  };

  const handleRefund = async () => {
    setRefunding(true);
    try {
      const res = await fetch(`/api/admin/pedidos/${pedido.id}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: refundReason || "Reembolso solicitado pelo administrador",
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Falha ao processar reembolso");
        return;
      }

      toast.success(
        "Reembolso solicitado. O webhook atualizará o pedido em instantes."
      );
      setRefundOpen(false);
      setRefundReason("");
      setStatus("CANCELADO");
    } catch (err) {
      toast.error("Erro ao processar reembolso");
    } finally {
      setRefunding(false);
    }
  };

  const isPaid = status === "PAGO"
  const statusBadge =
    status === "PAGO"
      ? "default"
      : status === "PENDENTE"
      ? "secondary"
      : "destructive";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Cliente</CardTitle>
          <Badge variant={statusBadge}>{status}</Badge>
        </CardHeader>
        <CardContent>
          <p className="font-medium text-white">{pedido.user.name}</p>
          <p className="text-sm text-zinc-400">{pedido.user.email}</p>
        </CardContent>
      </Card>

      {pedido.paymentId && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Pagamento</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={copyPaymentLink}
              className="gap-2"
            >
              <Copy className="h-4 w-4" />
              Copiar ID
            </Button>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-sm text-zinc-400 break-all">
              {pedido.paymentId}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Itens ({pedido.itens.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pedido.itens.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-4 rounded-lg bg-white/5 border border-white/10"
              >
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
                  <ImageWithFallback
                    src={item.foto.previewUrl}
                    alt={item.foto.titulo}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white truncate">
                    {item.foto.titulo}
                  </h4>
                  <p className="text-sm text-zinc-400">
                    {item.foto.width} x {item.foto.height}px
                  </p>
                  {item.licenca && (
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {item.licenca.nome}
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  <span className="font-semibold text-white">
                    {formatCurrency(item.precoPago)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center border-t border-white/10 pt-4">
          <span className="font-bold text-white text-lg">
            Total: {formatCurrency(pedido.total)}
          </span>
          {isPaid && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setRefundOpen(true)}
              className="gap-2"
            >
              <Undo2 className="h-4 w-4" />
              Reembolsar
            </Button>
          )}
        </CardFooter>
      </Card>

      <Dialog open={refundOpen} onOpenChange={setRefundOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar reembolso</DialogTitle>
            <DialogDescription>
              O valor de {formatCurrency(pedido.total)} será reembolsado ao
              cliente (gateway de pagamento). O pedido será marcado como
              cancelado e o saldo dos fotógrafos será revertido. Esta ação não
              pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="refund-reason">Motivo (opcional)</Label>
            <Input
              id="refund-reason"
              placeholder="Ex: Solicitação do cliente"
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRefundOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleRefund}
              disabled={refunding}
            >
              {refunding ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                "Confirmar reembolso"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

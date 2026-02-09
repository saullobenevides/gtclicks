import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Calendar, Download, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ImageWithFallback from "@/components/shared/ImageWithFallback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import PendingPaymentDisplay from "@/components/pedidos/PendingPaymentDisplay";
import PaymentStatusChecker from "@/components/pedidos/PaymentStatusChecker";
import type { User } from "@prisma/client";

interface PedidoDetailContentProps {
  orderId: string;
  userId: string;
  user: User;
}

export default async function PedidoDetailContent({
  orderId,
  userId,
  user,
}: PedidoDetailContentProps) {
  const pedido = await prisma.pedido.findUnique({
    where: {
      id: orderId,
      userId,
    },
    include: {
      itens: {
        include: {
          foto: {
            select: {
              id: true,
              titulo: true,
              previewUrl: true,
              width: true,
              height: true,
              tamanhoBytes: true,
            },
          },
          licenca: { select: { nome: true } },
        },
      },
    },
  });

  if (!pedido) notFound();

  const isPaid = pedido.status === "PAGO";

  return (
    <div className="flex flex-col gap-8 md:flex-row md:gap-10 md:items-start">
      <div className="min-w-0 flex-1 space-y-6">
        <Card className="overflow-hidden">
          <CardHeader className="bg-surface-subtle px-4 pb-4 pt-6 md:px-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl text-white flex items-center gap-3">
                  Pedido #{pedido.id.slice(-8).toUpperCase()}
                </CardTitle>
                <p className="text-muted-foreground text-sm mt-1 flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(pedido.createdAt).toLocaleDateString("pt-BR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <PaymentStatusChecker
                orderId={pedido.id}
                initialStatus={pedido.status}
              />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-6 pt-6 md:px-6">
            {!isPaid && (
              <div
                id="pagamento-pendente"
                className="mb-6 space-y-4 scroll-mt-24"
              >
                <Alert variant="warning">
                  <AlertCircle className="h-5 w-5" />
                  <div>
                    <AlertTitle>Pagamento Pendente</AlertTitle>
                    <AlertDescription>
                      Finalize o pagamento abaixo para liberar o download das
                      suas fotos.
                    </AlertDescription>
                  </div>
                </Alert>
                <PendingPaymentDisplay
                  orderId={pedido.id}
                  paymentId={pedido.paymentId}
                  user={user}
                  variant="full"
                />
              </div>
            )}

            <div className="space-y-6">
              {pedido.itens.map((item) => (
                <div key={item.id} className="flex items-start gap-4">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-radius-lg border border-border-subtle bg-surface-subtle md:h-32 md:w-32">
                    <ImageWithFallback
                      src={item.foto.previewUrl}
                      alt={item.foto.titulo}
                      fill
                      className={`object-cover ${
                        !isPaid ? "opacity-60 blur-[1px]" : ""
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-white truncate pr-4">
                        {item.foto.titulo}
                      </h3>
                      <span className="font-mono text-white/90">
                        {formatCurrency(Number(item.precoPago))}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.foto.width} x {item.foto.height}px •{" "}
                      {(item.foto.tamanhoBytes / 1024 / 1024).toFixed(2)} MB
                    </p>
                    {item.licenca && (
                      <Badge
                        variant="secondary"
                        className="mt-2 text-[10px] h-5"
                      >
                        {item.licenca.nome}
                      </Badge>
                    )}

                    {isPaid && (
                      <div className="mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-2 border-border-subtle bg-surface-subtle text-foreground hover:bg-surface-elevated"
                          asChild
                        >
                          <Link
                            href={`/api/download/${item.downloadToken}`}
                            target="_blank"
                          >
                            <Download className="h-3.5 w-3.5" />
                            Baixar Foto Original
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <aside className="w-full shrink-0 md:w-80">
        <Card className="sticky top-24">
          <CardHeader className="px-4 md:px-6">
            <CardTitle className="text-lg text-white">
              Resumo do Pedido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-4 md:px-6">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatCurrency(Number(pedido.total))}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Taxas</span>
              <span>R$ 0,00</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-bold text-white text-lg">
              <span>Total</span>
              <span>{formatCurrency(Number(pedido.total))}</span>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 border-t border-border-subtle px-4 pb-6 pt-6 md:px-6">
            {pedido.status === "PENDENTE" && (
              <Button variant="default" className="w-full" asChild>
                <Link href="#pagamento-pendente">
                  Ver detalhes do pagamento
                </Link>
              </Button>
            )}
            <Button variant="outline" className="w-full" asChild>
              <Link href="/contato">Precisa de ajuda?</Link>
            </Button>
          </CardFooter>
        </Card>
      </aside>
    </div>
  );
}

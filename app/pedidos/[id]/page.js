import { getAuthenticatedUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import {
  Calendar,
  ArrowLeft,
  Download,
  AlertCircle,
  Clock,
  CheckCircle,
} from "lucide-react";
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
import RetryPaymentButton from "@/components/pedidos/RetryPaymentButton";
import PaymentStatusChecker from "@/components/pedidos/PaymentStatusChecker";

export async function generateMetadata(props) {
  const params = await props.params;
  return {
    title: `Pedido #${params.id.slice(-8).toUpperCase()}`,
  };
}

export default async function PedidoDetalhesPage(props) {
  const params = await props.params;
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect(`/login?callbackUrl=/pedidos/${params.id}`);
  }

  const pedido = await prisma.pedido.findUnique({
    where: {
      id: params.id,
      userId: user.id, // Security check
    },
    include: {
      itens: {
        include: {
          foto: true,
          licenca: true,
        },
      },
    },
  });

  if (!pedido) {
    notFound();
  }

  const isPaid = pedido.status === "PAGO";

  return (
    <div className="container-wide py-12 md:py-20">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/pedidos"
          className="inline-flex items-center text-muted-foreground hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para pedidos
        </Link>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-1 w-full space-y-6">
            <Card className="bg-card border-white/5 overflow-hidden">
              <CardHeader className="bg-white/5 pb-4">
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
                  {/* Dynamic Status Checker */}
                  <PaymentStatusChecker
                    orderId={pedido.id}
                    initialStatus={pedido.status}
                  />
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {!isPaid && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-500 text-sm">
                        Pagamento Pendente
                      </h4>
                      <p className="text-yellow-500/80 text-sm mt-1">
                        Seu pagamento ainda está sendo processado. Assim que
                        confirmado, suas fotos estarão disponíveis para
                        download.
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  {pedido.itens.map((item) => (
                    <div key={item.id} className="flex gap-4 items-start">
                      <div className="relative h-24 w-24 md:h-32 md:w-32 bg-muted rounded-lg overflow-hidden shrink-0 border border-white/10">
                        <ImageWithFallback
                          src={item.foto.previewUrl}
                          alt={item.foto.titulo}
                          fill
                          className={`object-cover ${!isPaid ? "opacity-60 blur-[1px]" : ""}`}
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
                              className="h-8 gap-2 bg-white/5 hover:bg-white/10 border-white/10 text-white"
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

          <div className="w-full md:w-80 space-y-6">
            <Card className="bg-card border-white/5">
              <CardHeader>
                <CardTitle className="text-lg text-white">
                  Resumo do Pedido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatCurrency(Number(pedido.total))}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Taxas</span>
                  <span>R$ 0,00</span>
                </div>
                <Separator className="bg-white/10 my-2" />
                <div className="flex justify-between font-bold text-white text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(Number(pedido.total))}</span>
                </div>
              </CardContent>
              <CardFooter className="bg-white/5 pt-6 flex flex-col gap-3">
                {!isPaid && (
                  <RetryPaymentButton
                    orderId={pedido.id}
                    items={pedido.itens.map((item) => ({
                      fotoId: item.fotoId,
                      licencaId: item.licencaId,
                      titulo: item.foto.titulo,
                      precoPaid: Number(item.precoPago),
                    }))}
                    user={user}
                  />
                )}
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/contato">Precisa de ajuda?</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

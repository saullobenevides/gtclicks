import prisma from "@/lib/prisma";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import {
  Calendar,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import ImageWithFallback from "@/components/shared/ImageWithFallback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import RetryPaymentButton from "@/components/pedidos/RetryPaymentButton";
import AppPagination from "@/components/shared/AppPagination";
import EmptyState from "@/components/shared/states/EmptyState";
import { Package } from "lucide-react";

type OrderStatus = "PAGO" | "PENDENTE" | "CANCELADO" | string;

function getStatusVariant(
  status: OrderStatus
): "success" | "warning" | "error" | "outline" {
  switch (status) {
    case "PAGO":
      return "success";
    case "PENDENTE":
      return "warning";
    case "CANCELADO":
      return "error";
    default:
      return "outline";
  }
}

function getStatusIcon(status: OrderStatus) {
  switch (status) {
    case "PAGO":
      return <CheckCircle className="h-4 w-4 mr-1" />;
    case "PENDENTE":
      return <Clock className="h-4 w-4 mr-1" />;
    case "CANCELADO":
      return <XCircle className="h-4 w-4 mr-1" />;
    default:
      return null;
  }
}

function getStatusLabel(status: OrderStatus): string {
  switch (status) {
    case "PAGO":
      return "Pago";
    case "PENDENTE":
      return "Pendente";
    case "CANCELADO":
      return "Cancelado";
    default:
      return status;
  }
}

type SearchParams = Record<string, string | string[] | undefined> | undefined;

function toFlatParams(p: SearchParams): Record<string, string> {
  if (!p) return {};
  return Object.fromEntries(
    Object.entries(p)
      .filter(([, v]) => v != null && v !== "")
      .map(([k, v]) => [k, Array.isArray(v) ? v[0] ?? "" : String(v)])
  );
}

interface PedidosContentProps {
  userId: string;
  searchParams: SearchParams;
  page: number;
}

export default async function PedidosContent({
  userId,
  searchParams,
  page,
}: PedidosContentProps) {
  const limit = 10;
  const skip = (page - 1) * limit;

  const [total, pedidos] = await Promise.all([
    prisma.pedido.count({ where: { userId } }),
    prisma.pedido.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
      include: {
        itens: {
          include: {
            foto: {
              select: { id: true, previewUrl: true, titulo: true },
            },
            licenca: { select: { id: true } },
          },
        },
      },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);
  const flatParams = toFlatParams(searchParams);

  if (pedidos.length === 0) {
    return (
      <Card className="bg-surface-card border-border-subtle rounded-radius-xl overflow-hidden">
        <CardContent className="p-0">
          <EmptyState
            icon={Package}
            title="Nenhum pedido encontrado"
            description="Você ainda não realizou nenhuma compra. Explore as coleções e encontre suas melhores fotos!"
            action={{ label: "Explorar Fotos", href: "/busca" }}
            variant="dashboard"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {pedidos.map((pedido) => (
        <Card
          key={pedido.id}
          className="group overflow-hidden transition-colors hover:border-border-default"
        >
          <CardContent className="p-0">
            <div className="p-4 sm:p-6">
              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mb-1">
                    <span className="rounded-radius-sm bg-surface-subtle px-2 py-0.5 font-mono text-xs text-muted-foreground">
                      #{pedido.id.slice(-8).toUpperCase()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(pedido.createdAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={getStatusVariant(pedido.status)}
                      className="font-medium"
                    >
                      {getStatusIcon(pedido.status)}
                      {getStatusLabel(pedido.status)}
                    </Badge>
                    <span className="text-white font-bold">
                      {formatCurrency(Number(pedido.total))}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                  {pedido.status === "PENDENTE" && (
                    <div className="w-full sm:w-48">
                      <RetryPaymentButton
                        orderId={pedido.id}
                        paymentId={pedido.paymentId}
                      />
                    </div>
                  )}
                  <Button
                    asChild
                    variant="secondary"
                    className="w-full md:w-auto"
                  >
                    <Link href={`/pedidos/${pedido.id}`}>
                      Ver Detalhes
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {pedido.itens.slice(0, 4).map((item) => (
                  <div
                    key={item.fotoId}
                    className="relative h-20 w-20 shrink-0 rounded-radius-lg overflow-hidden border border-border-subtle bg-surface-subtle"
                  >
                    <ImageWithFallback
                      src={item.foto.previewUrl}
                      alt={item.foto.titulo}
                      fill
                      className="object-cover opacity-80"
                    />
                  </div>
                ))}
                {pedido.itens.length > 4 && (
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-radius-lg border border-border-subtle bg-surface-subtle text-xs font-medium text-muted-foreground">
                    +{pedido.itens.length - 4} fotos
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      <div className="mt-8">
        <AppPagination
          currentPage={page}
          totalPages={totalPages}
          baseUrl="/pedidos"
          searchParams={flatParams}
        />
      </div>
    </div>
  );
}

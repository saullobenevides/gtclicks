import { getAuthenticatedUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import {
  Calendar,
  Package,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import ImageWithFallback from "@/components/shared/ImageWithFallback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import RetryPaymentButton from "@/components/pedidos/RetryPaymentButton";
import AppPagination from "@/components/shared/AppPagination";

export const metadata = {
  title: "Meus Pedidos",
  description: "Acompanhe seus pedidos e downloads",
};

export default async function PedidosPage(props) {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login?callbackUrl=/pedidos");
  }

  const searchParams = await props.searchParams;
  const page = searchParams?.page ? parseInt(searchParams.page) : 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  const [total, pedidos] = await Promise.all([
    prisma.pedido.count({
      where: {
        userId: user.id,
      },
    }),
    prisma.pedido.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: skip,
      include: {
        itens: {
          include: {
            foto: {
              select: {
                id: true,
                previewUrl: true,
                titulo: true,
              },
            },
            licenca: {
              select: { id: true },
            },
          },
        },
        _count: {
          select: { itens: true },
        },
      },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  const getStatusColor = (status) => {
    switch (status) {
      case "PAGO":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "PENDENTE":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "CANCELADO":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  const getStatusIcon = (status) => {
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
  };

  const getStatusLabel = (status) => {
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
  };

  return (
    <div className="container-wide py-12 md:py-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="heading-display font-display text-3xl md:text-4xl font-black text-white uppercase tracking-tight mb-2">
            Meus Pedidos
          </h1>
          <p className="text-muted-foreground">
            Gerencie suas compras e baixe suas fotos.
          </p>
        </div>
      </div>

      {pedidos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card/50 border border-white/5 rounded-2xl text-center">
          <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center mb-6">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            Nenhum pedido encontrado
          </h2>
          <p className="text-muted-foreground max-w-md mb-8">
            Você ainda não realizou nenhuma compra. Explore as coleções e
            encontre suas melhores fotos!
          </p>
          <Button asChild>
            <Link href="/busca">Explorar Fotos</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {pedidos.map((pedido) => (
            <div
              key={pedido.id}
              className="group bg-card/40 border border-white/5 rounded-2xl overflow-hidden hover:bg-card/60 transition-colors"
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mb-1">
                      <span className="font-mono text-xs bg-white/5 px-2 py-0.5 rounded">
                        #{pedido.id.slice(-8).toUpperCase()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(pedido.createdAt).toLocaleDateString(
                          "pt-BR",
                          {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`${getStatusColor(pedido.status)} font-medium`}
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
                          items={pedido.itens.map((item) => ({
                            fotoId: item.fotoId,
                            licencaId: item.licencaId,
                            titulo: item.foto.titulo,
                            precoPaid: Number(item.precoPago),
                          }))}
                          user={user}
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

                <div className="h-px bg-white/5 w-full mb-6" />

                <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {pedido.itens.slice(0, 4).map((item) => (
                    <div
                      key={item.fotoId}
                      className="relative h-20 w-20 shrink-0 bg-black/40 rounded-lg overflow-hidden border border-white/5"
                    >
                      <ImageWithFallback
                        src={item.foto.previewUrl}
                        alt={item.foto.titulo}
                        fill
                        className="object-cover opacity-80"
                      />
                    </div>
                  ))}
                  {pedido._count.itens > 4 && (
                    <div className="h-20 w-20 shrink-0 bg-white/5 rounded-lg flex items-center justify-center border border-white/5 text-xs text-muted-foreground font-medium">
                      +{pedido._count.itens - 4} fotos
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          <AppPagination
            currentPage={page}
            totalPages={totalPages}
            baseUrl="/pedidos"
            searchParams={searchParams}
          />
        </div>
      )}
    </div>
  );
}

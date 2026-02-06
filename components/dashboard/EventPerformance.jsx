"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  Eye,
  DollarSign,
  Users,
  ShoppingBag,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";

function MetricCard({ title, value, subtext, icon: Icon, highlight = false }) {
  return (
    <Card className={highlight ? "border-primary bg-primary/5" : ""}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
      </CardContent>
    </Card>
  );
}

export default function EventPerformance({ metrics, eventName }) {
  if (!metrics) return null;

  const { overview, rankings } = metrics;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{eventName}</h2>
        <p className="text-muted-foreground">
          Relatório de Performance do Evento
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Receita Líquida"
          value={formatCurrency(overview.netRevenue)}
          subtext={`Bruto: ${formatCurrency(overview.grossRevenue)}`}
          icon={DollarSign}
          highlight
        />
        <MetricCard
          title="Ticket Médio"
          value={formatCurrency(overview.ticketAverage)}
          subtext="Por comprador"
          icon={TrendingUp}
        />
        <MetricCard
          title="Conversão"
          value={`${overview.conversionRate}%`}
          subtext={`${overview.uniqueBuyers} compradores / ${overview.views} visitas`}
          icon={Users}
        />
        <MetricCard
          title="Vendas Totais"
          value={overview.totalSold}
          subtext="Fotos vendidas"
          icon={ShoppingBag}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Best Sellers */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>🏆 Fotos Mais Vendidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rankings.bestSellers.map((photo, i) => (
                <div key={photo.id} className="flex items-center gap-4">
                  <div className="relative h-12 w-12 rounded overflow-hidden">
                    <Image
                      src={photo.thumb}
                      alt={photo.title}
                      fill
                      sizes="48px"
                      className="object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm line-clamp-1">
                      {photo.title || `Foto ${photo.number || "Sem número"}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {photo.views} views
                    </p>
                  </div>
                  <div className="font-bold text-green-600">
                    {photo.sales} vendas
                  </div>
                </div>
              ))}
              {rankings.bestSellers.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  Nenhuma venda ainda.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Window Shoppers (Opportunity) */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              Olham mas não compram
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-4">
              Fotos com muitas visualizações mas 0 vendas. Considere baixar o
              preço ou usar em destaque.
            </p>
            <div className="space-y-4">
              {rankings.windowShoppers.map((photo, i) => (
                <div
                  key={photo.id}
                  className="flex items-center gap-4 opacity-80"
                >
                  <div className="relative h-10 w-10 rounded overflow-hidden grayscale">
                    <Image
                      src={photo.thumb}
                      alt={photo.title}
                      fill
                      sizes="48px"
                      className="object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-xs">
                      #{photo.number || "---"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-amber-600 text-sm font-medium">
                    <Eye className="h-3 w-3" />
                    {photo.views}
                  </div>
                </div>
              ))}
              {rankings.windowShoppers.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  Nenhum dado relevante.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

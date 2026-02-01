"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  ArrowUpRight,
  Eye,
  ShoppingCart,
  Download,
  TrendingUp,
  ShoppingBag,
  Activity,
  DollarSign,
  Images,
} from "lucide-react";

export default function AnalyticsOverview({ stats }) {
  // Dados simulados para o gráfico (enquanto não temos histórico diário no backend)
  // Futuramente, isso virá de uma rota /api/analytics/daily
  const chartData = [
    { name: "Seg", vendas: 0 },
    { name: "Ter", vendas: 0 },
    { name: "Qua", vendas: 0 },
    { name: "Qui", vendas: 0 },
    { name: "Sex", vendas: 0 },
    { name: "Sab", vendas: 0 },
    { name: "Dom", vendas: 0 },
  ];

  const conversionRate =
    stats.views > 0 ? ((stats.sales / stats.views) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="space-y-2">
        <h2 className="heading-display font-display font-black text-xl md:text-2xl text-white tracking-tight">
          Desempenho
        </h2>
        <p className="text-sm text-muted-foreground">
          Métricas e análise de performance das suas coleções
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Vendas Totais */}
        <Card className="bg-black/20 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Vendas Totais
            </CardTitle>
            <Images className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats.sales || 0}
            </div>
            <p className="text-xs text-muted-foreground">fotos vendidas</p>
          </CardContent>
        </Card>

        {/* Receita Total */}
        <Card className="bg-black/20 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receita Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              R$ {Number(stats.revenue || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              valor bruto acumulado
            </p>
          </CardContent>
        </Card>

        {/* Ticket Médio */}
        <Card className="bg-black/20 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ticket Médio
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              R$ {stats.avgTicket || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">por pedido</p>
          </CardContent>
        </Card>

        {/* Conversão */}
        <Card className="bg-black/20 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taxa de Conversão
            </CardTitle>
            <Activity className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">
              {stats.conversionRate || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              vendas / visualizações
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4 bg-black/20 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Vendas Recentes</CardTitle>
            <p className="text-sm text-muted-foreground">
              Histórico dos últimos 7 dias
            </p>
          </CardHeader>
          <CardContent className="pl-2 pr-2">
            <div className="h-[220px] md:h-[250px] w-full">
              {/* Placeholder Chart */}
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis
                    dataKey="name"
                    stroke="#a1a1aa"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#a1a1aa"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `R$${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1c1c1c",
                      border: "none",
                      color: "#ffffff",
                      borderRadius: "8px",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    }}
                    itemStyle={{ color: "#ffffff" }}
                  />
                  <Bar
                    dataKey="vendas"
                    fill="currentColor"
                    radius={[4, 4, 0, 0]}
                    className="fill-primary"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 bg-black/20 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Fotos Populares</CardTitle>
            <p className="text-sm text-muted-foreground">
              Suas fotos com mais visualizações
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-[200px] md:h-[230px] text-muted-foreground border-2 border-dashed border-white/10 rounded-md">
              <div className="text-center space-y-2">
                <Images className="h-8 w-8 mx-auto opacity-20" />
                <p className="text-sm">Ainda não há dados suficientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

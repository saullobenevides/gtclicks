'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { ArrowUpRight, Eye, ShoppingCart, Download, TrendingUp, ShoppingBag } from 'lucide-react';

export default function AnalyticsOverview({ stats }) {
  // Dados simulados para o gráfico (enquanto não temos histórico diário no backend)
  // Futuramente, isso virá de uma rota /api/analytics/daily
  const chartData = [
    { name: 'Seg', vendas: 0 },
    { name: 'Ter', vendas: 0 },
    { name: 'Qua', vendas: 0 },
    { name: 'Qui', vendas: 0 },
    { name: 'Sex', vendas: 0 },
    { name: 'Sab', vendas: 0 },
    { name: 'Dom', vendas: 0 },
  ];

  const conversionRate = stats.views > 0 ? ((stats.sales / stats.views) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Desempenho</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visualizações Totais</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.views || 0}</div>
            <p className="text-xs text-muted-foreground">
              Acessos às suas fotos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Totais</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sales || 0}</div>
            <p className="text-xs text-muted-foreground">
              Fotos vendidas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.downloads || 0}</div>
            <p className="text-xs text-muted-foreground">
              Downloads realizados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">No Carrinho</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cartAdds || 0}</div>
            <p className="text-xs text-muted-foreground">
              Adições ao carrinho
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Vendas por visualização
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Vendas Recentes</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[200px]">
                {/* Placeholder Chart */}
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                    <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    />
                    <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `R$${value}`}
                    />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="vendas" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
                </BarChart>
                </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Fotos Populares</CardTitle>
            <p className="text-sm text-muted-foreground">
              Suas fotos com mais visualizações.
            </p>
          </CardHeader>
          <CardContent>
             <div className="flex flex-col gap-4">
                <div className="flex items-center justify-center h-[150px] text-muted-foreground border-2 border-dashed rounded-md">
                    Ainda não há dados suficientes
                </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatsCard from "@/components/admin/StatsCard";
import { DollarSign, Users, ShoppingCart, Image, Loader2 } from "lucide-react";
import { getAdminStats } from "@/actions/admin";

interface AdminStats {
  totalRevenue?: number;
  activeUsers?: number;
  ordersCount?: number;
  collectionsCount?: number;
  recentActivity?: Array<{
    id: string;
    description: string;
    itemsCount: number;
    total: number;
    status: string;
    createdAt: string | Date;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const result = await getAdminStats();

      if (result.error) {
        throw new Error(result.error);
      }

      setStats(result.data ?? null);
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="heading-display font-display text-2xl md:text-3xl font-black text-white uppercase tracking-tight mb-2">
          Dashboard Admin
        </h1>
        <p className="text-zinc-400">Visão geral da plataforma GTClicks</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Receita Total"
          value={`R$ ${(stats?.totalRevenue || 0).toFixed(2)}`}
          icon={DollarSign}
          change={undefined}
        />
        <StatsCard
          title="Usuários"
          value={stats?.activeUsers || 0}
          icon={Users}
          change={undefined}
        />
        <StatsCard
          title="Pedidos (30d)"
          value={stats?.ordersCount || 0}
          icon={ShoppingCart}
          change={undefined}
        />
        <StatsCard
          title="Coleções Publicadas"
          value={stats?.collectionsCount || 0}
          icon={Image}
          change={undefined}
        />
      </div>

      <div className="glass-panel p-6">
        <h2 className="text-xl font-bold text-white mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/usuarios"
            className="p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10"
          >
            <h3 className="font-semibold text-white mb-1">
              Gerenciar Usuários
            </h3>
            <p className="text-sm text-zinc-400">
              Ver e editar usuários da plataforma
            </p>
          </Link>

          <Link
            href="/admin/colecoes"
            className="p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10"
          >
            <h3 className="font-semibold text-white mb-1">Moderar Coleções</h3>
            <p className="text-sm text-zinc-400">
              Aprovar ou rejeitar coleções pendentes
            </p>
          </Link>

          <Link
            href="/admin/pedidos"
            className="p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10"
          >
            <h3 className="font-semibold text-white mb-1">Ver Pedidos</h3>
            <p className="text-sm text-zinc-400">
              Monitorar pedidos e transações
            </p>
          </Link>
        </div>
      </div>

      <div className="glass-panel p-6">
        <h2 className="text-xl font-bold text-white mb-4">Atividade Recente</h2>
        {stats?.recentActivity && stats.recentActivity.length > 0 ? (
          <div className="space-y-3">
            {stats.recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
              >
                <div>
                  <p className="text-white font-medium">
                    {activity.description}
                  </p>
                  <p className="text-sm text-zinc-400">
                    {activity.itemsCount}{" "}
                    {activity.itemsCount === 1 ? "foto" : "fotos"} • R${" "}
                    {activity.total.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      activity.status === "PAGO"
                        ? "bg-green-500/20 text-green-400"
                        : activity.status === "PENDENTE"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {activity.status}
                  </span>
                  <p className="text-xs text-zinc-500 mt-1">
                    {new Date(activity.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-zinc-500">
            Nenhuma atividade recente para exibir.
          </p>
        )}
      </div>
    </div>
  );
}

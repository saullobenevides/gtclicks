'use client';

import StatsCard from '@/components/admin/StatsCard';
import { DollarSign, Users, ShoppingCart, Image } from 'lucide-react';

export default function AdminDashboard() {
  // Mock stats for now - will be replaced with real data
  const stats = {
    totalRevenue: 15420.50,
    activeUsers: 342,
    ordersCount: 127,
    collectionsCount: 89
  };
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard Admin</h1>
        <p className="text-zinc-400">Visão geral da plataforma GTClicks</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Receita Total" 
          value={`R$ ${stats.totalRevenue.toFixed(2)}`}
          change={12.5}
          icon={DollarSign}
        />
        <StatsCard 
          title="Usuários Ativos" 
          value={stats.activeUsers}
          change={8.2}
          icon={Users}
        />
        <StatsCard 
          title="Pedidos (30d)" 
          value={stats.ordersCount}
          change={-3.1}
          icon={ShoppingCart}
        />
        <StatsCard 
          title="Coleções Publicadas" 
          value={stats.collectionsCount}
          change={15.7}
          icon={Image}
        />
      </div>
      
      {/* Quick Actions */}
      <div className="glass-panel p-6">
        <h2 className="text-xl font-bold text-white mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a 
            href="/admin/usuarios" 
            className="p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10"
          >
            <h3 className="font-semibold text-white mb-1">Gerenciar Usuários</h3>
            <p className="text-sm text-zinc-400">Ver e editar usuários da plataforma</p>
          </a>
          
          <a 
            href="/admin/colecoes" 
            className="p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10"
          >
            <h3 className="font-semibold text-white mb-1">Moderar Coleções</h3>
            <p className="text-sm text-zinc-400">Aprovar ou rejeitar coleções pendentes</p>
          </a>
          
          <a 
            href="/admin/pedidos" 
            className="p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10"
          >
            <h3 className="font-semibold text-white mb-1">Ver Pedidos</h3>
            <p className="text-sm text-zinc-400">Monitorar pedidos e transações</p>
          </a>
        </div>
      </div>
      
      {/* Recent Activity Placeholder */}
      <div className="glass-panel p-6">
        <h2 className="text-xl font-bold text-white mb-4">Atividade Recente</h2>
        <p className="text-zinc-500">Nenhuma atividade recente para exibir.</p>
      </div>
    </div>
  );
}

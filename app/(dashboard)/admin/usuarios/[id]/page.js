import { requireAdmin } from '@/lib/admin/permissions';
import prisma from '@/lib/prisma';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { notFound } from 'next/navigation';

export default async function UserDetailPage({ params }) {
  const admin = await requireAdmin();
  const { id } = params;
  
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      fotografo: {
        include: {
          colecoes: {
            select: {
              id: true,
              nome: true,
              status: true,
              createdAt: true
            },
            take: 10
          }
        }
      },
      pedidos: {
        select: {
          id: true,
          total: true,
          status: true,
          createdAt: true
        },
        take: 10,
        orderBy: { createdAt: 'desc' }
      }
    }
  });
  
  if (!user) {
    notFound();
  }
  
  const totalSpent = user.pedidos
    .filter(p => p.status === 'APPROVED')
    .reduce((sum, p) => sum + parseFloat(p.total), 0);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{user.name || 'Sem nome'}</h1>
          <p className="text-zinc-400 mt-1">{user.email}</p>
        </div>
        
        <div className="flex gap-3">
          {user.isActive ? (
            <form action={`/api/admin/users/${user.id}/suspend`} method="POST">
              <Button variant="destructive">Suspender Conta</Button>
            </form>
          ) : (
            <form action={`/api/admin/users/${user.id}/activate`} method="POST">
              <Button>Ativar Conta</Button>
            </form>
          )}
        </div>
      </div>
      
      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6">
          <p className="text-sm text-zinc-400 mb-2">Role</p>
          <Badge variant="default">{user.role}</Badge>
        </div>
        
        <div className="glass-panel p-6">
          <p className="text-sm text-zinc-400 mb-2">Status</p>
          {user.isActive ? (
            <Badge variant="outline" className="bg-green-500/10 text-green-500">Ativo</Badge>
          ) : (
            <Badge variant="outline" className="bg-red-500/10 text-red-500">Suspenso</Badge>
          )}
        </div>
        
        <div className="glass-panel p-6">
          <p className="text-sm text-zinc-400 mb-2">Total Gasto</p>
          <p className="text-2xl font-bold text-white">R$ {totalSpent.toFixed(2)}</p>
        </div>
      </div>
      
      {/* Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Info */}
        <div className="glass-panel p-6">
          <h2 className="text-xl font-bold text-white mb-4">Informações</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-zinc-400">Email</dt>
              <dd className="text-white">{user.email}</dd>
            </div>
            <div>
              <dt className="text-sm text-zinc-400">Cadastro</dt>
              <dd className="text-white">{new Date(user.createdAt).toLocaleDateString('pt-BR')}</dd>
            </div>
            {user.suspendedAt && (
              <div>
                <dt className="text-sm text-zinc-400">Suspenso em</dt>
                <dd className="text-white">{new Date(user.suspendedAt).toLocaleDateString('pt-BR')}</dd>
              </div>
            )}
            {user.adminNotes && (
              <div>
                <dt className="text-sm text-zinc-400">Notas Admin</dt>
                <dd className="text-white">{user.adminNotes}</dd>
              </div>
            )}
          </dl>
        </div>
        
        {/* Stats */}
        <div className="glass-panel p-6">
          <h2 className="text-xl font-bold text-white mb-4">Estatísticas</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-zinc-400">Total de Pedidos</dt>
              <dd className="text-2xl font-bold text-white">{user.pedidos.length}</dd>
            </div>
            {user.fotografo && (
              <div>
                <dt className="text-sm text-zinc-400">Coleções Criadas</dt>
                <dd className="text-2xl font-bold text-white">{user.fotografo.colecoes.length}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
      
      {/* Recent Orders */}
      {user.pedidos.length > 0 && (
        <div className="glass-panel p-6">
          <h2 className="text-xl font-bold text-white mb-4">Pedidos Recentes</h2>
          <div className="space-y-3">
            {user.pedidos.map(order => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <p className="font-medium text-white">R$ {parseFloat(order.total).toFixed(2)}</p>
                  <p className="text-sm text-zinc-400">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
                <Badge>{order.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

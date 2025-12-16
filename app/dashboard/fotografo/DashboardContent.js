'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useUser } from '@stackframe/stack';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Images, DollarSign, Upload, ArrowRight, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import FotografoOnboarding from '@/components/FotografoOnboarding';

function StatCard({ icon, title, value, description, actionText, actionHref }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={actionHref}>{actionText}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function DashboardInner() {
  const user = useUser({ or: 'redirect' }); // Redirects to login if not authenticated
  const [fotografo, setFotografo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetch(`/api/fotografos/resolve?userId=${user.id}`)
        .then(async (res) => {
           const payload = await res.json();
           if (res.ok) {
             setFotografo(payload.data);
           }
        })
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  // Se não achou fotógrafo no banco, mostra o Onboarding
  if (!fotografo) {
    return (
        <FotografoOnboarding 
            onSuccess={(data) => {
                setFotografo(data); // Atualiza estado local para exibir dashboard
            }}
        />
    );
  }

  const stats = {
    colecoes: fotografo._count?.colecoes || 0,
    fotos: fotografo._count?.fotos || 0,
    saldo: fotografo.saldo?.disponivel || '0,00',
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="mb-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo de volta, {fotografo.username}!
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Minhas Coleções"
          value={stats.colecoes}
          description={`${stats.fotos} fotos em ${stats.colecoes} coleções`}
          icon={<Images className="h-4 w-4 text-muted-foreground" />}
          actionText="Gerenciar Coleções"
          actionHref="/dashboard/fotografo/colecoes"
        />
        <StatCard
          title="Saldo Disponível"
          value={`R$ ${stats.saldo}`}
          description="Valor disponível para saque"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          actionText="Ver Financeiro"
          actionHref="/dashboard/fotografo/financeiro"
        />
        <StatCard
          title="Nova Coleção"
          value="Criar Coleção"
          description="Crie uma coleção e faça upload de fotos"
          icon={<Upload className="h-4 w-4 text-muted-foreground" />}
          actionText="Criar Agora"
          actionHref="/dashboard/fotografo/colecoes"
        />
      </div>

      <div>
        <h2 className="mb-4 text-2xl font-bold">Ações Rápidas</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Link href="/dashboard/fotografo/colecoes">
                <Card className="flex h-full flex-col justify-between p-6 transition-all hover:bg-muted">
                    <div>
                        <h3 className="text-xl font-bold">Gerenciar Coleções</h3>
                        <p className="text-muted-foreground">
                        Visualize, edite e organize suas coleções.
                        </p>
                    </div>
                    <div className="mt-4 flex items-center font-semibold text-primary">
                        <span>Ir para Coleções</span>
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                </Card>
            </Link>
            <Link href="/dashboard/fotografo/financeiro">
                <Card className="flex h-full flex-col justify-between p-6 transition-all hover:bg-muted">
                    <div>
                        <h3 className="text-xl font-bold">Consultar Financeiro</h3>
                        <p className="text-muted-foreground">
                        Acompanhe seu saldo, histórico de vendas e solicite saques.
                        </p>
                    </div>
                    <div className="mt-4 flex items-center font-semibold text-primary">
                        <span>Ir para Financeiro</span>
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                </Card>
            </Link>
        </div>
      </div>
    </div>
  );
}

export default function DashboardContent() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!mounted) {
        return (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        );
    }

    return <DashboardInner />;
}

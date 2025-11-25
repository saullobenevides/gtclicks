import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { stackServerApp } from '@/stack/server';
import prisma from '@/lib/prisma';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Camera, DollarSign, Upload, ArrowRight } from 'lucide-react';

async function StatCard({ icon, title, value, description, actionText, actionHref }) {
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


export default async function FotografoDashboard() {
  const user = await stackServerApp.getUser();

  if (!user) {
    // This case is handled by the layout, but as a fallback:
    return (
      <div className="container">
        <p>Você precisa estar logado para acessar esta página.</p>
      </div>
    );
  }

  const fotografo = await prisma.fotografo.findUnique({
    where: { userId: user.id },
    include: {
      saldo: true,
      _count: {
        select: {
          fotos: true,
        },
      },
    },
  });

  if (!fotografo) {
     // This case is handled by the layout, but as a fallback:
    return (
      <div className="container">
        <p>Perfil de fotógrafo não encontrado.</p>
      </div>
    );
  }

  const stats = {
    fotos: fotografo._count.fotos,
    saldo: fotografo.saldo?.disponivel?.toString() || '0,00',
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
          title="Fotos Publicadas"
          value={stats.fotos}
          description="Total de fotos no seu portfólio"
          icon={<Camera className="h-4 w-4 text-muted-foreground" />}
          actionText="Ver Minhas Fotos"
          actionHref="/dashboard/fotografo/fotos"
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
          title="Novo Upload"
          value="Adicionar Fotos"
          description="Envie novas imagens para a plataforma"
          icon={<Upload className="h-4 w-4 text-muted-foreground" />}
          actionText="Fazer Upload"
          actionHref="/dashboard/fotografo/upload"
        />
      </div>

      <div>
        <h2 className="mb-4 text-2xl font-bold">Ações Rápidas</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Link href="/dashboard/fotografo/fotos">
                <Card className="flex h-full flex-col justify-between p-6 transition-all hover:bg-muted">
                    <div>
                        <h3 className="text-xl font-bold">Gerenciar Portfólio</h3>
                        <p className="text-muted-foreground">
                        Visualize, edite ou remova suas fotos publicadas.
                        </p>
                    </div>
                    <div className="mt-4 flex items-center font-semibold text-primary">
                        <span>Ir para Minhas Fotos</span>
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

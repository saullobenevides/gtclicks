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
import { Badge } from '@/components/ui/badge';
import ImageWithFallback from '@/components/ImageWithFallback';
import { Images } from 'lucide-react';
import CreateCollectionButton from '@/components/CreateCollectionButton';

const formatDate = (date) => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

export default async function MinhasColecoesPage() {
  const user = await stackServerApp.getUser();

  if (!user) {
    return (
        <div className="container">
            <p>Você precisa estar logado para acessar esta página.</p>
        </div>
    );
  }

  const fotografo = await prisma.fotografo.findUnique({
    where: { userId: user.id },
  });

  if (!fotografo) {
    return (
        <div className="container">
            <p>Perfil de fotógrafo não encontrado.</p>
        </div>
    );
  }

  const colecoes = await prisma.colecao.findMany({
    where: { fotografoId: fotografo.id },
    include: {
      _count: {
        select: { fotos: true },
      },
      fotos: {
        take: 1,
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Minhas Coleções</h1>
          <p className="text-muted-foreground">
            Gerencie suas coleções de fotos
          </p>
        </div>
        <CreateCollectionButton />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {colecoes.length === 0 ? (
             <div className="col-span-full flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-24 text-center">
                <h2 className="text-2xl font-bold">Nenhuma coleção ainda</h2>
                <p className="mb-6 text-muted-foreground">
                  Crie sua primeira coleção para começar a vender fotos!
                </p>
                <CreateCollectionButton />
             </div>
        ) : (
            colecoes.map((colecao) => (
                <Card key={colecao.id} className="overflow-hidden flex flex-col">
                   <div className="aspect-video w-full bg-muted relative">
                       {colecao.capaUrl || (colecao.fotos[0] && colecao.fotos[0].previewUrl) ? (
                           <ImageWithFallback
                             src={colecao.capaUrl || colecao.fotos[0].previewUrl}
                             alt={colecao.nome}
                             className="h-full w-full object-cover"
                           />
                       ) : (
                           <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                               <Images className="h-12 w-12 opacity-20" />
                           </div>
                       )}
                   </div>
                   <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-start">
                           <CardTitle className="line-clamp-1 text-lg">{colecao.nome}</CardTitle>
                           <Badge variant={colecao.status === 'PUBLICADA' ? 'default' : 'secondary'}>
                               {colecao.status}
                           </Badge>
                        </div>
                        <CardDescription className="line-clamp-1 text-xs">
                            {formatDate(colecao.createdAt)}
                        </CardDescription>
                   </CardHeader>
                   <CardContent className="p-4 pt-0 flex-grow">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                            {colecao.descricao || "Sem descrição"}
                        </p>
                        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                            <Images className="h-3 w-3" />
                            {colecao._count.fotos} fotos
                        </div>
                   </CardContent>
                   <CardFooter className="p-4 pt-0">
                        <Button asChild className="w-full" variant="outline">
                            <Link href={`/dashboard/fotografo/colecoes/${colecao.id}/editar`}>
                                Gerenciar
                            </Link>
                        </Button>
                   </CardFooter>
                </Card>
            ))
        )}
      </div>
    </div>
  );
}

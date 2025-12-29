'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@stackframe/stack';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import ImageWithFallback from '@/components/shared/ImageWithFallback';
import { ResponsiveGrid } from '@/components/shared/layout';
import { EmptyState } from '@/components/shared/states';
import { Eye, Heart, Download, PlusCircle, ImageIcon } from 'lucide-react';

function PhotoCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-0">
        <Skeleton className="aspect-[4/3] w-full" />
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4 p-5">
        <div className="w-full space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-20" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-9 w-28" />
        </div>
      </CardFooter>
    </Card>
  );
}

export default function MinhasFotosPage() {
  const user = useUser();
  const isUserLoading = user === undefined;
  const router = useRouter();
  const [fotos, setFotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isUserLoading) return;
    if (!user) {
      router.push('/login?redirect=/dashboard/fotografo/fotos');
      return;
    }

    fetch(`/api/fotografos/fotos?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        setFotos(data.data || []);
      })
      .catch((error) => {
        console.error('Error fetching photos:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user, isUserLoading, router]);

  const renderContent = () => {
    if (loading) {
      return (
        <ResponsiveGrid cols={{ sm: 1, md: 2, lg: 3, xl: 4 }} gap={8}>
          {[...Array(8)].map((_, i) => (
            <PhotoCardSkeleton key={i} />
          ))}
        </ResponsiveGrid>
      );
    }

    if (fotos.length === 0) {
      return (
        <EmptyState
          icon={ImageIcon}
          title="Nenhuma foto ainda"
          description="Comece fazendo upload das suas primeiras fotos!"
          action={{
            label: "Fazer Upload",
            href: "/dashboard/fotografo/upload"
          }}
        />
      );
    }

    return (
      <ResponsiveGrid cols={{ sm: 1, md: 2, lg: 3, xl: 4 }} gap={8}>
        {fotos.map((foto) => (
          <Card key={foto.id} className="overflow-hidden">
            <CardContent className="aspect-[4/3] w-full p-0">
              <ImageWithFallback
                src={foto.previewUrl}
                alt={foto.titulo}
                className="h-full w-full object-cover"
              />
            </CardContent>
            <div className="flex flex-col p-5">
              <h3 className="mb-2 font-bold leading-tight">{foto.titulo}</h3>
              <div className="mb-3 flex flex-wrap gap-2">
                <Badge variant="secondary">{foto.categoria || 'Sem categoria'}</Badge>
                <Badge variant="secondary">{foto.orientacao}</Badge>
              </div>
              <div className="mb-4 flex gap-4 text-sm text-muted-foreground">
                <span className='flex items-center gap-1'><Eye className='w-4 h-4'/> {foto.views || 0}</span>
                <span className='flex items-center gap-1'><Heart className='w-4 h-4'/> {foto.likes || 0}</span>
                <span className='flex items-center gap-1'><Download className='w-4 h-4'/> {foto.downloads || 0}</span>
              </div>
              <div className="mt-auto flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/foto/${foto.id}`}>Ver Detalhes</Link>
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </ResponsiveGrid>
    );
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Minhas Fotos</h1>
          <p className="text-muted-foreground">
            {fotos.length} {fotos.length === 1 ? 'foto publicada' : 'fotos publicadas'}
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/fotografo/upload">
            <PlusCircle className="mr-2 h-4 w-4" /> Nova Foto
          </Link>
        </Button>
      </div>
      {renderContent()}
    </div>
  );
}

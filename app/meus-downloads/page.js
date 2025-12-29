'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useUser } from '@stackframe/stack';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import ImageWithFallback from '@/components/shared/ImageWithFallback';
import { PageSection, SectionHeader, ResponsiveGrid } from '@/components/shared/layout';
import { EmptyState, LoadingState } from '@/components/shared/states';

function DownloadCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-0">
        <Skeleton className="aspect-[4/3] w-full" />
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4 p-6">
        <div className='w-full space-y-2'>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}

export default function DownloadsPage() {
  const user = useUser();
  const isUserLoading = user === undefined;
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(isUserLoading || (user !== null && user !== undefined));

  useEffect(() => {
    if (isUserLoading) {
      return;
    }
    if (!user) {
      return;
    }

    fetch(`/api/meus-downloads?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        setPurchases(data.data || []);
      })
      .catch((err) => {
        console.error('Failed to fetch downloads:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user, isUserLoading]);

  const renderContent = () => {
    if (isUserLoading || loading) {
      return (
        <ResponsiveGrid cols={{ sm: 1, md: 2, lg: 3, xl: 4 }} gap={8}>
          {[...Array(4)].map((_, i) => (
            <DownloadCardSkeleton key={i} />
          ))}
        </ResponsiveGrid>
      );
    }

    if (!user) {
      return (
        <div className="flex h-[50vh] items-center justify-center">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <CardTitle>Acesso Restrito</CardTitle>
              <CardDescription>
                Faça login para ver suas fotos compradas.
              </CardDescription>
            </CardHeader>
            <CardFooter className="justify-center">
              <Button asChild>
                <Link href="/login?redirect=/meus-downloads">Fazer Login</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    if (purchases.length === 0) {
      return (
        <EmptyState
          title="Nenhuma Compra Encontrada"
          description="Você ainda não comprou nenhuma foto."
          action={{
            label: "Explorar Fotos",
            href: "/busca"
          }}
        />
      );
    }

    return (
      <ResponsiveGrid cols={{ sm: 1, md: 2, lg: 3, xl: 4 }} gap={8}>
        {purchases.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <CardContent className="aspect-[4/3] w-full p-0">
              <ImageWithFallback
                src={item.foto?.previewUrl}
                alt={item.foto?.titulo || 'Foto comprada'}
                className="h-full w-full object-cover"
              />
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-4 p-6">
              <div>
                <h3 className="font-bold">{item.foto?.titulo || 'Foto sem título'}</h3>
                <p className="font-semibold text-primary">{item.licenca?.nome}</p>
                <p className="text-sm text-muted-foreground">
                  Comprada em{' '}
                  {new Date(item.pedido?.createdAt || item.createdAt || Date.now()).toLocaleDateString('pt-BR')}
                </p>
              </div>
              {item.downloadToken ? (
                <Button asChild className="w-full">
                  <a href={`/api/download/${item.downloadToken}`} target="_blank" rel="noopener noreferrer">
                    Baixar Original
                  </a>
                </Button>
              ) : (
                <Button variant="outline" className="w-full" disabled>
                  Em processamento...
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </ResponsiveGrid>
    );
  };

  return (
    <PageSection variant="default">
      <SectionHeader 
        badge="Minha Conta"
        title="Meus Downloads"
        align="center"
      />
      {renderContent()}
    </PageSection>
  );
}

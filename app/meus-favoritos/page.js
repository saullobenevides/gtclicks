'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@stackframe/stack';
import Link from 'next/link';
import Image from 'next/image';
import { PageSection, SectionHeader } from '@/components/shared/layout';
import { ResponsiveGrid } from '@/components/shared/layout';
import { EmptyState, LoadingState } from '@/components/shared/states';
import { ImageIcon } from 'lucide-react';

export default function MyFavoritesPage() {
  const user = useUser({ or: 'redirect' });
  const [likedPhotos, setLikedPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetch('/api/users/me/likes')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setLikedPhotos(data);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [user]);

  return (
    <PageSection variant="default">
      <SectionHeader 
        badge="Minha Coleção"
        title="Meus Favoritos"
        description="Fotos que você curtiu e salvou para ver depois."
        align="left"
      />

      {loading ? (
        <LoadingState variant="skeleton" count={8} size="lg" />
      ) : (
        <ResponsiveGrid
          cols={{ sm: 1, md: 2, lg: 3, xl: 4 }}
          gap={6}
          empty={
            <EmptyState
              title="Nenhum favorito ainda"
              description="Você ainda não curtiu nenhuma foto."
              action={{
                label: "Explorar fotos",
                href: "/busca"
              }}
            />
          }
        >
          {likedPhotos.map((photo) => (
            <Link 
              key={photo.id} 
              href={`/foto/${photo.id}`} 
              className="group relative aspect-[3/4] overflow-hidden rounded-lg bg-muted"
            >
              <Image
                src={photo.previewUrl}
                alt={photo.titulo}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="absolute bottom-0 left-0 p-4 text-white opacity-0 transition-opacity group-hover:opacity-100">
                <p className="font-semibold truncate">{photo.titulo}</p>
                <p className="text-sm text-gray-300 truncate">{photo.fotografo?.username || 'Fotógrafo'}</p>
              </div>
            </Link>
          ))}
        </ResponsiveGrid>
      )}
    </PageSection>
  );
}

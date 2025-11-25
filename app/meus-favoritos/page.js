'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@stackframe/stack';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';

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

  if (loading) {
    return <div className="p-8 text-center">Carregando favoritos...</div>;
  }

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex flex-col gap-8">
        <div className="border-b pb-6">
          <Badge className="mb-2">Minha Coleção</Badge>
          <h1 className="text-3xl font-bold">Meus Favoritos</h1>
          <p className="text-muted-foreground mt-2">
            Fotos que você curtiu e salvou para ver depois.
          </p>
        </div>

        {likedPhotos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">Você ainda não curtiu nenhuma foto.</p>
            <Link href="/busca" className="text-primary hover:underline mt-4 inline-block">
              Explorar fotos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {likedPhotos.map((photo) => (
              <Link key={photo.id} href={`/foto/${photo.id}`} className="group relative aspect-[3/4] overflow-hidden rounded-lg bg-muted">
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
          </div>
        )}
      </div>
    </section>
  );
}

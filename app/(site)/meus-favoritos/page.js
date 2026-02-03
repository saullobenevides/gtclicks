"use client";

import { useCallback, useEffect, useState } from "react";
import { useUser } from "@stackframe/stack";
import { PageSection, SectionHeader } from "@/components/shared/layout";
import { ResponsiveGrid } from "@/components/shared/layout";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/shared/states";
import { ImageIcon } from "lucide-react";
import { getLikedPhotos } from "@/actions/photos";
import PhotoCard from "@/components/shared/cards/PhotoCard";

export default function MyFavoritesPage() {
  const user = useUser({ or: "redirect" });
  const [likedPhotos, setLikedPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFavorites = useCallback(() => {
    setError(null);
    setLoading(true);
    getLikedPhotos()
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setLikedPhotos(res.data);
        }
      })
      .catch(() => setError("Não foi possível carregar seus favoritos."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user) fetchFavorites();
  }, [user, fetchFavorites]);

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
      ) : error ? (
        <ErrorState
          title="Erro ao carregar"
          message={error}
          onRetry={fetchFavorites}
        />
      ) : (
        <ResponsiveGrid
          cols={{ sm: 1, md: 2, lg: 3, xl: 4 }}
          gap={6}
          empty={
            <EmptyState
              icon={ImageIcon}
              title="Nenhum favorito ainda"
              description="Você ainda não curtiu nenhuma foto. Explore as coleções e salve suas favoritas!"
              action={{
                label: "Explorar fotos",
                href: "/busca",
              }}
              variant="dashboard"
            />
          }
        >
          {likedPhotos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              contextList={likedPhotos}
              variant="centered-hover"
              showSelection={false}
            />
          ))}
        </ResponsiveGrid>
      )}
    </PageSection>
  );
}

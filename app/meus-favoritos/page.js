"use client";

import { useEffect, useState } from "react";
import { useUser } from "@stackframe/stack";
import Link from "next/link";
import { PageSection, SectionHeader } from "@/components/shared/layout";
import { ResponsiveGrid } from "@/components/shared/layout";
import { EmptyState, LoadingState } from "@/components/shared/states";
import { ImageIcon } from "lucide-react";
import { getLikedPhotos } from "@/actions/photos";
import PhotoCard from "@/components/shared/cards/PhotoCard";

export default function MyFavoritesPage() {
  const user = useUser({ or: "redirect" });
  const [likedPhotos, setLikedPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getLikedPhotos()
        .then((res) => {
          if (res.success && Array.isArray(res.data)) {
            setLikedPhotos(res.data);
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
            <PhotoCard key={photo.id} photo={photo} contextList={likedPhotos} />
          ))}
        </ResponsiveGrid>
      )}
    </PageSection>
  );
}

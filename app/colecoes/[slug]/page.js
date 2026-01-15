import Link from "next/link";
import { notFound } from "next/navigation";
import { getCollectionBySlug, getCollections } from "@/lib/data/marketplace";
import { Button } from "@/components/ui/button";
import { PhotoCard } from "@/components/shared/cards";
import { Folder, ArrowLeft, InfoIcon } from "lucide-react";
import ShareButton from "@/components/shared/actions/ShareButton";
import ViewTracker from "@/components/analytics/ViewTracker";
import CollectionSearchClient from "@/features/collections/components/CollectionSearchClient";
import PageContainer from "@/components/shared/layout/PageContainer";

// New Components
import CollectionHero from "./_components/CollectionHero";
import CollectionFAQ from "./_components/CollectionFAQ";
import FeaturedCollections from "@/components/home/FeaturedCollections";

export const revalidate = 60; // Revalidate every minute

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);

  if (!collection) {
    return {
      title: "Coleção não encontrada | GTClicks",
      description: "A coleção que você procura não está disponível.",
    };
  }

  return {
    title: `${collection.title} por ${collection.photographer} | GTClicks`,
    description:
      collection.description ||
      `Confira a coleção ${collection.title} no GTClicks.`,
    openGraph: {
      title: collection.title,
      description: collection.description,
      images: collection.photos?.[0]?.previewUrl
        ? [collection.photos[0].previewUrl]
        : [],
    },
  };
}

export default async function CollectionDetail({ params, searchParams }) {
  const { slug } = await params;
  const { folderId } = await searchParams;

  // Fetch collection data
  const collection = await getCollectionBySlug(slug);

  if (!collection) {
    notFound();
  }

  // Fetch verified collections for "Featured" section (exclude current one)
  const allCollections = await getCollections();
  const relatedCollections = allCollections
    .filter((c) => c.id !== collection.id)
    .slice(0, 3);

  // Filter content based on current folder level
  const currentLevelFolders = (collection.folders || []).filter(
    (f) => f.parentId === (folderId || null)
  );

  const currentLevelPhotos = (collection.photos || []).filter(
    (p) => p.folderId === (folderId || null)
  );

  const currentFolder = folderId
    ? (collection.folders || []).find((f) => f.id === folderId)
    : null;

  return (
    <div className="min-h-screen bg-background">
      <ViewTracker entityId={collection.id} type="colecao" />

      {/* 1. HERO SECTION (Figma Node 35:155 equivalent) */}
      <CollectionHero collection={collection} />

      {/* 2. MAIN CONTENT */}
      <div className="bg-background pt-12 pb-20">
        <PageContainer>
          {/* 3. PHOTO GRID HEADER (Figma Node 35:163 "Escolha suas fotos") */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-normal text-white mb-2">
              Escolha suas fotos
            </h2>
          </div>

          <CollectionSearchClient
            allPhotos={collection.photos || []}
            collectionId={collection.id}
          >
            {/* Folder Navigation Header */}
            {(folderId || currentLevelFolders.length > 0) && (
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                  {folderId && (
                    <Button
                      variant="ghost"
                      asChild
                      className="hover:bg-white/5"
                    >
                      <Link
                        href={`/colecoes/${slug}${
                          currentFolder?.parentId
                            ? `?folderId=${currentFolder.parentId}`
                            : ""
                        }`}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                      </Link>
                    </Button>
                  )}
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Folder className="text-primary h-6 w-6" />
                    {currentFolder ? currentFolder.name : "Pastas"}
                  </h2>
                </div>
              </div>
            )}

            {/* Folders Grid */}
            {currentLevelFolders.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-12">
                {currentLevelFolders.map((folder) => (
                  <Link
                    key={folder.id}
                    href={`/colecoes/${slug}?folderId=${folder.id}`}
                    className="group block"
                  >
                    <div className="bg-card/50 border border-white/5 rounded-xl p-6 flex flex-col items-center justify-center gap-4 transition-all hover:bg-card hover:border-primary/50 hover:shadow-lg hover:-translate-y-1">
                      <Folder className="h-12 w-12 text-blue-500 fill-blue-500/20 group-hover:scale-110 transition-transform" />
                      <div className="text-center w-full">
                        <p
                          className="font-medium truncate w-full px-2"
                          title={folder.name}
                        >
                          {folder.name}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {folder.count || 0} itens
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Photos Grid */}
            {currentLevelPhotos.length === 0 &&
            currentLevelFolders.length === 0 ? (
              <div className="text-center py-24 border-2 border-dashed border-white/5 rounded-xl bg-secondary/5">
                <p className="text-muted-foreground">
                  Nenhuma foto encontrada nesta pasta.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {currentLevelPhotos.map((photo, index) => (
                  <PhotoCard
                    key={photo.id}
                    photo={photo}
                    priority={index < 4}
                    contextList={currentLevelPhotos}
                    variant="centered-hover"
                  />
                ))}
              </div>
            )}
          </CollectionSearchClient>
        </PageContainer>
      </div>

      {/* 4. FEATURED COLLECTIONS (Figma Node 35:73) */}
      <div className="bg-black/20 pt-10">
        <FeaturedCollections
          collections={relatedCollections}
          title="Outras Coleções"
          subtitle="Explore mais trabalhos incríveis"
        />
      </div>
    </div>
  );
}

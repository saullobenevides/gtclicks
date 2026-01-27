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
      title: "Coleção não encontrada",
      description: "A coleção que você procura não está disponível.",
    };
  }

  return {
    title: `${collection.title} por ${collection.photographer}`,
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
    (f) => f.parentId === (folderId || null),
  );

  const currentLevelPhotos = (collection.photos || []).filter(
    (p) => p.folderId === (folderId || null),
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
            initialDisplayPhotos={currentLevelPhotos}
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
                      <Folder className="h-12 w-12 text-primary fill-primary/10 group-hover:scale-110 transition-transform" />
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

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: collection.title,
            description:
              collection.description ||
              `Coleção de fotos por ${collection.photographer?.name || "GTClicks"}`,
            image: collection.photos?.[0]?.previewUrl
              ? [collection.photos[0].previewUrl]
              : [],
            brand: {
              "@type": "Brand",
              name: "GTClicks",
            },
            offers: {
              "@type": "AggregateOffer",
              priceCurrency: "BRL",
              lowPrice: "15.00", // Generic floor price or dynamic if available
              highPrice: "150.00",
              offerCount: collection.photos?.length || 0,
              availability: "https://schema.org/InStock",
            },
            merchant: {
              "@type": "Organization",
              name: collection.photographer?.name || "GTClicks",
            },
          }),
          // Event Schema for Local SEO
          ...(collection.local || collection.cidade
            ? {
                "@context": "https://schema.org",
                "@type": "Event",
                name: collection.title,
                startDate: collection.dataInicio || collection.createdAt,
                endDate: collection.dataFim || collection.createdAt, // Fallback if single day
                eventStatus: "https://schema.org/EventScheduled",
                eventAttendanceMode:
                  "https://schema.org/OfflineEventAttendanceMode",
                location: {
                  "@type": "Place",
                  name: collection.local || "Local do Evento",
                  address: {
                    "@type": "PostalAddress",
                    addressLocality: collection.cidade || "Brasil",
                    addressRegion: collection.estado || "",
                    addressCountry: "BR",
                  },
                },
                image: collection.photos?.[0]?.previewUrl
                  ? [collection.photos[0].previewUrl]
                  : [],
                description: collection.description || collection.title,
                organizer: {
                  "@type": "Person",
                  name: collection.photographer?.name,
                  url: `https://gtclicks.com.br/fotografo/${collection.photographer?.username}`,
                },
              }
            : {}),
        }}
      />
    </div>
  );
}

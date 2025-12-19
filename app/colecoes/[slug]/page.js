import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";
import { getCollectionBySlug } from "@/lib/data/marketplace";
import { Button } from "@/components/ui/button";
import ImageWithFallback from "@/components/ImageWithFallback";
import PhotoCard from "@/components/PhotoCard";
import { Folder, ArrowLeft, Share2 } from "lucide-react";
import ShareButton from "@/components/ShareButton";
import ViewTracker from "@/components/analytics/ViewTracker";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CollectionSearchClient from "@/components/CollectionSearchClient";

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
    description: collection.description || `Confira a coleção ${collection.title} no GTClicks.`,
    openGraph: {
      title: collection.title,
      description: collection.description,
      images: collection.photos?.[0]?.previewUrl ? [collection.photos[0].previewUrl] : [],
    },
  };
}

export default async function CollectionDetail({ params, searchParams }) {
  const { slug } = await params;
  const { folderId } = await searchParams;
  const collection = await getCollectionBySlug(slug);

  if (!collection) {
    notFound();
  }

  // Filter content based on current folder level
  const currentLevelFolders = (collection.folders || []).filter(
    (f) => f.parentId === (folderId || null)
  );

  const currentLevelPhotos = (collection.photos || []).filter(
    (p) => p.folderId === (folderId || null)
  );

  const currentFolder = folderId 
    ? (collection.folders || []).find(f => f.id === folderId)
    : null;

  return (
    <section className="py-16">
      <ViewTracker entityId={collection.id} type="colecao" />
      <div className="container-wide">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
              <Badge>Coleção</Badge>
              <ShareButton 
                title={collection.title} 
                text={`Veja a coleção ${collection.title} no GTClicks`} 
                variant="ghost" 
                size="icon" 
                className="hover:bg-muted"
              />
          </div>
          <h1 className="text-4xl xs:text-5xl font-bold my-4 leading-tight">{collection.title}</h1>
          <p className="text-xl text-body">{collection.description}</p>
          <p className="text-body mb-4">
            por <strong>{collection.photographer}</strong>
          </p>
          {Number(collection.precoFoto) > 0 && (
            <div className="flex items-center justify-center gap-2 text-2xl font-bold text-primary mb-8">
                <span className="text-lg text-muted-foreground">Preço por foto:</span>
                <span>R$ {Number(collection.precoFoto).toFixed(2).replace('.', ',')}</span>
            </div>
          )}
        </div>

        <CollectionSearchClient allPhotos={collection.photos || []}>
            {/* Folder Navigation Header */}
            {(folderId || currentLevelFolders.length > 0) && (
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        {folderId && (
                           <Button variant="ghost" asChild>
                             <Link href={`/colecoes/${slug}${currentFolder?.parentId ? `?folderId=${currentFolder.parentId}` : ''}`}>
                               <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                             </Link>
                           </Button>
                        )}
                        <h2 className="text-2xl font-bold">
                            {currentFolder ? currentFolder.name : "Galeria"}
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
                            <div className="bg-card border rounded-lg p-6 flex flex-col items-center justify-center gap-4 transition-all hover:border-primary hover:shadow-lg">
                               <Folder className="h-12 w-12 text-blue-500 fill-blue-100 group-hover:scale-110 transition-transform" />
                               <div className="text-center">
                                   <p className="font-medium truncate max-w-full px-2">{folder.name}</p>
                                   <span className="text-xs text-muted-foreground">{folder.count || 0} fotos</span>
                               </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Photos Grid */}
            {currentLevelPhotos.length === 0 && currentLevelFolders.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg opacity-50">
                    <p>Nenhuma foto ou pasta encontrada aqui.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {currentLevelPhotos.map((photo, index) => (
                    <PhotoCard key={photo.id} photo={photo} priority={index < 4} />
                  ))}
                </div>
            )}
        </CollectionSearchClient>

        <div className="bg-card border rounded-md p-8 mt-16 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold mb-4">Como funciona?</h3>
          <ol className="list-decimal list-inside space-y-2 text-body text-lg">
            <li>Escolha seus cliques favoritos e adicione ao carrinho.</li>
            <li>Finalize a compra com segurança (PIX ou Cartão).</li>
            <li>Baixe seus arquivos originais em alta resolução <strong>imediatamente</strong>.</li>
          </ol>
          <div className="flex gap-4 mt-8">
            <Button asChild>
              <Link href="/busca">
                Procurar mais coleções
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/carrinho">
                Ver carrinho
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

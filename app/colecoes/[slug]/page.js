import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";
import { getCollectionBySlug } from "@/lib/data/marketplace";
import { Button } from "@/components/ui/button";
import ImageWithFallback from "@/components/shared/ImageWithFallback";
import PhotoCard from "@/features/collections/components/PhotoCard";
import { Folder, ArrowLeft, Share2, InfoIcon, Calendar } from "lucide-react";
import ShareButton from "@/components/ShareButton";
import ViewTracker from "@/components/analytics/ViewTracker";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CollectionSearchClient from "@/features/collections/components/CollectionSearchClient";
import { formatDateLong } from "@/lib/utils/formatters";


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
    // --- Start of New Layout Implementation ---

      <div className="min-h-screen bg-background pb-20">
        <ViewTracker entityId={collection.id} type="colecao" />
        
        {/* HERO SECTION */}
        <div className="relative min-h-[60vh] w-full overflow-hidden flex flex-col">
            {/* Background Image with Parallax-like fixity or just cover */}
            <div className="absolute inset-0">
               {collection.capaUrl ? (
                  <ImageWithFallback 
                    src={collection.capaUrl} 
                    alt={collection.title} 
                    className="h-full w-full object-cover"
                    priority={true}
                  />
               ) : (

                  <div className="h-full w-full bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-background" />
               )}
               {/* Dark Overlay Gradient */}
               <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-background" />
            </div>
  
            {/* Hero Content */}
            <div className="relative flex-1 container-wide flex flex-col items-center justify-center text-center z-10 pt-32 pb-32">
               <div className="animate-fade-in-up space-y-6 max-w-4xl mx-auto px-4">
                   <Badge className="bg-white/10 text-white hover:bg-white/20 border-white/20 backdrop-blur-md px-4 py-1.5 text-sm uppercase tracking-wider">
                      {collection.categoria || "Coleção Exclusiva"}
                   </Badge>
                   
                   <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight drop-shadow-sm">
                     {collection.title}
                   </h1>
                   
                   {collection.description && (
                      <p className="text-base md:text-lg text-gray-200/80 max-w-2xl mx-auto leading-relaxed drop-shadow-sm">
                        {collection.description}
                      </p>
                   )}
  
                   {/* Metadata Row */}
                   <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-white/80 pt-2">
                       {collection.photographerUsername ? (
                           <Link 
                                href={`/fotografo/${collection.photographerUsername}`}
                                className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors"
                           >
                                <Avatar className="h-6 w-6 border border-white/20">
                                    <AvatarImage src={collection.capaUrl} className="object-cover" /> 
                                    <AvatarFallback>FT</AvatarFallback>
                                </Avatar>
                                <span>{collection.photographer}</span>
                           </Link>
                       ) : (
                           <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
                                <Avatar className="h-6 w-6 border border-white/20">
                                    <AvatarImage src={collection.capaUrl} className="object-cover" /> 
                                    <AvatarFallback>FT</AvatarFallback>
                                </Avatar>
                                <span>{collection.photographer}</span>
                           </div>
                       )}
                      
                        <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
                           <Calendar className="w-4 h-4" />
                           <span>
                             {formatDateLong(collection.createdAt)}
                           </span>
                       </div>
  
                       <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
                          <Folder className="w-4 h-4" />
                          <span>{collection.photos?.length || 0} fotos</span>
                      </div>
                   </div>
               </div>
            </div>
        </div>
  
        {/* MAIN CONTENT CONTAINER */}
        <div className="container-wide -mt-20 relative z-20 px-4">
            <div className="bg-card/95 backdrop-blur-lg border border-border/50 shadow-2xl rounded-2xl p-6 md:p-10 min-h-[500px]">
                
                {/* Header Actions (Price & Share) */}
                 <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 pb-8 border-b border-border/50">
                     <div className="flex items-center gap-4">
                         <ShareButton 
                              title={collection.title} 
                              text={`Veja a coleção ${collection.title} no GTClicks`} 
                              variant="outline"
                              size="lg"
                              className="border-primary/20 hover:bg-primary/10 hover:text-primary transition-all"
                          />
                     </div>
  
                     {Number(collection.precoFoto) > 0 && (
                          <div className="flex flex-col md:flex-row items-center gap-3 bg-secondary/30 px-6 py-4 rounded-xl border border-white/5">
                              <span className="text-sm uppercase tracking-wide text-muted-foreground font-semibold">Valor Unitário</span>
                              <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold text-primary">
                                    R$ {Number(collection.precoFoto).toFixed(2).replace('.', ',')}
                                </span>
                              </div>
                          </div>
                      )}
                 </div>
  
                <CollectionSearchClient allPhotos={collection.photos || []} collectionId={collection.id}>
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
                        <div className="text-center py-24 border-2 border-dashed border-muted-foreground/20 rounded-xl bg-secondary/5">
                            <p className="text-muted-foreground">Nenhuma foto encontrada nesta pasta.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                          {currentLevelPhotos.map((photo, index) => (
                            <PhotoCard key={photo.id} photo={photo} priority={index < 4} />
                          ))}
                        </div>
                    )}
                </CollectionSearchClient>
            </div>
            
             <div className="bg-card/50 border border-white/5 rounded-2xl p-8 mt-12 max-w-4xl mx-auto backdrop-blur-sm">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <InfoIcon className="w-5 h-5 text-primary" />
                Como comprar suas fotos?
              </h3>
              <ol className="relative border-l border-primary/20 ml-2 space-y-8">
                <StepItem number="1" title="Selecione" text="Navegue pela galeria e clique nas fotos que você gostou." />
                <StepItem number="2" title="Adicione" text="Coloque no carrinho as melhores opções." />
                <StepItem number="3" title="Receba" text="Após o pagamento (PIX/Cartão), o download original é liberado na hora." />
              </ol>
              
              <div className="flex gap-4 mt-8 pt-4 ml-8">
                <Button asChild variant="outline" className="border-primary/20 hover:bg-primary/10">
                  <Link href="/carrinho">
                    Ver meu carrinho
                  </Link>
                </Button>
              </div>
            </div>
        </div>
      </div>

    );
}

function StepItem({ number, title, text }) {
  return (
    <li className="ml-6">
      <div className="absolute -left-3 mt-1.5 h-6 w-6 flex items-center justify-center rounded-full bg-secondary border border-primary text-xs font-bold text-primary">
        {number}
      </div>
      <div>
        <h4 className="font-semibold text-white">{title}</h4>
        <p className="text-muted-foreground">{text}</p>
      </div>
    </li>
  );
}

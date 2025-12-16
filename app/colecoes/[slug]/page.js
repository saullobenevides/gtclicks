import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";
import { getCollectionBySlug } from "@/lib/data/marketplace";
import { Button } from "@/components/ui/button";
import ImageWithFallback from "@/components/ImageWithFallback";
import { Folder, ArrowLeft } from "lucide-react";

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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge>Coleção</Badge>
          <h1 className="text-5xl font-bold my-4">{collection.title}</h1>
          <p className="text-xl text-body">{collection.description}</p>
          <p className="text-body">
            por <strong>{collection.photographer}</strong>
          </p>
        </div>

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
              {currentLevelPhotos.map((photo) => (
                <Link 
                  key={photo.id} 
                  href={`/foto/${photo.id}`} 
                  className="group relative aspect-[4/5] overflow-hidden rounded-xl bg-muted transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10"
                >
                  <ImageWithFallback
                    src={photo.previewUrl}
                    alt={photo.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="absolute bottom-0 left-0 w-full p-4 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      <h3 className="font-bold text-white line-clamp-1">{photo.title}</h3>
                      <span className="text-xs text-gray-300">ID #{photo.id}</span>
                  </div>
                </Link>
              ))}
            </div>
        )}

        <div className="bg-card border rounded-md p-8 mt-16 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold mb-4">Como usar esta coleção</h3>
          <p className="text-body">
            Adicione as fotos que quiser ao carrinho, escolha a licença adequada e receba
            o download imediatamente após o pagamento. Precisa de ajuda para aplicar as
            imagens no seu projeto? Entre em contato com nosso time e receba sugestões de
            combinações, cores e formatos.
          </p>
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

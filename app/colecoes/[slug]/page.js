import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";
import { getCollectionBySlug } from "@/lib/data/marketplace";
import { Button } from "@/components/ui/button";
import ImageWithFallback from "@/components/ImageWithFallback";
import PhotoCard from "@/components/PhotoCard";
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
      <div className="container-wide">
        <div className="text-center mb-16">
          <Badge>Coleção</Badge>
          <h1 className="text-4xl xs:text-5xl font-bold my-4 leading-tight">{collection.title}</h1>
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
                <PhotoCard key={photo.id} photo={photo} />
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

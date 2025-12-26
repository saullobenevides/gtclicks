'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import ImageWithFallback from '@/components/ImageWithFallback';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart } from '@/features/cart/context/CartContext'; // Assuming CartContext provides useCart

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import FaceSearchModal from '@/components/FaceSearchModal';

export default function CollectionDetailClient({ collection }) {
  const { addToCart } = useCart();
  const [searchQuery, setSearchQuery] = useState('');

  const groupedPhotos = useMemo(() => {
    const groups = {};
    const query = searchQuery.toLowerCase().trim();

    collection.photos.forEach(photo => {
      // Filter logic
      if (query) {
         const matchTitle = photo.title && photo.title.toLowerCase().includes(query);
         const matchTags = photo.tags && Array.isArray(photo.tags) && photo.tags.some(t => t.toLowerCase().includes(query));
         // If we had a proper "number" field we would check it too, often title contains number
         if (!matchTitle && !matchTags) return; 
      }

      const folderName = photo.folder || 'Raiz';
      if (!groups[folderName]) {
        groups[folderName] = [];
      }
      groups[folderName].push(photo);
    });
    return groups;
  }, [collection.photos, searchQuery]);

  const folderNames = Object.keys(groupedPhotos).sort();
  const defaultFolder = folderNames.length > 0 ? folderNames[0] : 'Raiz';
  
  // Update current folder if it disappears due to filter
  // However, calling setState during render is bad. 
  // Better to handle it in Effect or derived state.
  // Actually, ShadCN Tabs handles missing values gracefully usually, but let's be safe.
  const effectiveCurrentFolder = folderNames.includes(currentFolder) ? currentFolder : (folderNames[0] || '');
  const [activeTab, setActiveTab] = useState(defaultFolder);

  // Sync state when filter changes available folders
  useMemo(() => {
      if (!folderNames.includes(activeTab) && folderNames.length > 0) {
          setActiveTab(folderNames[0]);
      }
  }, [folderNames, activeTab]);


  const handleAddToCart = (photoId) => {
    const photo = collection.photos.find(p => p.id === photoId);
    
    if (photo) {
      addToCart({
        fotoId: photo.id,
        titulo: photo.title,
        previewUrl: photo.previewUrl,
        preco: collection.precoFoto || 0,
        licenca: 'Uso Padrão',
      });
      alert(`"${photo.title}" adicionada ao carrinho!`);
    }
  };

  return (
    <section className="py-16 container-wide">
      <div className="text-center mb-16">
        <Badge>Coleção</Badge>
        <h1 className="text-5xl font-bold my-4 text-white">{collection.title}</h1>
        <p className="text-xl text-gray-400">{collection.description}</p>
        <p className="text-gray-400">
          por <strong>{collection.photographer}</strong>
        </p>
      </div>

      <div className="max-w-md mx-auto mb-8 relative flex gap-2">
        <div className="relative flex-1">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
             <Input 
               placeholder="Buscar nesta coleção (Ex: número 123, largada, pódio...)" 
               className="pl-9 bg-zinc-900 border-zinc-800"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
        </div>
        <FaceSearchModal collectionId={collection.id} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {folderNames.length > 0 ? (
          <>
            {folderNames.length > 1 && (
              <div className="mb-8 flex justify-center">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6 h-auto bg-zinc-900 border-zinc-800">
                  {folderNames.map(folder => (
                    <TabsTrigger key={folder} value={folder} className="py-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-white">
                      {folder} ({groupedPhotos[folder].length})
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            )}

            {folderNames.map(folder => (
              <TabsContent key={folder} value={folder}>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-white mb-6">{folder === 'Raiz' ? 'Fotos na Raiz da Coleção' : `Pasta: ${folder}`}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {groupedPhotos[folder]?.map(photo => (
                      <Card key={photo.id} className="group relative overflow-hidden rounded-2xl border-0 bg-gray-900 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10">
                        <Link href={`/foto/${photo.id}`}>
                          <CardContent className="aspect-[4/3] relative p-0">
                            <ImageWithFallback
                              src={photo.previewUrl}
                              alt={photo.title}
                              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            {/* Make number matching obvious if searching */}
                            {searchQuery && photo.title.toLowerCase().includes(searchQuery.toLowerCase()) && (
                                <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded font-bold">
                                    Match: {photo.title}
                                </div>
                            )}
                          </CardContent>
                        </Link>
                        <div className="px-4 pt-4">
                          <h3 className="font-bold text-white text-base truncate" title={photo.title}>{photo.title}</h3>
                        </div>
                        <CardFooter className="flex flex-col gap-3 p-4 pt-0">
                          <Button
                            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold"
                            onClick={() => handleAddToCart(photo.id)}
                          >
                            Adicionar ao Carrinho (R$ {collection.precoFoto?.toFixed(2)})
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
            ))}
          </>
        ) : (
             <div className="text-center py-20 bg-muted/10 rounded-lg">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-medium mb-2">Nenhuma foto encontrada</h3>
                <p className="text-muted-foreground">Tente buscar por outro termo ou número.</p>
             </div>
        )}
      </Tabs>

      <div className="bg-card border rounded-md p-8 mt-16 max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold mb-4 text-white">Como usar esta coleção</h3>
        <p className="text-gray-400">
          Adicione as fotos que quiser ao carrinho, escolha a licença adequada e receba
          o download imediatamente após o pagamento. Precisa de ajuda para aplicar as
          imagens no seu projeto? Entre em contato com nosso time e receba sugestões de
          combinações, cores e formatos.
        </p>
        <div className="flex gap-4 mt-8">
          <Button asChild>
            <Link href="/busca">
              Procurar mais fotos
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/carrinho">
              Ver carrinho
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

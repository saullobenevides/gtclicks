'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import ImageWithFallback from '@/components/ImageWithFallback';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart } from '@/components/CartContext'; // Assuming CartContext provides useCart

export default function CollectionDetailClient({ collection }) {
  const { addToCart } = useCart();

  const groupedPhotos = useMemo(() => {
    const groups = {};
    collection.photos.forEach(photo => {
      const folderName = photo.folder || 'Raiz';
      if (!groups[folderName]) {
        groups[folderName] = [];
      }
      groups[folderName].push(photo);
    });
    return groups;
  }, [collection.photos]);

  const folderNames = Object.keys(groupedPhotos).sort();
  const defaultFolder = folderNames.length > 0 ? folderNames[0] : 'Raiz';
  const [currentFolder, setCurrentFolder] = useState(defaultFolder);

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

      <Tabs value={currentFolder} onValueChange={setCurrentFolder} className="w-full">
        {folderNames.length > 1 && (
          <div className="mb-8 flex justify-center">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6 h-auto">
              {folderNames.map(folder => (
                <TabsTrigger key={folder} value={folder} className="py-2 text-sm">
                  {folder}
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
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        
                        <div className="absolute bottom-0 left-0 w-full p-6 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                          <h3 className="font-bold text-white text-lg mb-1">{photo.title}</h3>
                          <p className="text-sm text-gray-300">{photo.description}</p>
                        </div>
                      </CardContent>
                    </Link>
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

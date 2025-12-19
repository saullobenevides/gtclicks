import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ImageWithFallback from '@/components/ImageWithFallback';
import { searchCollections } from '@/lib/data/marketplace';
import { CATEGORIES } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import SearchFilters from '@/components/SearchFilters';

export default async function SearchPage(props) {
  const searchParams = await props.searchParams;
  const rawFilters = {
    q: searchParams?.q ?? '',
    categoria: searchParams?.categoria ?? '',
  };

  const filters = Object.entries(rawFilters).reduce((acc, [key, value]) => {
    acc[key] = value === 'all' ? '' : value;
    return acc;
  }, {});

  const results = await searchCollections(filters);

  return (
    <div className="container-wide py-24">
      <div className="mb-16 flex flex-col items-center text-center">
        <Badge variant="outline" className="mb-4 border-primary/50 text-primary bg-primary/10 px-4 py-1">
          Explore
        </Badge>
        <h1 className="text-5xl font-black tracking-tighter text-white sm:text-6xl">
          Encontre a coleção <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-600">perfeita</span>
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-gray-400">
          Explore nosso acervo de coleções exclusivas. Use os filtros para refinar
          sua busca e encontrar exatamente o que você precisa.
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[300px_1fr]">
        <SearchFilters filters={rawFilters} />

        <main>
          {results.length === 0 ? (
            <Card className="col-span-full py-24 px-8 text-center glass-panel border-dashed border-white/10 bg-transparent">
              <CardHeader>
                <CardTitle className="text-2xl text-white">Nenhum evento encontrado</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-lg mb-6">
                  Tente buscar pela <strong>data do jogo</strong>, nome do time ou local do evento.
                </p>
                <Button asChild variant="outline">
                    <Link href="/busca">Ver todos os eventos</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((collection, index) => {
                 const isUrl = collection.cover?.startsWith("http");
                 const isGradient = collection.cover?.startsWith("linear-gradient");
                 
                 const backgroundStyle = isUrl
                    ? { backgroundImage: `url(${collection.cover})` }
                    : isGradient
                    ? { backgroundImage: collection.cover }
                    : { backgroundColor: collection.cover };
                
                return (
                  <Link
                    key={collection.id ?? index}
                    href={`/colecoes/${collection.slug}`}
                    className="group bg-card border rounded-lg overflow-hidden transition cursor-pointer hover:-translate-y-1 hover:shadow-lg h-[400px] block"
                    style={{ ...backgroundStyle, backgroundSize: 'cover', backgroundPosition: 'center' }}
                  >
                     <div className="p-6 bg-black/50 h-full flex flex-col justify-end">
                      <h3 className="text-xl font-bold mb-2 text-white">{collection.name}</h3>
                      <p className="text-white/80 text-sm mb-4 line-clamp-2">{collection.description}</p>
                      <div className="flex justify-between text-xs text-white/70">
                        <span>{collection.totalPhotos || 0} fotos</span>
                        <span>Por {collection.photographerName || 'GT Clicks'}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

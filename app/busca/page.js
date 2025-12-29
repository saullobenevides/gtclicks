import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { searchCollections } from '@/lib/data/marketplace';
import { CollectionCard } from '@/components/shared/cards';

import SearchFilters from '@/features/collections/components/SearchFilters';

// Revalidate every 10 minutes
export const revalidate = 600;

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

        <div className="min-w-0">
          {results.length === 0 ? (
            <div className="col-span-full py-24 px-8 text-center glass-panel border-dashed border-white/10 bg-transparent rounded-xl">
              <h2 className="text-2xl font-bold text-white mb-4">Nenhum evento encontrado</h2>
              <p className="text-gray-400 text-lg mb-6">
                Tente buscar pela <strong>data do jogo</strong>, nome do time ou local do evento.
              </p>
              <Button asChild variant="outline">
                <Link href="/busca">Ver todos os eventos</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((collection, index) => (
                <CollectionCard
                  key={collection.id ?? index}
                  collection={collection}
                  variant="default"
                  showDescription={false}
                  showDate={false}
                  showPrice={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

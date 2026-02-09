import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { searchCollections } from "@/lib/data/marketplace";
import type { SearchFilters } from "@/lib/data/marketplace";
import { CollectionCard } from "@/components/shared/cards";
import EmptyState from "@/components/shared/states/EmptyState";
import AppPagination from "@/components/shared/AppPagination";

type SearchParams = Record<string, string | string[] | undefined>;

function toFlatParams(p: SearchParams): Record<string, string> {
  return Object.fromEntries(
    Object.entries(p)
      .filter(([, v]) => v != null && v !== "")
      .map(([k, v]) => [k, Array.isArray(v) ? v[0] ?? "" : String(v)])
  );
}

interface BuscaResultsProps {
  filters: SearchFilters;
  searchParams: SearchParams;
}

export default async function BuscaResults({
  filters,
  searchParams,
}: BuscaResultsProps) {
  const flatParams = toFlatParams(searchParams);
  const { data: results, metadata } = await searchCollections(filters);

  return (
    <div className="space-y-8">
      {results.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {metadata.total}{" "}
          {metadata.total === 1 ? "coleção encontrada" : "coleções encontradas"}
        </p>
      )}

      <div className="min-w-0">
        {results.length === 0 ? (
          <div className="col-span-full py-16 sm:py-24 px-4 sm:px-8 glass-panel border-dashed border-white/10 bg-transparent rounded-xl">
            <EmptyState
              icon={Search}
              title="Nenhuma coleção encontrada"
              description="Tente buscar por local ou categoria do evento."
              variant="default"
            />
            <div className="flex flex-wrap gap-3 justify-center mt-6">
              <Button
                asChild
                variant="outline"
                className="min-h-[44px] touch-manipulation"
              >
                <Link href="/busca">Limpar filtros</Link>
              </Button>
              <Button asChild className="min-h-[44px] touch-manipulation">
                <Link href="/categorias">Explorar categorias</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
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

            <AppPagination
              currentPage={metadata.page}
              totalPages={metadata.totalPages}
              baseUrl="/busca"
              searchParams={flatParams}
            />
          </div>
        )}
      </div>
    </div>
  );
}

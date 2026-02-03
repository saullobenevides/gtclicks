import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { searchCollections, getDistinctCities } from "@/lib/data/marketplace";
import { CollectionCard } from "@/components/shared/cards";
import EmptyState from "@/components/shared/states/EmptyState";
import SearchFilters from "@/features/collections/components/SearchFilters";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import SelfieSearch from "@/components/search/SelfieSearch"; // TODO: Rekognition desabilitado
import AppPagination from "@/components/shared/AppPagination";

import {
  PageSection,
  SectionHeader,
  PageBreadcrumbs,
} from "@/components/shared/layout";

// Revalidate every 10 minutes
export const revalidate = 600;

export default async function SearchPage(props) {
  const searchParams = await props.searchParams;
  const rawFilters = {
    q: searchParams?.q ?? "",
    categoria: searchParams?.categoria ?? "",
    cidade: searchParams?.cidade ?? "",
    date: searchParams?.date ?? "",
    page: searchParams?.page ? parseInt(searchParams.page) : 1,
  };

  const filters = Object.entries(rawFilters).reduce((acc, [key, value]) => {
    acc[key] = value === "all" ? "" : value;
    return acc;
  }, {});

  const [cities, { data: results, metadata }] = await Promise.all([
    getDistinctCities(),
    searchCollections(filters),
  ]);

  return (
    <PageSection variant="default" containerWide>
      <PageBreadcrumbs className="mb-6" />
      <SectionHeader
        isLanding
        badge="Explorar"
        title={
          <>
            Encontre sua <span className="text-primary">performance</span>
          </>
        }
        description="Busque por eventos, categoria, cidade ou data para encontrar suas fotos."
      />

      <div className="space-y-16">
        {/* TODO: Tab Selfie oculta até Rekognition estar configurado
        <Tabs defaultValue="colecoes">
          <TabsList>...</TabsList>
        */}

        <div className="mt-0 animate-in fade-in duration-500">
          <div className="space-y-8">
            <SearchFilters filters={rawFilters} cities={cities} />

            {results.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {metadata.total}{" "}
                {metadata.total === 1
                  ? "coleção encontrada"
                  : "coleções encontradas"}
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
                    searchParams={searchParams}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageSection>
  );
}

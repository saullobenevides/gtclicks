import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { searchCollections } from "@/lib/data/marketplace";
import { CollectionCard } from "@/components/shared/cards";

import SearchFilters from "@/features/collections/components/SearchFilters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SelfieSearch from "@/components/search/SelfieSearch";
import { Camera, Grid } from "lucide-react";
import AppPagination from "@/components/shared/AppPagination";

import { PageSection, SectionHeader } from "@/components/shared/layout";

// Revalidate every 10 minutes
export const revalidate = 600;

export default async function SearchPage(props) {
  const searchParams = await props.searchParams;
  const rawFilters = {
    q: searchParams?.q ?? "",
    categoria: searchParams?.categoria ?? "",
    page: searchParams?.page ? parseInt(searchParams.page) : 1,
  };

  const filters = Object.entries(rawFilters).reduce((acc, [key, value]) => {
    acc[key] = value === "all" ? "" : value;
    return acc;
  }, {});

  const { data: results, metadata } = await searchCollections(filters);

  return (
    <PageSection variant="default" containerWide>
      <SectionHeader
        isLanding
        badge="Explorar"
        title={
          <>
            Encontre sua <span className="text-primary">performance</span>
          </>
        }
        description="Busque por eventos ou use nossa IA para encontrar suas fotos instantaneamente através de uma selfie."
      />

      <Tabs defaultValue="colecoes" className="space-y-16">
        <div className="flex justify-center px-4">
          <TabsList className="bg-surface-subtle border border-border-subtle p-1 h-16 rounded-full w-full max-w-md md:w-auto flex">
            <TabsTrigger
              value="colecoes"
              className="flex-1 md:flex-none rounded-full px-4 md:px-10 h-14 border-2 border-transparent data-[state=active]:bg-surface-page data-[state=active]:border-primary data-[state=active]:text-white font-black uppercase tracking-widest text-[10px] md:text-xs gap-2 md:gap-3 transition-all"
            >
              <Grid className="h-4 w-4" />
              <span className="hidden sm:inline">Ver </span>Coleções
            </TabsTrigger>
            <TabsTrigger
              value="selfie"
              className="flex-1 md:flex-none rounded-full px-4 md:px-10 h-14 border-2 border-transparent data-[state=active]:bg-surface-page data-[state=active]:border-primary data-[state=active]:text-white font-black uppercase tracking-widest text-[10px] md:text-xs gap-2 md:gap-3 transition-all"
            >
              <Camera className="h-4 w-4" />
              <span className="hidden sm:inline">Busca por </span>Selfie
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="colecoes"
          className="mt-0 animate-in fade-in duration-500"
        >
          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[300px_1fr]">
            <SearchFilters filters={rawFilters} />

            <div className="min-w-0">
              {results.length === 0 ? (
                <div className="col-span-full py-24 px-8 text-center glass-panel border-dashed border-white/10 bg-transparent rounded-xl">
                  <h2 className="text-2xl font-bold text-white mb-4">
                    Nenhuma coleção encontrada
                  </h2>
                  <p className="text-gray-400 text-lg mb-6">
                    Tente buscar por local ou categoria do evento.
                  </p>
                  <Button asChild variant="outline">
                    <Link href="/busca">Ver tudo</Link>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-8">
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
        </TabsContent>

        <TabsContent
          value="selfie"
          className="mt-0 animate-in fade-in slide-in-from-top-4 duration-500"
        >
          <SelfieSearch />
        </TabsContent>
      </Tabs>
    </PageSection>
  );
}

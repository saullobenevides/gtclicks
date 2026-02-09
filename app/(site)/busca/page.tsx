import { Suspense } from "react";
import { getDistinctCities } from "@/lib/data/marketplace";
import SearchFilters from "@/features/collections/components/SearchFilters";
import BuscaResults from "./BuscaResults";
import BuscaResultsSkeleton from "./BuscaResultsSkeleton";

import {
  PageSection,
  SectionHeader,
  PageBreadcrumbs,
} from "@/components/shared/layout";

// Revalidate every 10 minutes
export const revalidate = 600;

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function SearchPage(props: SearchPageProps) {
  const searchParams = await props.searchParams;
  const getStr = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] ?? "" : v ?? "";
  const rawFilters = {
    q: getStr(searchParams?.q),
    categoria: getStr(searchParams?.categoria),
    cidade: getStr(searchParams?.cidade),
    date: getStr(searchParams?.date),
    page: searchParams?.page ? parseInt(String(searchParams.page)) : 1,
  };

  const filters = Object.entries(rawFilters).reduce((acc, [key, value]) => {
    acc[key] = value === "all" ? "" : value;
    return acc;
  }, {} as Record<string, string | number>);

  const cities = await getDistinctCities();

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
        <div className="mt-0 animate-in fade-in duration-500">
          <div className="space-y-8">
            <SearchFilters filters={rawFilters} cities={cities as string[]} />

            <Suspense fallback={<BuscaResultsSkeleton />}>
              <BuscaResults filters={filters} searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
      </div>
    </PageSection>
  );
}

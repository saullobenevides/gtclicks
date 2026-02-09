import { Suspense } from "react";
import {
  PageSection,
  SectionHeader,
  PageBreadcrumbs,
} from "@/components/shared/layout";
import { getDistinctPhotographerCities } from "@/lib/data/marketplace";
import PhotographerFilters from "@/features/photographer/components/PhotographerFilters";
import FotografosResults from "./FotografosResults";
import FotografosResultsSkeleton from "./FotografosResultsSkeleton";

export const metadata = {
  title: "Nossos Fotógrafos | GTClicks",
  description:
    "Conheça os fotógrafos profissionais que fazem parte da nossa comunidade.",
};

interface FotografosPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function FotografosPage(props: FotografosPageProps) {
  const searchParams = await props.searchParams;
  const getStr = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] ?? "" : v ?? "";
  const rawFilters = {
    q: getStr(searchParams?.q),
    categoria: getStr(searchParams?.categoria),
    cidade: getStr(searchParams?.cidade),
    page: searchParams?.page ? parseInt(String(searchParams.page)) : 1,
  };

  const filters = Object.entries(rawFilters).reduce((acc, [key, value]) => {
    acc[key] = value === "all" ? "" : value;
    return acc;
  }, {} as Record<string, string | number>);

  const cities = await getDistinctPhotographerCities();

  return (
    <PageSection variant="default" containerWide className="min-h-screen">
      <PageBreadcrumbs className="mb-6" />
      <SectionHeader
        isLanding
        badge="Nossa Comunidade"
        title="Profissionais do Click"
        description="Encontre os melhores fotógrafos e acompanhe suas coleções exclusivas."
      />

      <div className="mt-8 mb-12">
        <PhotographerFilters filters={rawFilters} cities={cities as string[]} />
      </div>

      <Suspense fallback={<FotografosResultsSkeleton />}>
        <FotografosResults filters={filters} searchParams={searchParams} />
      </Suspense>
    </PageSection>
  );
}

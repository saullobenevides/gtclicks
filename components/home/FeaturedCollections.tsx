import { CollectionCard } from "@/components/shared/cards";
import { PageSection, SectionHeader } from "@/components/shared/layout";

interface FeaturedCollectionsProps {
  collections?: Array<{ slug?: string; [key: string]: unknown }>;
  title?: string;
  subtitle?: string;
}

export default function FeaturedCollections({
  collections = [],
  title = "Coleções em Destaque",
  subtitle = "Séries autorais selecionadas para inspirar sua próxima criação",
}: FeaturedCollectionsProps) {
  if (!collections || collections.length === 0) return null;

  return (
    <PageSection variant="default" containerWide>
      <SectionHeader title={title} description={subtitle} size="default" />

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection, index) => (
          <CollectionCard
            key={collection.slug ?? index}
            collection={collection}
            variant="featured"
            showDescription
            showDate
          />
        ))}
      </div>
    </PageSection>
  );
}

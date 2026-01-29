import { CollectionCard } from "@/components/shared/cards";

export default function FeaturedCollections({
  collections = [],
  title = "Coleções em Destaque",
  subtitle = "Séries autorais selecionadas para inspirar sua próxima criação",
}) {
  if (!collections || collections.length === 0) return null;

  return (
    <section className="py-space-12">
      <div className="container-wide">
        <div className="mb-space-12 flex flex-col items-center text-center gap-space-3">
          <h2 className="heading-section font-display text-text-2xl sm:text-text-3xl md:text-text-4xl font-font-bold text-text-primary uppercase tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="max-w-2xl text-text-base text-text-secondary font-font-medium">
              {subtitle}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-space-4 sm:gap-space-8 sm:grid-cols-2 lg:grid-cols-3">
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
      </div>
    </section>
  );
}

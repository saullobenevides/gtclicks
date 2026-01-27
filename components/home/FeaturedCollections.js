import { CollectionCard } from "@/components/shared/cards";

export default function FeaturedCollections({
  collections = [],
  title = "Coleções em Destaque",
  subtitle = "Séries autorais selecionadas para inspirar sua próxima criação",
}) {
  if (!collections || collections.length === 0) return null;

  return (
    <section className="py-16">
      <div className="container-wide">
        <div className="mb-16 flex flex-col items-center text-center gap-3">
          <h2 className="heading-section font-display text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="max-w-2xl text-base text-gray-400 font-medium">
              {subtitle}
            </p>
          )}
        </div>

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
      </div>
    </section>
  );
}

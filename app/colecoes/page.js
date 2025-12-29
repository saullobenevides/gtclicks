import { Badge } from "@/components/ui/badge";
import { getCollections } from "@/lib/data/marketplace";
import { CollectionCard } from "@/components/shared/cards";
import { ResponsiveGrid } from "@/components/shared/layout";

// Revalidate every 30 minutes
export const revalidate = 1800;

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <div className="container-wide">
      <section className="py-16">
        <div className="text-center mb-16">
          <Badge>Coleções</Badge>
          <h1 className="text-5xl font-bold mb-4 text-heading">Séries Exclusivas</h1>
          <p className="text-xl text-body">
            Navegue por coleções completas com curadoria especial. Encontre a narrativa
            visual perfeita para sua marca ou projeto.
          </p>
        </div>

        <ResponsiveGrid cols={{ sm: 1, md: 2, lg: 3 }} gap={8}>
          {collections.map((collection, index) => (
            <CollectionCard
              key={collection.slug ?? index}
              collection={collection}
              variant="default"
              showDescription
            />
          ))}
        </ResponsiveGrid>
      </section>
    </div>
  );
}


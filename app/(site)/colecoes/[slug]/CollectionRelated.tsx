import { getRelatedCollections } from "@/lib/data/marketplace";
import FeaturedCollections from "@/components/home/FeaturedCollections";

interface CollectionRelatedProps {
  excludeId: string | null | undefined;
}

export default async function CollectionRelated({
  excludeId,
}: CollectionRelatedProps) {
  const relatedCollections = await getRelatedCollections(excludeId, 3);

  return (
    <div className="bg-black/20 pt-10">
      <FeaturedCollections
        collections={relatedCollections}
        title="Outras Coleções"
        subtitle="Explore mais trabalhos incríveis"
      />
    </div>
  );
}

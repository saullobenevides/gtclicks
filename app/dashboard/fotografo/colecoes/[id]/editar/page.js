import { notFound } from "next/navigation";
import { getCollectionByIdForEditSafe } from "@/lib/data/marketplace";
import CollectionEditor from "@/features/collections/components/CollectionEditor";

export default async function EditCollectionPage(props) {
  const params = await props.params;
  const { id } = params;

  const collection = await getCollectionByIdForEditSafe(id);

  if (!collection) {
    notFound();
  }

  return (
    <div className="w-full">
      <CollectionEditor collection={collection} />
    </div>
  );
}

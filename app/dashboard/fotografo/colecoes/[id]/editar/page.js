import { notFound } from "next/navigation";
import { getCollectionByIdForEdit } from "@/lib/data/marketplace";
import CollectionEditor from "@/components/CollectionEditor";

export default async function EditCollectionPage(props) {
  const params = await props.params;
  const { id } = params;
  
  const collection = await getCollectionByIdForEdit(id);

  if (!collection) {
    notFound();
  }

  return <CollectionEditor collection={collection} />;
}

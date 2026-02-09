import { notFound } from "next/navigation";
import { getCollectionByIdForEditSafe } from "@/lib/data/marketplace";
import EditCollectionClient from "./EditCollectionClient";

interface EditCollectionPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCollectionPage(
  props: EditCollectionPageProps
) {
  const params = await props.params;
  const { id } = params;

  const collection = await getCollectionByIdForEditSafe(id);

  if (!collection) {
    notFound();
  }

  return <EditCollectionClient collection={collection} />;
}

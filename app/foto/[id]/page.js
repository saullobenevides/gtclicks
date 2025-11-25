import { notFound } from "next/navigation";
import { getPhotoById } from "@/lib/data/marketplace";
import PhotoDetailsClient from "./PhotoDetailsClient";

export default async function PhotoPage({ params }) {
  const { id } = await params;
  
  const photo = await getPhotoById(id);

  if (!photo) {
    notFound();
  }

  return <PhotoDetailsClient photo={photo} />;
}

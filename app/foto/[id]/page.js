import { notFound } from "next/navigation";
import { getPhotoById } from "@/lib/data/marketplace";
import PhotoDetailsClient from "./PhotoDetailsClient";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const photo = await getPhotoById(id);

  if (!photo) {
    return {
      title: "Foto não encontrada | GTClicks",
      description: "A foto que você procura não está disponível.",
    };
  }

  return {
    title: `${photo.titulo} por ${photo.fotografo.name} | GTClicks`,
    description: photo.descricao || `Confira esta foto incrível de ${photo.fotografo.name} no GTClicks.`,
    openGraph: {
      title: photo.titulo,
      description: photo.descricao,
      images: [photo.previewUrl],
    },
  };
}

export default async function PhotoPage({ params }) {
  const { id } = await params;
  
  const photo = await getPhotoById(id);

  if (!photo) {
    notFound();
  }

  return <PhotoDetailsClient photo={photo} />;
}

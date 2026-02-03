"use client";

import dynamic from "next/dynamic";

const CollectionEditor = dynamic(
  () => import("@/features/collections/components/CollectionEditor"),
  {
    ssr: false,
    loading: () => (
      <div className="flex w-full items-center justify-center p-12">
        <p className="text-muted-foreground">Carregando editor...</p>
      </div>
    ),
  }
);

export default function NewCollectionClient() {
  return (
    <div className="w-full">
      <CollectionEditor />
    </div>
  );
}

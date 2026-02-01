"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const CollectionEditor = dynamic(
  () => import("@/features/collections/components/CollectionEditor"),
  {
    ssr: false,
    loading: () => (
      <div
        className="w-full space-y-6"
        role="status"
        aria-label="Carregando editor"
      >
        <div className="space-y-2">
          <Skeleton className="h-10 w-64 bg-white/10" />
          <Skeleton className="h-4 w-48 bg-white/10" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14 w-24 shrink-0 bg-white/10" />
          ))}
        </div>
        <Skeleton className="h-64 w-full bg-white/10" />
      </div>
    ),
  }
);

export default function EditCollectionClient({ collection }) {
  return (
    <div className="w-full min-w-0">
      <CollectionEditor collection={collection} />
    </div>
  );
}

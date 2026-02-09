import { Skeleton } from "@/components/ui/skeleton";

export default function CollectionRelatedSkeleton() {
  return (
    <div className="bg-black/20 pt-10 pb-16">
      <div className="container-wide">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-4 w-64 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="aspect-[4/3] rounded-radius-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

import { Skeleton } from "@/components/ui/skeleton";

export default function FotografosResultsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="h-32 w-full rounded-t-radius-lg" />
          <div className="px-6 pb-6 space-y-3">
            <div className="flex justify-between -mt-12">
              <Skeleton className="h-24 w-24 rounded-full" />
              <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

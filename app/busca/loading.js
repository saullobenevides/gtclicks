import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container-wide py-12 md:py-24">
      {/* Search Header Skeleton */}
      <div className="mb-12 flex flex-col items-center text-center space-y-4">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-16 w-3/4 max-w-2xl" />
        <Skeleton className="h-4 w-1/2 max-w-md" />
      </div>

      {/* Tabs Skeleton */}
      <div className="flex justify-center mb-12">
        <Skeleton className="h-14 w-[400px] rounded-full" />
      </div>

      <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[300px_1fr]">
        {/* Sidebar Skeleton */}
        <div className="space-y-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>

        {/* Results Grid Skeleton */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="aspect-video w-full rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

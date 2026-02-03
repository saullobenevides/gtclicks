import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-0 pb-24 md:pb-0">
      {/* Hero Skeleton */}
      <div className="relative min-h-[85vh] flex flex-col items-center justify-center px-4 py-16">
        <Skeleton className="absolute inset-0 -z-10" />
        <div className="z-10 flex max-w-5xl flex-col items-center gap-8 text-center">
          <Skeleton className="h-16 w-[90%] max-w-2xl" />
          <Skeleton className="h-6 w-[80%] max-w-xl" />
          <div className="flex gap-4">
            <Skeleton className="h-12 w-40 rounded-lg" />
            <Skeleton className="h-12 w-40 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Featured Collections Skeleton */}
      <div className="container-wide py-12 md:py-16">
        <div className="mb-8 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="aspect-[4/3] w-full rounded-xl" />
          ))}
        </div>
      </div>

      {/* Photographers Skeleton */}
      <div className="container-wide py-12 md:py-16">
        <div className="mb-8 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square w-full rounded-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>

      {/* Recent Collections Skeleton */}
      <div className="container-wide py-12 md:py-16">
        <div className="mb-8 space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="aspect-[4/3] w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

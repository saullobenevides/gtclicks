import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container-wide py-12 md:py-20">
      <div className="mb-16 space-y-2 text-center">
        <Skeleton className="h-5 w-40 mx-auto rounded-full" />
        <Skeleton className="h-12 w-96 max-w-2xl mx-auto" />
        <Skeleton className="h-4 w-80 mx-auto" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="space-y-4 p-6 rounded-2xl border border-white/10"
          >
            <Skeleton className="h-12 w-12 rounded-xl" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>

      <div className="space-y-8">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

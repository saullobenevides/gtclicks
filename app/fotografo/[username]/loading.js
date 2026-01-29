import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen pb-20">
      {/* Header Skeleton */}
      <div className="bg-black/20 border-b border-white/10 pt-20 pb-12">
        <div className="container-wide flex flex-col md:flex-row items-end gap-6">
          <Skeleton className="h-32 w-32 md:h-40 md:w-40 rounded-full shrink-0" />
          <div className="flex-1 space-y-4 mb-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-[300px]" />
              <Skeleton className="h-6 w-12 rounded-full" />
            </div>
            <Skeleton className="h-4 w-[200px]" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="flex gap-3 mb-4">
            <Skeleton className="h-10 w-24 rounded-md" />
            <Skeleton className="h-10 w-10 rounded-md" />
          </div>
        </div>
      </div>

      <div className="container-wide py-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_300px]">
          <div className="space-y-12">
            <div className="space-y-4">
              <Skeleton className="h-8 w-32" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton
                    key={i}
                    className="aspect-video w-full rounded-2xl"
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="hidden lg:block">
            <Skeleton className="h-[300px] w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

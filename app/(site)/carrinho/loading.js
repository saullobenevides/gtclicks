import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container-wide px-4 py-12 sm:py-16 md:py-24">
      <div className="mb-12">
        <Skeleton className="h-10 w-[280px]" />
        <Skeleton className="h-4 w-[200px] mt-2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex gap-4 p-4 rounded-xl border border-white/10"
            >
              <Skeleton className="h-24 w-24 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-10 w-10 rounded-md shrink-0" />
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <Skeleton className="h-[200px] w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

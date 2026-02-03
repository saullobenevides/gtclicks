import { Skeleton } from "@/components/ui/skeleton";
import { PageSection } from "@/components/shared/layout";

export default function Loading() {
  return (
    <PageSection variant="default" containerWide className="min-h-screen">
      {/* Header */}
      <div className="mb-12 space-y-2 text-center">
        <Skeleton className="h-5 w-32 mx-auto rounded-full" />
        <Skeleton className="h-12 w-80 mx-auto" />
        <Skeleton className="h-4 w-96 max-w-xl mx-auto" />
      </div>

      {/* Filters */}
      <div className="mb-12 flex flex-col sm:flex-row gap-4">
        <Skeleton className="h-11 flex-1 rounded-lg" />
        <Skeleton className="h-11 w-[180px] rounded-lg" />
        <Skeleton className="h-11 w-[180px] rounded-lg" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-32 w-full rounded-t-xl" />
            <div className="px-6 pb-6 space-y-3">
              <div className="flex justify-between -mt-12">
                <Skeleton className="h-24 w-24 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </PageSection>
  );
}

import { Skeleton } from "@/components/ui/skeleton";
import { PageSection } from "@/components/shared/layout";

export default function Loading() {
  return (
    <PageSection variant="default" containerWide>
      {/* Header */}
      <div className="mb-12 space-y-2 text-center">
        <Skeleton className="h-5 w-28 mx-auto rounded-full" />
        <Skeleton className="h-12 w-72 mx-auto" />
        <Skeleton className="h-4 w-80 max-w-xl mx-auto" />
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-[4/3] w-full rounded-xl" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </PageSection>
  );
}

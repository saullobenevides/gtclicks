import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container-wide px-4 py-12 sm:py-16 md:py-24">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order summary */}
          <div className="lg:col-span-1 space-y-4">
            <Skeleton className="h-[300px] w-full rounded-xl" />
          </div>

          {/* Payment form */}
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-[400px] w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

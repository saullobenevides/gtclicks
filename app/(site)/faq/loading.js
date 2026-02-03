import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container-wide py-12 md:py-20">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12 space-y-2 text-center">
          <Skeleton className="h-5 w-20 mx-auto rounded-full" />
          <Skeleton className="h-12 w-64 mx-auto" />
          <Skeleton className="h-4 w-96 mx-auto" />
        </div>

        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-6 rounded-xl border border-white/10">
              <Skeleton className="h-5 w-3/4 mb-4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3 mt-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

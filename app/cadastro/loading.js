import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container-wide py-12 md:py-20">
      <div className="max-w-2xl mx-auto space-y-12">
        <div className="space-y-2 text-center">
          <Skeleton className="h-5 w-32 mx-auto rounded-full" />
          <Skeleton className="h-12 w-80 mx-auto" />
          <Skeleton className="h-4 w-96 mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="p-8 rounded-2xl border border-white/10 space-y-6"
            >
              <Skeleton className="h-16 w-16 rounded-xl" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

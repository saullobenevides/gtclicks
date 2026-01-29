import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container-wide py-12 md:py-20">
      <div className="mb-10 space-y-2">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-4 w-[350px]" />
      </div>

      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-card/40 border border-white/5 rounded-2xl p-6 space-y-6"
          >
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div className="space-y-3">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-8 w-[150px]" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-10 w-[120px]" />
                <Skeleton className="h-10 w-[120px]" />
              </div>
            </div>
            <div className="flex gap-4">
              {[1, 2, 3, 4].map((j) => (
                <Skeleton key={j} className="h-20 w-20 rounded-lg shrink-0" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

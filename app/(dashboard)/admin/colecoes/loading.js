import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6 p-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Skeleton className="h-8 w-[180px] bg-white/10" />
        <Skeleton className="h-10 w-[120px] bg-white/10" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="aspect-[4/3] w-full rounded-xl bg-white/5" />
            <Skeleton className="h-5 w-3/4 bg-white/10" />
            <Skeleton className="h-4 w-1/2 bg-white/5" />
          </div>
        ))}
      </div>
    </div>
  );
}

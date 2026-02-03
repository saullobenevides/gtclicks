import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6 p-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Skeleton className="h-8 w-[160px] bg-white/10" />
        <Skeleton className="h-10 w-[200px] bg-white/10" />
      </div>

      <div className="space-y-4">
        <Skeleton className="h-12 w-full rounded-lg bg-white/5" />
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg bg-white/5" />
        ))}
      </div>
    </div>
  );
}

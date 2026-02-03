import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6 p-0">
      <div className="space-y-2">
        <Skeleton className="h-8 w-[140px] bg-white/10" />
        <Skeleton className="h-4 w-[240px] bg-white/5" />
      </div>

      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl bg-white/5" />
        ))}
      </div>
    </div>
  );
}

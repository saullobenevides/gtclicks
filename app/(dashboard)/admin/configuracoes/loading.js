import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6 p-0">
      <div className="space-y-2">
        <Skeleton className="h-8 w-[180px] bg-white/10" />
        <Skeleton className="h-4 w-[280px] bg-white/5" />
      </div>

      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="space-y-4 p-6 rounded-xl border border-white/10"
          >
            <Skeleton className="h-5 w-1/3 bg-white/10" />
            <div className="space-y-3">
              <Skeleton className="h-11 w-full rounded-lg bg-white/5" />
              <Skeleton className="h-11 w-full rounded-lg bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

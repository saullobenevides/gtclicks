import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6 md:gap-8 p-0">
      <div className="space-y-2">
        <Skeleton className="h-8 w-[180px] bg-white/10" />
        <Skeleton className="h-4 w-[280px] bg-white/5" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton
            key={i}
            className="h-[100px] w-full rounded-xl bg-white/5"
          />
        ))}
      </div>

      <Skeleton className="h-[400px] w-full rounded-xl bg-white/5" />
    </div>
  );
}

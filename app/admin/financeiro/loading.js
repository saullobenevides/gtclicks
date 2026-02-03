import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6 p-0">
      <div className="space-y-2">
        <Skeleton className="h-8 w-[160px] bg-white/10" />
        <Skeleton className="h-4 w-[240px] bg-white/5" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton
            key={i}
            className="h-[100px] w-full rounded-xl bg-white/5"
          />
        ))}
      </div>

      <Skeleton className="h-[350px] w-full rounded-xl bg-white/5" />
    </div>
  );
}

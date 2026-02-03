import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6 md:gap-8 p-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-[250px] bg-white/10" />
          <Skeleton className="h-4 w-[200px] bg-white/5" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24 bg-white/10" />
          <Skeleton className="h-10 w-32 bg-white/10" />
        </div>
      </div>

      <div className="space-y-6">
        <Skeleton className="h-12 w-full rounded-lg bg-white/5" />
        <Skeleton className="h-[500px] w-full rounded-xl bg-white/5" />
      </div>
    </div>
  );
}

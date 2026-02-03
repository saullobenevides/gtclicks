import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6 p-0">
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full bg-white/10" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-[200px] bg-white/10" />
          <Skeleton className="h-4 w-[150px] bg-white/5" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-[200px] w-full rounded-xl bg-white/5" />
        <Skeleton className="h-[200px] w-full rounded-xl bg-white/5" />
      </div>

      <Skeleton className="h-[300px] w-full rounded-xl bg-white/5" />
    </div>
  );
}

import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6 md:gap-8 p-0">
      <div className="space-y-2">
        <Skeleton className="h-8 w-[140px] bg-white/10" />
        <Skeleton className="h-4 w-[320px] bg-white/5" />
      </div>

      <div className="space-y-6">
        <Skeleton className="h-[120px] w-full rounded-xl bg-white/5" />
        <Skeleton className="h-[500px] w-full rounded-xl bg-white/5" />
      </div>
    </div>
  );
}

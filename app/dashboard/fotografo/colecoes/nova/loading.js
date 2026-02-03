import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6 md:gap-8 p-0">
      <div className="space-y-2">
        <Skeleton className="h-8 w-[200px] bg-white/10" />
        <Skeleton className="h-4 w-[320px] bg-white/5" />
      </div>

      <div className="space-y-8">
        <Skeleton className="h-[400px] w-full rounded-xl bg-white/5" />
        <Skeleton className="h-12 w-40 rounded-lg bg-white/10" />
      </div>
    </div>
  );
}

import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-8 p-0 max-w-2xl mx-auto">
      <div className="space-y-2 text-center">
        <Skeleton className="h-5 w-32 mx-auto rounded-full" />
        <Skeleton className="h-10 w-64 mx-auto" />
        <Skeleton className="h-4 w-80 mx-auto" />
      </div>

      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24 bg-white/10" />
            <Skeleton className="h-11 w-full rounded-lg bg-white/5" />
          </div>
        ))}
        <Skeleton className="h-12 w-full rounded-lg bg-white/10" />
      </div>
    </div>
  );
}

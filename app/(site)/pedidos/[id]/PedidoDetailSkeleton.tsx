import { Skeleton } from "@/components/ui/skeleton";

export default function PedidoDetailSkeleton() {
  return (
    <div className="flex flex-col gap-8 md:flex-row md:gap-10 md:items-start">
      <div className="min-w-0 flex-1 space-y-6">
        <div className="rounded-radius-lg border border-border-subtle overflow-hidden">
          <div className="p-6 space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="p-6 space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-24 w-24 shrink-0 rounded-radius-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <aside className="w-full shrink-0 md:w-80">
        <div className="rounded-radius-lg border border-border-subtle p-6 space-y-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </aside>
    </div>
  );
}

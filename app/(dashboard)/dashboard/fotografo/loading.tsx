import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6 md:gap-8 p-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-[200px] bg-white/10" />
          <Skeleton className="h-4 w-[280px] bg-white/5" />
        </div>
        <Skeleton className="h-10 w-[160px] sm:w-[180px] bg-white/10" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-black/20 border-white/10">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24 bg-white/10" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-9 w-20 bg-white/10" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-black/20 border-white/10 overflow-hidden">
        <CardHeader>
          <Skeleton className="h-6 w-48 bg-white/10" />
          <Skeleton className="h-4 w-64 bg-white/5" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg bg-white/5" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

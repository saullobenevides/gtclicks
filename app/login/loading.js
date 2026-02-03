import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-2 text-center">
          <Skeleton className="h-10 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-4 w-full text-center" />
        </div>
      </div>
    </div>
  );
}

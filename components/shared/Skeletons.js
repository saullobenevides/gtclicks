"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function PhotoCardSkeleton() {
  return (
    <div className="group relative block overflow-hidden rounded-xl bg-muted aspect-[3/4]">
      <Skeleton className="h-full w-full" />
      <div className="absolute bottom-4 left-4 right-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function CollectionCardSkeleton() {
  return (
    <div className="group relative block overflow-hidden rounded-xl bg-muted aspect-[4/3]">
      <Skeleton className="h-full w-full" />
      <div className="absolute bottom-6 left-6 right-6 space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex items-center justify-between pt-3">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
}

export function DashboardCardSkeleton() {
  return (
    <div className="glass-panel rounded-xl p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
}

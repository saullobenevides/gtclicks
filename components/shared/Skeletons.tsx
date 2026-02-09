"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function PhotoCardSkeleton() {
  return (
    <Card className="group relative block overflow-hidden rounded-xl bg-muted aspect-[3/4] border-0">
      <Skeleton className="h-full w-full" />
      <div className="absolute bottom-4 left-4 right-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </Card>
  );
}

export function CollectionCardSkeleton() {
  return (
    <Card className="group relative block overflow-hidden rounded-xl bg-muted aspect-[4/3] border-0">
      <Skeleton className="h-full w-full" />
      <div className="absolute bottom-6 left-6 right-6 space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex items-center justify-between pt-3">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </Card>
  );
}

export function DashboardCardSkeleton() {
  return (
    <Card className="glass-panel rounded-xl p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-4 w-full" />
      </div>
    </Card>
  );
}

export function CartPageSkeleton() {
  return (
    <div className="container-wide px-4 py-12 sm:py-16 md:py-24">
      <div className="mb-12">
        <Skeleton className="h-10 w-[280px]" />
        <Skeleton className="h-4 w-[200px] mt-2" />
      </div>
      <div className="grid grid-cols-1 gap-8 sm:gap-12 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="flex gap-4 p-6 rounded-xl border border-white/10"
            >
              <Skeleton className="h-28 w-full shrink-0 rounded-lg sm:h-32 sm:w-48" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-10 w-10 rounded-md shrink-0" />
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <Skeleton className="h-[220px] w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function CheckoutPageSkeleton() {
  return (
    <div className="container-wide px-4 py-12 md:py-20">
      <div className="mb-10">
        <div className="h-4 w-48 bg-white/10 rounded animate-pulse mb-4" />
        <div className="h-8 w-64 bg-white/10 rounded animate-pulse mb-2" />
        <div className="h-4 w-32 bg-white/5 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_450px] gap-12">
        <div className="space-y-6">
          <div className="h-64 bg-white/5 rounded-xl animate-pulse" />
          <div className="h-32 bg-white/5 rounded-xl animate-pulse hidden lg:block" />
        </div>
        <div className="space-y-4">
          <div className="h-10 bg-white/10 rounded-lg animate-pulse w-3/4" />
          <div className="h-4 bg-white/5 rounded animate-pulse w-full" />
          <div className="h-[400px] bg-white/5 rounded-xl animate-pulse" />
        </div>
      </div>
      <div className="flex justify-center mt-8 gap-2">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-muted-foreground text-sm">Preparando checkout...</p>
      </div>
    </div>
  );
}

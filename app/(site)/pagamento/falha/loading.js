import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container-wide py-16 md:py-24 flex flex-col items-center justify-center min-h-[60vh]">
      <Skeleton className="h-24 w-24 rounded-full mb-8" />
      <Skeleton className="h-10 w-72 mb-4" />
      <Skeleton className="h-4 w-96 mb-8" />
      <Skeleton className="h-12 w-40 rounded-lg" />
    </div>
  );
}

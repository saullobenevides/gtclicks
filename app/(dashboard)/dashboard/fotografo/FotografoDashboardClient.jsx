"use client";

import dynamic from "next/dynamic";

const DashboardContent = dynamic(
  () => import("@/features/photographer/components/DashboardContent"),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-muted-foreground">Carregando dashboard...</p>
      </div>
    ),
  }
);

export default function FotografoDashboardClient() {
  return <DashboardContent />;
}

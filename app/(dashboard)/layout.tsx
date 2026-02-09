"use client";

import DashboardHeader from "@/components/layout/DashboardHeader";
import DashboardFooter from "@/components/layout/DashboardFooter";

export default function DashboardAreaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader />
      <div className="flex-1 pt-16">{children}</div>
      <DashboardFooter />
    </div>
  );
}

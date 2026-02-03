"use client";

import DashboardHeader from "@/components/layout/DashboardHeader";
import DashboardFooter from "@/components/layout/DashboardFooter";

/**
 * Layout da área de dashboard (fotógrafo e admin).
 * Header e footer minimalistas. BottomNav é oculto via NavigationController.
 */
export default function DashboardAreaLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader />
      <div className="flex-1 pt-16">{children}</div>
      <DashboardFooter />
    </div>
  );
}

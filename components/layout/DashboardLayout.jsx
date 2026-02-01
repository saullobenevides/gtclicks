"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import DashboardMobileNav from "@/features/photographer/components/DashboardMobileNav";

export function DashboardLayout({ children, navItems }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden w-[260px] shrink-0 border-r border-white/10 bg-black/40 backdrop-blur-sm lg:block">
        <div className="sticky top-20 h-[calc(100vh-5rem)] overflow-auto py-6">
          <nav
            className="grid items-start gap-1 px-3 text-sm font-medium"
            aria-label="Menu do dashboard"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground transition-all duration-200 hover:text-white hover:bg-white/5",
                    isActive &&
                      "bg-primary text-white font-semibold shadow-md shadow-primary/10"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden />}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 w-full min-w-0">
        {/* Mobile Horizontal Nav */}
        <DashboardMobileNav navItems={navItems} />

        <main className="flex-1 flex flex-col gap-4 py-6 px-4 lg:gap-6 lg:py-8 lg:px-8 w-full max-w-[1600px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

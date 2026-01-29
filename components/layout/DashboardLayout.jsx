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
      <div className="hidden w-[240px] shrink-0 border-r bg-muted/40 lg:block">
        <div className="flex-1 overflow-auto py-4">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all duration-200 hover:text-white hover:bg-white/5",
                  {
                    "bg-primary/10 text-primary font-bold border border-primary/20 shadow-[0_0_15px_rgba(255,0,0,0.1)]":
                      pathname === item.href,
                  },
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 w-full min-w-0 overflow-x-hidden">
        {/* Mobile Horizontal Nav - Replaces the Sidebar Trigger */}
        <DashboardMobileNav navItems={navItems} />

        <main className="flex-1 flex flex-col gap-4 py-8 px-4 lg:gap-6 lg:py-10 lg:px-6 w-full max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";

import DashboardMobileNav from "@/features/photographer/components/DashboardMobileNav";

export function DashboardLayout({ children, navItems }) {
  const pathname = usePathname();

  return (
    <div className="grid min-h-screen w-full max-w-full lg:grid-cols-[240px_1fr] overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-muted/40 lg:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <div className="flex items-center gap-2 font-semibold">
              <span className="">Dashboard</span>
            </div>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                    {
                      "bg-muted text-primary": pathname === item.href,
                    },
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col w-full max-w-full">
        {/* Mobile Horizontal Nav - Replaces the Sidebar Trigger */}
        <DashboardMobileNav navItems={navItems} />

        <div className="hidden lg:flex h-14 items-center gap-4 border-b bg-black px-6 lg:h-[60px] sticky top-0 z-40">
          <div className="w-full flex-1">
            {/* Desktop Page Header Content if needed */}
          </div>
        </div>

        <main className="flex flex-1 flex-col gap-4 py-8 px-2 sm:px-4 lg:gap-6 lg:py-10 lg:px-6 w-full max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

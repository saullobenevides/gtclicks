"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useRef, useEffect } from "react";

export default function DashboardMobileNav({ navItems }) {
  const pathname = usePathname();
  const scrollRef = useRef(null);

  // Auto-scroll to active item
  useEffect(() => {
    if (scrollRef.current) {
      const activeItem = scrollRef.current.querySelector(
        '[data-active="true"]',
      );
      if (activeItem) {
        activeItem.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [pathname]);

  return (
    <div className="lg:hidden w-screen max-w-full bg-background border-b overflow-x-auto no-scrollbar">
      <nav
        ref={scrollRef}
        className="flex items-center px-4 h-12 gap-2 min-w-max"
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              data-active={isActive}
              className={cn(
                "flex items-center whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

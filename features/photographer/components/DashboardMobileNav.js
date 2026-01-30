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
    <div className="lg:hidden w-full max-w-full bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="overflow-x-auto no-scrollbar py-2">
        <nav
          ref={scrollRef}
          className="flex items-center px-4 h-10 gap-2 min-w-max"
        >
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                data-active={isActive}
                className={cn(
                  "flex items-center whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary font-bold border border-primary/20 shadow-[0_0_15px_rgba(255,0,0,0.1)]"
                    : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

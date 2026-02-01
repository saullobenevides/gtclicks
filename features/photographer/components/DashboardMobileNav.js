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
        '[data-active="true"]'
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
    <div className="lg:hidden w-full bg-black/90 backdrop-blur-md border-b border-white/10 sticky top-[76px] z-40">
      <div className="overflow-x-auto scrollbar-hide">
        <nav
          ref={scrollRef}
          className="flex items-center px-3 py-3 gap-2 min-w-max scroll-smooth"
          style={{ scrollSnapType: "x mandatory" }}
          aria-label="Navegação do dashboard"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                data-active={isActive}
                style={{ scrollSnapAlign: "center" }}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 min-h-[44px]",
                  isActive
                    ? "bg-primary text-white font-bold shadow-lg shadow-primary/20"
                    : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white border border-white/10"
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
    </div>
  );
}

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Suspense } from "react";
import NavUserActions from "./NavUserActions";
import { siteConfig } from "@/config/site";

export default function MobileMenu({ isOpen, onClose }) {
  const pathname = usePathname();

  // Simplified Nav Items
  const mainNavItems = siteConfig.navItems.filter(
    (item) => !["/meus-favoritos", "/carrinho"].includes(item.href),
  );

  return (
    <div
      className={cn(
        "fixed inset-0 z-[60] bg-surface-page/60 backdrop-blur-xl transition-all duration-300 md:hidden",
        isOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none",
      )}
    >
      <div
        className={cn(
          "absolute right-0 top-0 h-full w-[80%] max-w-sm bg-surface-page border-l border-border-subtle shadow-shadow-lg transition-transform duration-300 flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="p-space-6 flex items-center justify-between border-b border-border-subtle">
          <span className="font-display font-font-bold text-text-xl tracking-tight text-text-primary">
            Menu
          </span>
          <button
            onClick={onClose}
            className="p-space-2 text-text-muted hover:text-text-primary"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-space-6 px-space-4 flex flex-col gap-space-2">
          {mainNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center justify-between px-space-4 py-space-4 rounded-radius-xl text-text-lg font-font-medium transition-all border border-transparent",
                pathname === item.href
                  ? "bg-surface-subtle text-text-primary border-border-subtle"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-subtle/50",
              )}
            >
              {item.label}
            </Link>
          ))}

          <hr className="my-space-4 border-border-subtle" />

          <Link
            href="/meus-favoritos"
            onClick={onClose}
            className="flex items-center gap-space-3 px-space-4 py-space-3 text-text-secondary hover:text-text-primary rounded-radius-xl hover:bg-surface-subtle/50"
          >
            <Heart className="h-5 w-5" />
            Meus Favoritos
          </Link>

          <div className="mt-auto pt-space-8 pb-space-4">
            <Suspense>
              <NavUserActions mobile />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

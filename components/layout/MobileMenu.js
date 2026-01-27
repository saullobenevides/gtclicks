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
        "fixed inset-0 z-[60] bg-black/60 backdrop-blur-xl transition-all duration-300 md:hidden",
        isOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none",
      )}
    >
      <div
        className={cn(
          "absolute right-0 top-0 h-full w-[80%] max-w-sm bg-zinc-950 border-l border-white/10 shadow-2xl transition-transform duration-300 flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="p-6 flex items-center justify-between border-b border-white/10">
          <span className="font-syne font-bold text-xl tracking-tight text-white">
            Menu
          </span>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
          {mainNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center justify-between px-4 py-4 rounded-xl text-lg font-medium transition-all border border-transparent",
                pathname === item.href
                  ? "bg-white/10 text-white border-white/5"
                  : "text-zinc-400 hover:text-white hover:bg-white/5",
              )}
            >
              {item.label}
            </Link>
          ))}

          <hr className="my-4 border-white/10" />

          <Link
            href="/meus-favoritos"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-white rounded-xl hover:bg-white/5"
          >
            <Heart className="h-5 w-5" />
            Meus Favoritos
          </Link>

          <div className="mt-auto pt-8 pb-4">
            <Suspense>
              <NavUserActions mobile />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ShoppingCart, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/features/cart/context/CartContext";

const navItems = [
  { href: "/", icon: Home, label: "Início" },
  { href: "/busca", icon: Search, label: "Buscar" },
  { href: "/carrinho", icon: ShoppingCart, label: "Carrinho" },
  { href: "/meus-favoritos", icon: Heart, label: "Favoritos" },
  { href: "/dashboard", icon: User, label: "Perfil" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { itemCount } = useCart();

  // Logic moved to NavigationController

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-surface-elevated/95 backdrop-blur-xl border-t border-border-default h-20"
      style={{
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="grid grid-cols-5 h-full items-center px-space-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname?.startsWith(item.href));
          const isCart = item.label === "Carrinho";

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-space-1 py-space-2 px-space-1 rounded-radius-full transition-all active:scale-95",
                isActive
                  ? "text-action-primary"
                  : "text-text-secondary active:text-text-primary",
              )}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    "h-6 w-6 transition-transform",
                    isActive && "scale-110",
                  )}
                />
                {isCart && itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-radius-full bg-action-primary text-[9px] font-font-bold flex items-center justify-center text-text-on-brand border border-surface-page">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "text-text-xs font-font-medium transition-all",
                  isActive ? "font-font-bold" : "font-font-normal",
                )}
              >
                {item.label}
              </span>
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-action-primary rounded-radius-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

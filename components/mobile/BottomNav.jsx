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

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-black/95 backdrop-blur-xl border-t border-white/10"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Navegação móvel"
    >
      <div className="grid grid-cols-5 h-16 min-h-[64px] items-stretch">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname?.startsWith(item.href));
          const isCart = item.href === "/carrinho";

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2 px-1 min-w-0 transition-all active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset",
                isActive ? "text-primary" : "text-muted-foreground active:text-white",
              )}
              aria-current={isActive ? "page" : undefined}
              aria-label={
                isCart && itemCount > 0
                  ? `${item.label} (${itemCount} ${itemCount === 1 ? "item" : "itens"})`
                  : item.label
              }
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  className={cn("h-6 w-6 shrink-0 transition-transform", isActive && "scale-110")}
                  aria-hidden
                />
                {isCart && itemCount > 0 && (
                  <span
                    className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-[10px] font-bold flex items-center justify-center text-primary-foreground border-2 border-black"
                    aria-hidden
                  >
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-medium truncate max-w-full",
                  isActive && "font-semibold",
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

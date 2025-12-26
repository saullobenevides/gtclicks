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
      style={{
        height: '4.5rem',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="grid grid-cols-5 h-full items-center px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || 
            (item.href !== "/" && pathname?.startsWith(item.href));
          const isCart = item.label === "Carrinho";

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg transition-all active:scale-95",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground active:text-white"
              )}
            >
              <div className="relative">
                <Icon 
                  className={cn(
                    "h-6 w-6 transition-transform",
                    isActive && "scale-110"
                  )} 
                />
                {isCart && itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[9px] font-bold flex items-center justify-center text-white border border-black">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </div>
              <span 
                className={cn(
                  "text-[10px] font-medium transition-all",
                  isActive ? "font-bold" : "font-normal"
                )}
              >
                {item.label}
              </span>
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

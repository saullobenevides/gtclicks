"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Heart, Search as SearchIcon, ShoppingCart } from "lucide-react";
import { useCart } from "@/features/cart/context/CartContext";
import { cn } from "@/lib/utils";
import { Suspense } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import NavUserActions from "./NavUserActions";
import { siteConfig } from "@/config/site";

export default function MobileMenu({ id = "mobile-menu", isOpen, onClose }) {
  const pathname = usePathname();
  const { itemCount, setIsCartOpen } = useCart();

  const mainNavItems = siteConfig.navItems.filter(
    (item) => !["/meus-favoritos", "/carrinho"].includes(item.href)
  );

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        id={id}
        className="w-[85%] max-w-sm border-l border-white/10 bg-surface-page p-0 flex flex-col md:hidden [&>button]:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-describedby={undefined}
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Menu de navegação</SheetTitle>
        </SheetHeader>

        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <span className="font-display font-bold text-xl tracking-tight text-white">
            Menu
          </span>
          <button
            onClick={onClose}
            className="p-2 -m-2 text-muted-foreground hover:text-white rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Fechar menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const query = e.target.search?.value?.trim();
              if (query) {
                window.location.href = `/busca?q=${encodeURIComponent(query)}`;
                onClose();
              }
            }}
            className="mb-4"
          >
            <div className="relative">
              <SearchIcon
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                aria-hidden
              />
              <Input
                name="search"
                type="search"
                placeholder="Buscar coleções, eventos ou fotógrafos..."
                className="w-full h-11 pl-10 rounded-lg bg-black/40 border-white/10 text-white placeholder:text-muted-foreground focus-visible:ring-primary"
                autoComplete="off"
              />
            </div>
          </form>

          <nav aria-label="Links do menu" className="flex flex-col gap-1">
            {mainNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center min-h-[48px] px-4 py-3 rounded-xl text-base font-medium transition-colors",
                  pathname === item.href
                    ? "bg-white/10 text-white"
                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                )}
                aria-current={pathname === item.href ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Separator className="my-4 bg-white/10" />

          <Link
            href="/meus-favoritos"
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 min-h-[48px] px-4 py-3 rounded-xl text-base font-medium transition-colors",
              pathname === "/meus-favoritos"
                ? "bg-white/10 text-white"
                : "text-muted-foreground hover:text-white hover:bg-white/5"
            )}
            aria-current={pathname === "/meus-favoritos" ? "page" : undefined}
          >
            <Heart className="h-5 w-5 shrink-0" />
            Meus Favoritos
          </Link>

          <button
            type="button"
            onClick={() => {
              setIsCartOpen(true);
              onClose();
            }}
            className={cn(
              "flex items-center gap-3 min-h-[48px] px-4 py-3 rounded-xl text-base font-medium transition-colors w-full text-left",
              pathname === "/carrinho"
                ? "bg-white/10 text-white"
                : "text-muted-foreground hover:text-white hover:bg-white/5"
            )}
            aria-label={
              itemCount > 0
                ? `Carrinho com ${itemCount} ${
                    itemCount === 1 ? "item" : "itens"
                  }`
                : "Abrir carrinho"
            }
          >
            <div className="relative">
              <ShoppingCart className="h-5 w-5 shrink-0" />
              {itemCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-[10px] font-bold flex items-center justify-center text-primary-foreground"
                  aria-hidden
                >
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </div>
            Carrinho {itemCount > 0 && `(${itemCount})`}
          </button>

          <div className="mt-auto pt-8 pb-4">
            <Suspense>
              <NavUserActions mobile />
            </Suspense>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

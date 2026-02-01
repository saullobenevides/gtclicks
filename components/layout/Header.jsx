"use client";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import NavUserActions from "./NavUserActions";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { Menu, ShoppingCart, Heart, Search } from "lucide-react";
import { useCart } from "@/features/cart/context/CartContext";
import NotificationBell from "@/components/notifications/NotificationBell";

const MobileMenu = dynamic(() => import("./MobileMenu"), { ssr: false });

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { setIsCartOpen, itemCount } = useCart();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const mainNavItems = siteConfig.navItems.filter(
    (item) => !["/meus-favoritos", "/carrinho"].includes(item.href),
  );

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out border-b flex items-center justify-center",
          scrolled
            ? "bg-surface-page/95 backdrop-blur-xl border-border-subtle shadow-lg h-16 md:h-[76px]"
            : "bg-surface-page/90 backdrop-blur-sm border-transparent h-16 md:h-[76px]",
        )}
        role="banner"
      >
        <div className="container-wide w-full flex items-center justify-between px-4 md:px-6">
          {/* Logo */}
          <div className="flex-1 flex items-center justify-start min-w-0">
            <Link
              href="/"
              className="relative z-10 flex items-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page rounded-radius-md"
              aria-label="GTClicks - Ir para página inicial"
            >
              <div className="relative h-8 w-28 md:h-9 md:w-32 transition-transform duration-200 group-hover:scale-[1.02]">
                <Image
                  src="/logo.png"
                  alt=""
                  fill
                  sizes="(max-width: 768px) 112px, 128px"
                  className="object-contain object-left"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav
            className="hidden lg:flex items-center justify-center flex-none"
            aria-label="Navegação principal"
          >
            <div className="flex items-center gap-1 px-2 py-2 rounded-full border border-white/10 bg-black/40 backdrop-blur-md">
              {mainNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium px-4 py-2 rounded-full transition-all duration-200 min-h-[40px] flex items-center",
                    pathname === item.href
                      ? "bg-white text-black font-semibold"
                      : "text-muted-foreground hover:text-white hover:bg-white/10",
                  )}
                  aria-current={pathname === item.href ? "page" : undefined}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* Actions */}
          <div className="flex-1 flex items-center justify-end gap-1 md:gap-2 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex h-10 w-10 text-muted-foreground hover:text-white hover:bg-white/10 rounded-full shrink-0"
              asChild
            >
              <Link href="/busca" aria-label="Buscar fotos">
                <Search className="h-5 w-5" />
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex h-10 w-10 text-muted-foreground hover:text-red-400 hover:bg-white/10 rounded-full shrink-0"
              asChild
            >
              <Link href="/meus-favoritos" aria-label="Meus favoritos">
                <Heart className="h-5 w-5" />
              </Link>
            </Button>

            <NotificationBell />

            <Button
              variant="ghost"
              size="icon"
              className="relative h-10 w-10 text-muted-foreground hover:text-white hover:bg-white/10 rounded-full shrink-0"
              onClick={() => setIsCartOpen(true)}
              aria-label={
                itemCount > 0
                  ? `Carrinho com ${itemCount} ${itemCount === 1 ? "item" : "itens"}`
                  : "Abrir carrinho"
              }
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 h-5 w-5 min-w-5 rounded-full bg-primary text-[10px] font-bold flex items-center justify-center text-primary-foreground border-2 border-surface-page"
                  aria-hidden
                >
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </Button>

            <Separator
              orientation="vertical"
              className="h-6 hidden md:block mx-1 bg-white/10"
            />

            <div className="hidden md:block shrink-0">
              <Suspense
                fallback={
                  <div className="h-10 w-10 rounded-full bg-white/10 animate-pulse" />
                }
              >
                <NavUserActions />
              </Suspense>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-11 w-11 text-muted-foreground hover:text-white hover:bg-white/10 rounded-full shrink-0"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Abrir menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </header>

      <MobileMenu
        id="mobile-menu"
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  );
}

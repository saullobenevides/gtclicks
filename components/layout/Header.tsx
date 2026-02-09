"use client";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useState, useEffect, useRef } from "react";
import NavUserActions from "./NavUserActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { Menu, ShoppingCart, Heart, Search, X } from "lucide-react";
import { useCart } from "@/features/cart/context/CartContext";
import NotificationBell from "@/components/notifications/NotificationBell";

const MobileMenu = dynamic(() => import("./MobileMenu"), { ssr: false });

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { setIsCartOpen, itemCount } = useCart();

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsSearchOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const SEARCH_HISTORY_KEY = "gtclicks-search-history";
  const MAX_HISTORY = 5;

  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed.slice(0, MAX_HISTORY) : [];
      }
    } catch {
      /* ignore */
    }
    return [];
  });

  const addToSearchHistory = (q: string) => {
    if (!q?.trim()) return;
    setSearchHistory((prev) => {
      const next = [q.trim(), ...prev.filter((x) => x !== q.trim())].slice(
        0,
        MAX_HISTORY
      );
      try {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const q = (
      form.elements.namedItem("search") as HTMLInputElement
    )?.value?.trim();
    setIsSearchOpen(false);
    if (q) {
      addToSearchHistory(q);
      router.push(`/busca?q=${encodeURIComponent(q)}`);
    } else {
      router.push("/busca");
    }
  };

  const handleHistoryClick = (term: string) => {
    setIsSearchOpen(false);
    addToSearchHistory(term);
    router.push(`/busca?q=${encodeURIComponent(term)}`);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const mainNavItems = siteConfig.navItems.filter(
    (item) => !["/meus-favoritos", "/carrinho"].includes(item.href)
  );

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out border-b flex items-center justify-center",
          scrolled
            ? "bg-surface-page/95 backdrop-blur-xl border-border-subtle shadow-lg h-16 md:h-[76px]"
            : "bg-surface-page/90 backdrop-blur-sm border-transparent h-16 md:h-[76px]"
        )}
        role="banner"
      >
        <div className="container-wide w-full flex items-center justify-between px-4 md:px-6">
          <div className="flex-1 flex items-center justify-start min-w-0">
            <Link
              href="/"
              className="relative z-10 flex items-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page rounded-radius-md"
              aria-label="GTClicks - Ir para página inicial"
            >
              <div className="relative h-8 w-28 md:h-9 md:w-32 transition-transform duration-200 group-hover:scale-[1.02]">
                <Image
                  src="/logo.webp"
                  alt=""
                  fill
                  sizes="(max-width: 768px) 112px, 128px"
                  className="object-contain object-left"
                  priority
                />
              </div>
            </Link>
          </div>

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
                      : "text-muted-foreground hover:text-white hover:bg-white/10"
                  )}
                  aria-current={pathname === item.href ? "page" : undefined}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          <div className="flex-1 flex items-center justify-end gap-1 md:gap-2 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-muted-foreground hover:text-white hover:bg-white/10 rounded-full shrink-0"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Abrir busca"
            >
              <Search className="h-5 w-5" />
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
                  ? `Carrinho com ${itemCount} ${
                      itemCount === 1 ? "item" : "itens"
                    }`
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

            <div className="hidden md:block shrink-0 rounded-full">
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

      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent
          className="fixed inset-0 w-full h-full max-w-none translate-x-0 translate-y-0 rounded-none border-0 bg-surface-page/98 backdrop-blur-xl p-0 flex flex-col items-center justify-center gap-8 [&>button:last-child]:hidden"
          overlayClassName="bg-black/90 backdrop-blur-md"
        >
          <DialogTitle className="sr-only">Buscar</DialogTitle>
          <button
            type="button"
            onClick={() => setIsSearchOpen(false)}
            className="absolute right-6 top-6 p-2 text-muted-foreground hover:text-white rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Fechar busca"
          >
            <X className="h-8 w-8" />
          </button>
          <form onSubmit={handleSearchSubmit} className="w-full max-w-2xl px-6">
            <div className="relative">
              <Search
                className="absolute left-6 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground pointer-events-none"
                aria-hidden
              />
              <Input
                ref={searchInputRef}
                name="search"
                type="search"
                placeholder="Buscar coleções, eventos ou fotógrafos..."
                className="pl-16 h-16 text-xl bg-black/40 border-2 border-white/20 text-white placeholder:text-muted-foreground rounded-2xl w-full focus-visible:ring-primary focus-visible:border-primary transition-colors duration-200"
                autoComplete="off"
                aria-label="Campo de busca"
              />
            </div>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Pressione Enter para buscar
            </p>
            {searchHistory.length > 0 && (
              <div className="mt-8 w-full max-w-2xl mx-auto">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Buscas recentes
                </p>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => handleHistoryClick(term)}
                      className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/15 text-sm text-white border border-white/10 hover:border-white/20 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </form>
        </DialogContent>
      </Dialog>

      <MobileMenu
        id="mobile-menu"
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  );
}

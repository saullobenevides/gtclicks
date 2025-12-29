'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import NavUserActions from "./NavUserActions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { Menu, X, ShoppingCart, Heart } from "lucide-react";
import { useCart } from "@/features/cart/context/CartContext";

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { setIsCartOpen, itemCount } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300 border-b h-[var(--header-height)] flex items-center",
        scrolled
          ? "bg-black/80 backdrop-blur-md border-white/5" // Scrolled state (always glass)
          : "bg-black border-transparent" // Initial state (solid black for all pages)
      )}
    >
      <div className="container-wide flex h-[var(--header-height)] items-center justify-between">
        <div className="flex items-center gap-12 lg:gap-14">
          <Link href="/" className="group flex items-center gap-3">
            {/* Logo Replaced */}
             <div className="relative h-10 w-auto aspect-[3/1] md:h-12">
               <img 
                 src="/logo.png" 
                 alt="GTClicks Logo" 
                 className="h-full w-full object-contain"
               />
             </div>
             {/* End Logo Replaced */}
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {siteConfig.navItems.filter(item => item.href !== '/meus-favoritos').map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-semibold transition-all px-4 py-2.5 rounded-lg hover:bg-white/5 relative group",
                  pathname === item.href
                    ? "bg-white/10 text-white"
                    : "text-muted-foreground hover:text-white"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3 lg:gap-4 border-l border-white/10 pl-8 lg:pl-10 ml-8 lg:ml-12">
          {/* Favorites - Desktop (moved from Nav) */}
          <Button 
            variant="ghost" 
            size="icon"
            className="hidden md:flex text-muted-foreground hover:text-red-500 hover:bg-white/5"
            asChild
          >
            <Link href="/meus-favoritos">
              <Heart className="h-5 w-5" />
              <span className="sr-only">Meus Favoritos</span>
            </Link>
          </Button>
          {/* Cart - Visible on Mobile now */}
          <Button 
            variant="ghost" 
            size="icon"
            className="text-muted-foreground hover:text-white hover:bg-white/5 relative"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold flex items-center justify-center text-white border-2 border-black">
                {itemCount}
              </span>
            )}
            <span className="sr-only">Carrinho</span>
          </Button>

          <div className="h-6 w-px bg-white/10 hidden md:block" />

          <div className="flex items-center gap-3 md:gap-4">
            <Suspense
              fallback={
                <Button asChild variant="default" size="default" className="hidden lg:flex bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 hover:-translate-y-0.5 hover:scale-105">
                  <Link href={siteConfig.links.signup}>
                    Seja Fotógrafo
                  </Link>
                </Button>
              }
            >
              <NavUserActions />
            </Suspense>
            
            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-muted-foreground hover:text-white transition-colors active:scale-95"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-[var(--header-height)] left-0 w-full h-[calc(100vh-var(--header-height))] bg-black/95 backdrop-blur-xl animate-in slide-in-from-top-5 z-40 overflow-y-auto">
          <div className="flex flex-col p-6 gap-2">
            {siteConfig.navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center justify-between rounded-xl px-4 py-4 text-lg font-medium transition-all",
                  pathname === item.href
                    ? "bg-white/10 text-white shadow-inner"
                    : "text-muted-foreground hover:bg-white/5 hover:text-white active:bg-white/10"
                )}
              >
                {item.label}
              </Link>
            ))}
            
            <div className="my-4 h-px bg-white/10 w-full" />
            
            <Link
               href={siteConfig.links.signup}
               onClick={() => setIsMobileMenuOpen(false)}
               className="flex items-center justify-center w-full rounded-xl bg-primary px-4 py-4 text-lg font-bold text-white shadow-lg shadow-primary/20 transition-transform active:scale-95"
            >
              Começar a Vender Fotos
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

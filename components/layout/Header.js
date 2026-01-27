"use client";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import NavUserActions from "./NavUserActions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { Menu, ShoppingCart, Heart, Search } from "lucide-react";
import { useCart } from "@/features/cart/context/CartContext";
import NotificationBell from "@/components/notifications/NotificationBell";

// Lazy load Mobile Menu to reduce initial bundle size
const MobileMenu = dynamic(() => import("./MobileMenu"), { ssr: false });

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

  // Simplified Nav Items (Removed Search/Collections if they are redundant or secondary)
  const mainNavItems = siteConfig.navItems.filter(
    (item) => !["/meus-favoritos", "/carrinho"].includes(item.href),
  );

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out border-b border-transparent bg-white",
          scrolled
            ? "bg-black/60 backdrop-blur-xl border-white/5 py-3 shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
            : "bg-transparent py-5",
        )}
      >
        <div className="container-wide flex items-center justify-between px-6 md:px-8">
          {/* LEFT: LOGO */}
          <Link
            href="/"
            className="relative z-10 flex items-center gap-2 group"
          >
            <div className="relative h-10 w-32 transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/logo.png"
                alt="GTClicks Logo"
                fill
                sizes="(max-width: 768px) 128px, 128px"
                className="object-contain object-left"
                priority
              />
            </div>
          </Link>

          {/* Re-doing Nav to be always visible but floating */}
          <nav className="absolute left-1/2 -translate-x-1/2 hidden lg:flex items-center gap-1 px-3 py-2 rounded-full border border-white/5 bg-black/20 backdrop-blur-lg shadow-lg">
            {mainNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium px-5 py-2 rounded-full transition-all duration-300",
                  pathname === item.href
                    ? "bg-white text-black shadow-md font-bold"
                    : "text-zinc-400 hover:text-white hover:bg-white/10",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* RIGHT: ACTIONS */}
          <div className="flex items-center gap-3 relative z-10">
            {/* Search Trigger (Desktop) */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex text-zinc-400 hover:text-white hover:bg-white/10 rounded-full"
              asChild
            >
              <Link href="/busca">
                <Search className="h-5 w-5" />
              </Link>
            </Button>

            {/* Favorites (Desktop) */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex text-zinc-400 hover:text-red-500 hover:bg-white/10 rounded-full"
              asChild
            >
              <Link href="/meus-favoritos">
                <Heart className="h-5 w-5" />
              </Link>
            </Button>

            {/* Notifications */}
            <NotificationBell />

            {/* Cart Trigger */}
            <Button
              variant="ghost"
              size="icon"
              className="relative text-zinc-400 hover:text-white hover:bg-white/10 rounded-full"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-primary text-[10px] font-bold flex items-center justify-center text-white border-2 border-black animate-in zoom-in">
                  {itemCount}
                </span>
              )}
            </Button>

            {/* Divider */}
            <div className="h-6 w-px bg-white/10 hidden md:block mx-1" />

            {/* User Actions (Auth) */}
            <div className="hidden md:block">
              <Suspense
                fallback={
                  <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse" />
                }
              >
                <NavUserActions />
              </Suspense>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={28} />
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE MENU (Lazy Loaded) */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  );
}

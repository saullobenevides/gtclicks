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
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out border-b border-transparent flex items-center justify-center",
          scrolled
            ? "bg-surface-page/80 backdrop-blur-xl border-border-subtle shadow-shadow-lg h-16 md:h-20"
            : "bg-surface-page h-16 md:h-20",
        )}
      >
        <div className="container-wide w-full flex items-center justify-between">
          {/* COLUMN 1: LOGO (Left aligned) */}
          <div className="flex-1 flex items-center justify-start">
            <Link href="/" className="relative z-10 flex items-center group">
              <div className="relative h-8 w-28 md:h-10 md:w-32 transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/logo.png"
                  alt="GTClicks Logo"
                  fill
                  sizes="(max-width: 768px) 112px, 128px"
                  className="object-contain object-left"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* COLUMN 2: NAV PILLS (Centered, Hidden on Mobile) */}
          <div className="hidden lg:flex items-center justify-center flex-none">
            <nav className="flex items-center gap-space-2 px-space-2 py-space-2 rounded-radius-full border border-border-subtle bg-black/40 backdrop-blur-md shadow-shadow-sm">
              {mainNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-text-sm font-font-medium px-space-6 py-space-2 rounded-radius-full transition-all duration-300",
                    pathname === item.href
                      ? "bg-text-primary text-black font-font-bold shadow-shadow-sm"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-subtle",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* COLUMN 3: ACTIONS (Right aligned) */}
          <div className="flex-1 flex items-center justify-end gap-space-1 md:gap-space-2">
            {/* Search Trigger (Desktop) */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex text-text-secondary hover:text-text-primary hover:bg-surface-subtle rounded-radius-full transition-all"
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
              className="hidden md:flex text-text-secondary hover:text-status-error hover:bg-surface-subtle rounded-radius-full transition-all"
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
              className="relative text-text-secondary hover:text-text-primary hover:bg-surface-subtle rounded-radius-full transition-all"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4.5 w-4.5 rounded-radius-full bg-action-primary text-[10px] font-font-bold flex items-center justify-center text-text-on-brand border-2 border-surface-page animate-in zoom-in shadow-shadow-sm">
                  {itemCount}
                </span>
              )}
            </Button>

            {/* Divider */}
            <div className="h-6 w-px bg-border-subtle hidden md:block mx-space-1" />

            {/* User Actions (Auth) */}
            <div className="hidden md:block">
              <Suspense
                fallback={
                  <div className="w-10 h-10 rounded-radius-full bg-surface-subtle animate-pulse" />
                }
              >
                <NavUserActions />
              </Suspense>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-space-2 text-text-secondary hover:text-text-primary transition-colors focus:outline-none"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open Menu"
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

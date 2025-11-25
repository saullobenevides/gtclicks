'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
// UserButton removed as it is redundant with NavUserActions
import NavUserActions from "./NavUserActions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/busca", label: "Explorar" },
  { href: "/categorias", label: "Categorias" },
  { href: "/colecoes", label: "Coleções" },
  { href: "/meus-favoritos", label: "Favoritos" },
];

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
        "fixed top-0 z-50 w-full transition-all duration-300 border-b border-transparent",
        scrolled ? "bg-black/80 backdrop-blur-md border-white/5 py-2" : "bg-transparent py-4"
      )}
    >
      <div className="container-wide flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link href="/" className="group flex items-center gap-2">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20 transition-transform group-hover:scale-105 group-hover:shadow-primary/40">
              <span className="text-xl font-black">GT</span>
            </div>
            <span className="text-2xl font-black tracking-tighter text-white">
              CLICKS
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-white relative py-1",
                  pathname === item.href
                    ? "text-white"
                    : "text-muted-foreground"
                )}
              >
                {item.label}
                {pathname === item.href && (
                  <span className="absolute -bottom-1 left-0 h-0.5 w-full bg-primary rounded-full" />
                )}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2">
             <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-white hover:bg-white/5">
              <Link href="/carrinho">
                <span className="mr-2 text-lg">🛒</span>
                Carrinho
              </Link>
            </Button>
          </div>

          <div className="h-6 w-px bg-white/10 hidden md:block" />

          <div className="flex items-center gap-4">
            <Suspense
              fallback={
                <Button asChild variant="default" size="sm" className="bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 hover:-translate-y-0.5">
                  <Link href="/cadastro">
                    Seja Fotógrafo
                  </Link>
                </Button>
              }
            >
              <NavUserActions />
            </Suspense>
            
            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-muted-foreground hover:text-white transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {isMobileMenuOpen ? (
                  <path d="M18 6 6 18M6 6l12 12" />
                ) : (
                  <path d="M4 12h16M4 6h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full border-t border-white/10 bg-black/95 backdrop-blur-xl animate-in slide-in-from-top-5">
          <div className="space-y-1 px-4 pb-6 pt-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "block rounded-lg px-4 py-3 text-base font-medium transition-colors",
                  pathname === item.href
                    ? "bg-white/10 text-white"
                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                )}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/carrinho"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block rounded-lg px-4 py-3 text-base font-medium text-muted-foreground hover:bg-white/5 hover:text-white"
            >
              🛒 Carrinho
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

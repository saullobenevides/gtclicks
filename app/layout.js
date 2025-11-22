import Link from "next/link";
import { Suspense } from "react";
import { StackProvider, StackTheme, UserButton } from "@stackframe/stack";
import { Geist, Geist_Mono } from "next/font/google";
import NavUserActions from "../components/NavUserActions";
import { stackClientApp } from "../stack/client";
import { CartProvider } from "../components/CartContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const navItems = [
  { href: "/busca", label: "Explorar" },
  { href: "/categorias", label: "Categorias" },
  { href: "/colecoes", label: "Coleções" },
  { href: "/carrinho", label: "Carrinho", icon: "🛒" },
];

export const metadata = {
  title: "GTClicks | Marketplace de Fotos",
  description:
    "Marketplace multi-fotografo para vender colecoes exclusivas e licencas com entrega segura.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} site-body`}>
        <StackProvider app={stackClientApp}>
          <CartProvider>
          <StackTheme appearance="auto">
            <header className="site-header">
              <div className="site-header__container">
                <div className="site-header__brand">
                  <Link href="/" className="site-logo">
                    <span className="site-logo__icon">📸</span>
                    <span className="site-logo__text">GTClicks</span>
                  </Link>
                </div>
                
                <nav className="site-header__nav">
                  {navItems.map((item) => (
                    <Link key={item.href} href={item.href} className="nav-link">
                      {item.icon && <span className="nav-link__icon">{item.icon}</span>}
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </nav>

                <div className="site-header__actions">
                  <Suspense
                    fallback={
                      <Link className="btn btn-primary btn-sm" href="/cadastro">
                        Seja Fotógrafo
                      </Link>
                    }
                  >
                    <NavUserActions />
                  </Suspense>
                  <UserButton className="site-header__user" />
                </div>
              </div>
            </header>
            <main className="site-main">{children}</main>
            <footer className="site-footer">
              <div className="site-footer__container">
                <div className="site-footer__brand">
                  <h3>GTClicks</h3>
                  <p>Marketplace premium de fotos profissionais</p>
                </div>
                
                <div className="site-footer__links">
                  <div className="footer-column">
                    <h4>Marketplace</h4>
                    <Link href="/busca">Explorar Fotos</Link>
                    <Link href="/categorias">Categorias</Link>
                    <Link href="/colecoes">Coleções</Link>
                  </div>
                  
                  <div className="footer-column">
                    <h4>Fotógrafos</h4>
                    <Link href="/cadastro">Seja Fotógrafo</Link>
                    <Link href="/dashboard/fotografo/upload">Upload</Link>
                    <Link href="/dashboard/fotografo/financeiro">Financeiro</Link>
                  </div>
                  
                  <div className="footer-column">
                    <h4>Conta</h4>
                    <Link href="/meus-downloads">Meus Downloads</Link>
                    <Link href="/carrinho">Carrinho</Link>
                    <Link href="/login">Entrar</Link>
                  </div>
                </div>
              </div>
              
              <div className="site-footer__bottom">
                <p>&copy; {new Date().getFullYear()} GTClicks. Todos os direitos reservados.</p>
              </div>
            </footer>
          </StackTheme>
          </CartProvider>
        </StackProvider>
      </body>
    </html>
  );
}


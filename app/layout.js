import { StackProvider, StackTheme } from "@stackframe/stack";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { stackClientApp } from "../stack/client";
import { CartProvider } from "../components/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UserSync from "@/components/UserSync";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "GTClicks | Marketplace de Fotos",
  description:
    "Marketplace multi-fotografo para vender colecoes exclusivas e licencas com entrega segura.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased min-h-screen flex flex-col bg-black text-foreground selection:bg-primary selection:text-white`}>
        <StackProvider app={stackClientApp}>
          <Suspense fallback={null}>
            <UserSync />
          </Suspense>
          <Suspense fallback={null}>
            <CartProvider>
              <StackTheme appearance="dark">
                <Header />
                <main className="flex-1 w-full pt-20">{children}</main>
                <Footer />
              </StackTheme>
            </CartProvider>
          </Suspense>
        </StackProvider>
      </body>
    </html>
  );
}

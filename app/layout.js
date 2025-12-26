import { GoogleAnalytics } from '@next/third-parties/google';
import { Inter } from "next/font/google";
import AppProviders from "@/components/providers/AppProviders";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LazyClientComponents from "@/components/providers/LazyClientComponents";
import BottomNav from "@/components/mobile/BottomNav";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap', // Prevents FOIT (Flash of Invisible Text)
  variable: '--font-inter',
});

export const metadata = {
  title: {
    default: "GTClicks | Marketplace de Fotos",
    template: "%s | GTClicks"
  },
  description: "Marketplace multi-fotógrafo para vender coleções exclusivas e licenças com entrega segura.",
  keywords: ["fotografia", "marketplace", "fotos", "venda de fotos", "coleções", "fotógrafos"],
  authors: [{ name: "GTClicks" }],
  creator: "GTClicks",
  publisher: "GTClicks",
  metadataBase: new URL("https://www.gtclicks.com"),
  manifest: "/manifest.json",
  alternates: {
    canonical: "./",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://www.gtclicks.com",
    title: "GTClicks | Marketplace de Fotos",
    description: "Marketplace multi-fotógrafo para vender coleções exclusivas e licenças com entrega segura.",
    siteName: "GTClicks",
    images: [
      {
        url: "/og-image.jpg", // We assume this exists or will exist
        width: 1200,
        height: 630,
        alt: "GTClicks Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GTClicks | Marketplace de Fotos",
    description: "Marketplace multi-fotógrafo para vender coleções exclusivas e licenças com entrega segura.",
    creator: "@gtclicks",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ef233c",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className="dark">
      <body className={`${inter.className} font-sans antialiased min-h-screen flex flex-col bg-black text-foreground selection:bg-primary selection:text-white`}>
        <AppProviders>
            <Header />
            <main className="flex-1 w-full pt-20">{children}</main>
            <Footer />
            <LazyClientComponents />
            <BottomNav />
        </AppProviders>
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ""} />
      </body>
    </html>
  );
}


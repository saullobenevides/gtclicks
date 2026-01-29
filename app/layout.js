import { GoogleAnalytics } from "@next/third-parties/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { Inter, Syne } from "next/font/google"; // [NEW] Added Syne
import AppProviders from "@/components/providers/AppProviders";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LazyClientComponents from "@/components/providers/LazyClientComponents";
import BottomNav from "@/components/mobile/BottomNav";
import NavigationController from "@/components/layout/NavigationController";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const syne = Syne({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-syne",
});

export const metadata = {
  title: {
    default: "GTClicks | Marketplace de Fotos Esportivas e Eventos",
    template: "%s | GTClicks",
  },
  description:
    "Compre e venda fotos de surf, eventos e esportes em alta resolução. O marketplace oficial para fotógrafos profissionais monetizarem suas coleções.",
  keywords: [
    "fotos de esportes",
    "fotos de eventos",
    "venda de fotos",
    "marketplace de fotografia",
    "fotógrafo esportivo",
    "comprar fotos",
    "fotos de jogos",
    "fotos de campeonatos",
    "busca por selfie",
    "IA para fotos",
    "gtclicks",
  ],
  authors: [{ name: "GTClicks Team" }],
  creator: "GTClicks",
  publisher: "GTClicks",
  metadataBase: new URL("https://gtclicks.com.br"),
  manifest: "/manifest.json",
  alternates: {
    canonical: "https://gtclicks.com.br",
    languages: {
      "pt-BR": "https://gtclicks.com.br",
    },
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://gtclicks.com.br",
    title: "GTClicks | O Marketplace do Fotógrafo Esportivo",
    description:
      "A plataforma onde fotógrafos vendem suas fotos de eventos e esportes. Encontre seus registros em jogos e campeonatos.",
    siteName: "GTClicks",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "GTClicks Marketplace de Fotos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GTClicks | Marketplace de Fotos",
    description:
      "Venda suas fotos com segurança e receba via PIX. A casa do fotógrafo profissional.",
    creator: "@gtclicks",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ef233c",
};

export default function RootLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "GTClicks",
    url: "https://gtclicks.com.br",
    logo: "https://gtclicks.com.br/logo.png",
    description:
      "Marketplace líder para fotógrafos esportivos e de eventos venderem suas fotos diretamente.",
    sameAs: ["https://instagram.com/gtclicks", "https://gtclicks.com.br"],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+55-11-99999-9999",
      contactType: "customer service",
    },
  };

  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className="dark"
      data-scroll-behavior="smooth"
    >
      <body
        className={`${inter.className} ${syne.variable} font-sans antialiased min-h-screen flex flex-col bg-surface-page text-text-primary`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <AppProviders>
          <Header />
          <main className="flex-1 w-full pt-20 pb-24 md:pb-0">{children}</main>
          <Footer />
          <LazyClientComponents />
          <NavigationController>
            <BottomNav />
          </NavigationController>
          <SpeedInsights />
          <Analytics />
        </AppProviders>
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ""} />
      </body>
    </html>
  );
}

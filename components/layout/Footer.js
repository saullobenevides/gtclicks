import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { Instagram, Youtube, Twitter, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/5 bg-linear-to-b from-black to-zinc-950 pt-20 pb-8">
      <div className="container-wide">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-20 mb-16">
          <div className="flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative h-10 w-auto aspect-3/1">
                <Image
                  src="/logo.png"
                  alt="GTClicks Logo"
                  fill
                  sizes="(max-width: 768px) 120px, 120px"
                  className="object-contain object-left"
                />
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground max-w-xs">
              {siteConfig.description}
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-4 mt-2">
              <a
                href="https://instagram.com/gt.clicks"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://youtube.com/@gtclicks"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Youtube className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com/gtclicks"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://tiktok.com/@gtclicks"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60">
              Plataforma
            </h4>
            <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
              {siteConfig.footerParams.platform.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="transition-all duration-200 hover:text-white hover:translate-x-1 inline-block"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
              Fotógrafos
            </h4>
            <ul className="flex flex-col gap-3 text-base text-muted-foreground">
              {siteConfig.footerParams.photographers.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="transition-colors hover:text-white hover:translate-x-1 inline-block"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
              Suporte
            </h4>
            <ul className="flex flex-col gap-3 text-base text-muted-foreground">
              {siteConfig.footerParams.support.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="transition-colors hover:text-white hover:translate-x-1 inline-block"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground/80">
            © {new Date().getFullYear()} {siteConfig.name}. Todos os direitos
            reservados.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-muted-foreground/80">
              Feito com <span className="text-primary">❤️</span> para criadores
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

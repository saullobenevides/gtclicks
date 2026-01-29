import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { Instagram, Youtube, Twitter, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-border-subtle bg-surface-section pt-space-16 pb-space-8">
      <div className="container-wide">
        <div className="grid grid-cols-1 gap-space-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-space-20 mb-space-16">
          <div className="flex flex-col gap-space-6">
            <Link href="/" className="flex items-center gap-space-2 group">
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
            <p className="text-text-sm leading-relaxed text-text-secondary max-w-xs">
              {siteConfig.description}
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-space-2 mt-space-2">
              <a
                href="https://instagram.com/gt.clicks"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center min-h-11 min-w-11 text-text-secondary hover:text-action-primary transition-all rounded-radius-full hover:bg-surface-subtle"
              >
                <Instagram className="h-6 w-6" />
              </a>
              <a
                href="https://youtube.com/@gtclicks"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center min-h-11 min-w-11 text-text-secondary hover:text-action-primary transition-all rounded-radius-full hover:bg-surface-subtle"
              >
                <Youtube className="h-6 w-6" />
              </a>
              <a
                href="https://twitter.com/gtclicks"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center min-h-11 min-w-11 text-text-secondary hover:text-action-primary transition-all rounded-radius-full hover:bg-surface-subtle"
              >
                <Twitter className="h-6 w-6" />
              </a>
              <a
                href="https://tiktok.com/@gtclicks"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center min-h-11 min-w-11 text-text-secondary hover:text-action-primary transition-all rounded-radius-full hover:bg-surface-subtle"
              >
                <MessageCircle className="h-6 w-6" />
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-space-6">
            <h4 className="text-text-xs font-font-bold uppercase tracking-widest text-text-secondary/80">
              Plataforma
            </h4>
            <ul className="flex flex-col gap-space-3 text-text-sm text-text-secondary">
              {siteConfig.footerParams.platform.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="transition-all duration-200 hover:text-text-primary hover:translate-x-1 inline-block"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-space-6">
            <h4 className="text-text-xs font-font-bold uppercase tracking-widest text-text-secondary/80">
              Fotógrafos
            </h4>
            <ul className="flex flex-col gap-space-3 text-text-sm text-text-secondary">
              {siteConfig.footerParams.photographers.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="transition-all duration-200 hover:text-text-primary hover:translate-x-1 inline-block"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-space-6">
            <h4 className="text-text-xs font-font-bold uppercase tracking-widest text-text-secondary/80">
              Suporte
            </h4>
            <ul className="flex flex-col gap-space-3 text-text-sm text-text-secondary">
              {siteConfig.footerParams.support.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="transition-all duration-200 hover:text-text-primary hover:translate-x-1 inline-block"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border-subtle pt-space-10 flex flex-col md:flex-row items-center justify-between gap-space-4">
          <p className="text-text-xs text-text-secondary/80">
            © {new Date().getFullYear()} {siteConfig.name}. Todos os direitos
            reservados.
          </p>
          <div className="flex items-center gap-space-6">
            <span className="text-text-xs text-text-secondary/80">
              Feito com <span className="text-action-primary">❤️</span> para
              criadores
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

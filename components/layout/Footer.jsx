import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { Instagram, Youtube, Twitter, Music2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const socialLinks = [
  { href: "https://instagram.com/gt.clicks", label: "Instagram", icon: Instagram },
  { href: "https://youtube.com/@gtclicks", label: "YouTube", icon: Youtube },
  { href: "https://twitter.com/gtclicks", label: "Twitter", icon: Twitter },
  { href: "https://tiktok.com/@gtclicks", label: "TikTok", icon: Music2 },
];

function FooterSection({ title, links, id }) {
  return (
    <section aria-labelledby={id}>
      <h3
        id={id}
        className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4"
      >
        {title}
      </h3>
      <ul className="flex flex-col gap-3">
        {links.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="text-sm text-muted-foreground hover:text-white transition-colors flex items-center py-2 min-h-[44px] md:min-h-0 md:py-1"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="w-full border-t border-white/10 bg-black/40 backdrop-blur-sm"
      role="contentinfo"
    >
      <div className="container-wide px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-16 lg:gap-y-0 mb-12">
          {/* Brand */}
          <div className="flex flex-col gap-6 sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="inline-flex items-center w-fit focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded-md"
              aria-label="GTClicks - Página inicial"
            >
              <div className="relative h-9 w-28">
                <Image
                  src="/logo.png"
                  alt=""
                  fill
                  sizes="(max-width: 768px) 112px, 120px"
                  className="object-contain object-left"
                />
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground max-w-xs">
              {siteConfig.description}
            </p>

            <div className="flex items-center gap-2" role="group" aria-label="Redes sociais">
              {socialLinks.map(({ href, label, icon: Icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center min-h-[44px] min-w-[44px] text-muted-foreground hover:text-primary transition-colors rounded-full hover:bg-white/10 md:min-h-11 md:min-w-11"
                  aria-label={label}
                >
                  <Icon className="h-5 w-5 md:h-6 md:w-6" />
                </a>
              ))}
            </div>
          </div>

          <FooterSection id="footer-plataforma" title="Plataforma" links={siteConfig.footerParams.platform} />
          <FooterSection id="footer-fotografos" title="Fotógrafos" links={siteConfig.footerParams.photographers} />
          <FooterSection id="footer-suporte" title="Suporte" links={siteConfig.footerParams.support} />
        </div>

        <Separator className="mb-8 bg-white/10" />

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-muted-foreground order-2 md:order-1">
            © {currentYear} {siteConfig.name}. Todos os direitos reservados.
          </p>
          <p className="text-xs text-muted-foreground order-1 md:order-2">
            Feito com <span className="text-primary">♥</span> para criadores
          </p>
        </div>
      </div>
    </footer>
  );
}

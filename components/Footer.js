import Link from "next/link";
import { siteConfig } from "@/config/site";

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-black pt-20 pb-10">
      <div className="container-wide">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4 lg:gap-16 mb-16">
          <div className="flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
                <span className="text-xl font-black">GT</span>
              </div>
              <span className="text-2xl font-black tracking-tighter text-white">
                CLICKS
              </span>
            </Link>
            <p className="text-base leading-relaxed text-muted-foreground max-w-xs">
              {siteConfig.description}
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-white/50">
              Plataforma
            </h4>
            <ul className="flex flex-col gap-3 text-base text-muted-foreground">
              {siteConfig.footerParams.platform.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="transition-colors hover:text-white hover:translate-x-1 inline-block">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-white/50">
              Fotógrafos
            </h4>
            <ul className="flex flex-col gap-3 text-base text-muted-foreground">
              {siteConfig.footerParams.photographers.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="transition-colors hover:text-white hover:translate-x-1 inline-block">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-white/50">
              Suporte
            </h4>
            <ul className="flex flex-col gap-3 text-base text-muted-foreground">
              {siteConfig.footerParams.support.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="transition-colors hover:text-white hover:translate-x-1 inline-block">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {siteConfig.name}. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-sm text-muted-foreground">Feito com ❤️ para criadores</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

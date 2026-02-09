import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section
      className="relative flex min-h-[85vh] sm:min-h-[90vh] flex-col items-center justify-center overflow-hidden px-4 py-16 sm:px-6 sm:py-20 text-center"
      style={{ paddingTop: "max(4rem, env(safe-area-inset-top))" }}
    >
      <div className="absolute inset-0 -z-20">
        <Image
          src="/hero-gtclicks.webp"
          alt="Background"
          fill
          className="object-cover object-top"
          priority
          fetchPriority="high"
          quality={75}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1920px"
        />
      </div>
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-surface-page/70 via-surface-page/60 to-surface-page" />

      <div className="z-10 flex max-w-5xl flex-col items-center gap-space-8 animate-in fade-in zoom-in duration-700 pt-space-12 md:pt-32 px-space-4">
        <h1 className="heading-display font-display text-2xl sm:text-4xl md:text-6xl lg:text-7xl uppercase tracking-tighter leading-tight sm:leading-[0.85]">
          FOTOS DE ESPORTES,
          <br />
          <span className="text-action-primary">JOGOS E CAMPEONATOS</span>
        </h1>

        <p className="max-w-2xl text-text-lg text-text-secondary md:text-text-xl leading-relaxed font-font-medium drop-shadow-md">
          Encontre seus registros ou monetize sua arte como fotógrafo
          profissional.
        </p>

        <div className="mt-8 flex flex-col w-full sm:w-auto sm:flex-row gap-4 sm:gap-6">
          <Button
            asChild
            size="lg"
            className="h-14 sm:h-16 min-h-[48px] px-8 sm:px-10 w-full sm:w-auto rounded-full font-black uppercase tracking-widest text-sm active:scale-[0.98] transition-transform touch-manipulation"
          >
            <Link href="/busca">Comprar fotos</Link>
          </Button>
          <Button
            asChild
            variant="secondary"
            size="lg"
            className="h-14 sm:h-16 min-h-[48px] px-8 sm:px-10 w-full sm:w-auto rounded-full font-black uppercase tracking-widest text-sm active:scale-[0.98] transition-transform touch-manipulation"
          >
            <Link href="/como-funciona">Vender fotos</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function HeroSection() {
  return (
    <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-space-6 py-space-20 text-center">
      <div className="absolute inset-0 -z-20">
        <Image
          src="/hero-gtclicks.png"
          alt="Background"
          fill
          className="object-cover object-top"
          priority
          quality={85}
          sizes="100vw"
        />
      </div>
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-surface-page/70 via-surface-page/60 to-surface-page" />

      <div className="z-10 flex max-w-5xl flex-col items-center gap-space-8 animate-in fade-in zoom-in duration-700 pt-space-12 md:pt-32 px-space-4">
        <h1 className="heading-display font-display text-text-4xl sm:text-text-4xl md:text-text-5xl lg:text-text-6xl uppercase tracking-tighter leading-tight sm:leading-[0.85]">
          FOTOS DE ESPORTES,
          <br />
          <span className="text-action-primary">JOGOS E CAMPEONATOS</span>
        </h1>

        <p className="max-w-2xl text-text-lg text-text-secondary md:text-text-xl leading-relaxed font-font-medium drop-shadow-md">
          Encontre seus registros instantaneamente com nossa busca por IA
          <br className="hidden sm:block" />
          ou monetize sua arte como fotógrafo profissional.
        </p>

        <div className="mt-space-8 flex flex-col w-full sm:w-auto sm:flex-row gap-space-6">
          <Button
            asChild
            size="lg"
            className="h-14 px-6 sm:px-10 uppercase tracking-wider"
          >
            <Link href="/busca">Comprar fotos</Link>
          </Button>
          <Button
            asChild
            variant="secondary"
            size="lg"
            className="h-14 px-6 sm:px-10 uppercase tracking-wider backdrop-blur-sm"
          >
            <Link href="/cadastro?callbackUrl=/dashboard/fotografo/onboarding">
              Vender fotos
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

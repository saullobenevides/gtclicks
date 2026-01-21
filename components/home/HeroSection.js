import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function HeroSection() {
  return (
    <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
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
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-black/70 via-black/60 to-black" />

      <div className="z-10 flex max-w-5xl flex-col items-center gap-8 animate-in fade-in zoom-in duration-700 pt-32 md:pt-96">
        <h1 className="heading-display font-display text-4xl xs:text-5xl font-black text-white sm:text-7xl md:text-8xl lg:text-8xl">
          CAPTURE MOMENTOS,
          <br />
          <span style={{ color: "#FF0000" }}>VENDA ARTE!</span>
        </h1>

        <p className="max-w-2xl text-lg text-gray-300 md:text-xl leading-relaxed font-medium drop-shadow-md">
          O marketplace definitivo para fotógrafos e criadores.
          <br className="hidden sm:block" />
          Compre e venda fotos exclusivas com segurança e rapidez.
        </p>

        <div className="mt-8 flex flex-col w-full sm:w-auto sm:flex-row gap-5">
          <Button
            asChild
            size="lg"
            className="h-14 px-10 text-base font-bold bg-transparent text-white hover:text-white transition-all duration-300 uppercase tracking-wider"
            style={{ borderWidth: "2px", borderColor: "#FF0000" }}
          >
            <Link href="/busca" className="hover:bg-[#FF0000]!">
              Comprar fotos
            </Link>
          </Button>
          <Button
            asChild
            variant="secondary"
            size="lg"
            className="h-14 px-10 text-base font-bold bg-white/10 border-2 border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all duration-300 backdrop-blur-sm uppercase tracking-wider"
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

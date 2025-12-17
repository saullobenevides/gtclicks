import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function HeroSection() {
  return (
    <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-6 text-center">
      {/* Dynamic Background */}
      <div className="absolute inset-0 -z-20 bg-black" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-black/50 to-black" />
      <div className="absolute inset-0 -z-10 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

      <div className="z-10 flex max-w-5xl flex-col items-center gap-8 animate-in fade-in zoom-in duration-700">
        <Badge variant="outline" className="border-primary/50 text-primary bg-primary/10 px-6 py-2 text-sm uppercase tracking-[0.2em] backdrop-blur-sm">
          Marketplace Premium
        </Badge>
        
        <h1 className="text-4xl xs:text-5xl font-black tracking-tighter text-white sm:text-7xl md:text-8xl lg:text-9xl leading-[0.9]">
          CAPTURE <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-600">MOMENTOS</span>
          <br />
          VENDA <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">ARTE</span>
        </h1>
        
        <p className="max-w-2xl text-xl text-gray-400 md:text-2xl leading-relaxed font-light">
          A plataforma definitiva para fotógrafos profissionais. 
          Compre e venda imagens exclusivas com segurança e estilo.
        </p>
        
        <div className="mt-10 flex flex-col w-full sm:w-auto sm:flex-row gap-6">
          <Button asChild size="lg" className="h-14 px-10 text-lg bg-primary hover:bg-primary/90 text-white shadow-[0_0_30px_rgba(239,35,60,0.3)] hover:shadow-[0_0_50px_rgba(239,35,60,0.5)] transition-all hover:-translate-y-1">
            <Link href="/busca">Explorar Galeria</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-14 px-10 text-lg border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20 backdrop-blur-sm transition-all hover:-translate-y-1">
            <Link href="/cadastro">Começar a Vender</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Camera,
  Upload,
  DollarSign,
  ChevronRight,
  CheckCircle2,
  Search,
  Smartphone,
  Download,
  Zap,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  Globe,
  Lock,
  Image as ImageIcon,
} from "lucide-react";

export default function ComoFuncionaPage() {
  const [comissaoFotografo, setComissaoFotografo] = useState(85);

  useEffect(() => {
    fetch("/api/config/public")
      .then((res) => res.json())
      .then((data) => {
        if (data.comissaoFotografo) {
          setComissaoFotografo(data.comissaoFotografo);
        }
      })
      .catch(() => {
        // Keep default on error
      });
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative pt-24 pb-12 overflow-hidden">
        <div className="container-wide relative z-10 text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-1 text-[10px]">
            Central de Ajuda GTClicks
          </Badge>
          <h1 className="heading-display font-display text-4xl font-black text-white sm:text-5xl md:text-6xl lg:text-7xl uppercase tracking-tighter leading-[0.85] mb-6">
            Como podemos <br />
            <span className="text-primary">ajudar você?</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-zinc-400 mb-12">
            Selecione seu perfil abaixo para ver como a plataforma funciona para
            você.
          </p>

          <Tabs defaultValue="fotografo" className="w-full max-w-5xl mx-auto">
            <div className="flex justify-center mb-16">
              <TabsList className="bg-white/5 border border-white/10 p-1 rounded-full h-auto">
                <TabsTrigger
                  value="fotografo"
                  className="rounded-full px-8 py-3 text-lg font-bold data-[state=active]:bg-primary! data-[state=active]:text-white! transition-all flex items-center gap-2"
                >
                  <Camera className="h-5 w-5" />
                  Sou Fotógrafo
                </TabsTrigger>
                <TabsTrigger
                  value="atleta"
                  className="rounded-full px-8 py-3 text-lg font-bold data-[state=active]:bg-primary! data-[state=active]:text-white! transition-all flex items-center gap-2"
                >
                  <Search className="h-5 w-5" />
                  Sou Atleta
                </TabsTrigger>
              </TabsList>
            </div>

            {/* TAB FOTÓGRAFO */}
            <TabsContent
              value="fotografo"
              className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              {/* Feature Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="glass-card p-8 rounded-2xl border-primary/20 hover:border-primary/50 transition-colors">
                  <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center mb-6">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    {comissaoFotografo}% de Comissão
                  </h3>
                  <p className="text-zinc-400">
                    Você fica com a maior parte do valor. Sem mensalidades ou
                    taxas escondidas.
                  </p>
                </div>

                <div className="glass-card p-8 rounded-2xl border-primary/20 hover:border-primary/50 transition-colors">
                  <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center mb-6">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    Pix Automático
                  </h3>
                  <p className="text-zinc-400">
                    Solicite seu saque a qualquer momento e receba na hora em
                    sua conta.
                  </p>
                </div>

                <div className="glass-card p-8 rounded-2xl border-primary/20 hover:border-primary/50 transition-colors">
                  <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center mb-6">
                    <Lock className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    Proteção Total
                  </h3>
                  <p className="text-zinc-400">
                    Marca d&apos;água automática em todas as fotos e bloqueio de
                    download sem pagamento.
                  </p>
                </div>
              </div>

              {/* Step by Step */}
              <div className="bg-white/5 rounded-3xl p-8 md:p-12 border border-white/5">
                <h2 className="heading-display text-3xl font-black text-white text-center mb-12">
                  Comece em 3 Passos
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                  <div className="hidden md:block absolute top-6 left-[15%] right-[15%] h-0.5 bg-dashed border-t-2 border-dashed border-white/10" />

                  {[
                    {
                      step: 1,
                      title: "Crie sua Conta",
                      desc: "Cadastro rápido e gratuito.",
                    },
                    {
                      step: 2,
                      title: "Faça Upload",
                      desc: "Crie álbuns e suba suas fotos.",
                    },
                    {
                      step: 3,
                      title: "Comece a Vender",
                      desc: "Compartilhe o link e lucre.",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="relative flex flex-col items-center text-center z-10"
                    >
                      <div className="w-12 h-12 rounded-full bg-zinc-900 border-2 border-primary flex items-center justify-center text-xl font-bold text-white mb-4 shadow-xl shadow-black/50">
                        {item.step}
                      </div>
                      <h4 className="text-lg font-bold text-white mb-2">
                        {item.title}
                      </h4>
                      <p className="text-zinc-500 text-sm">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="text-center py-8">
                <Button
                  asChild
                  size="lg"
                  className="h-16 px-12 rounded-full text-lg shadow-xl scale-100 hover:scale-105 transition-all"
                >
                  <Link href="/cadastro">
                    Quero Vender Minhas Fotos
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <p className="mt-4 text-xs text-zinc-500">
                  Grátis para começar. Cancele quando quiser.
                </p>
              </div>
            </TabsContent>

            {/* TAB ATLETA */}
            <TabsContent
              value="atleta"
              className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              {/* Feature Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="glass-card p-8 rounded-2xl border-primary/20 hover:border-primary/50 transition-colors">
                  <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center mb-6">
                    <Search className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    Busca Inteligente
                  </h3>
                  <p className="text-zinc-400">
                    Encontre suas fotos usando filtros de local, data ou
                    reconhecimento facial.
                  </p>
                </div>

                <div className="glass-card p-8 rounded-2xl border-primary/20 hover:border-primary/50 transition-colors">
                  <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center mb-6">
                    <ImageIcon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    Alta Resolução
                  </h3>
                  <p className="text-zinc-400">
                    Receba os arquivos originais com qualidade máxima para
                    impressão ou redes sociais.
                  </p>
                </div>

                <div className="glass-card p-8 rounded-2xl border-primary/20 hover:border-primary/50 transition-colors">
                  <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center mb-6">
                    <CreditCard className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    Pagamento Fácil
                  </h3>
                  <p className="text-zinc-400">
                    Pague via Pix e receba o link de download instantaneamente
                    no seu e-mail.
                  </p>
                </div>
              </div>

              {/* Step by Step */}
              <div className="bg-white/5 rounded-3xl p-8 md:p-12 border border-white/5">
                <h2 className="heading-display text-3xl font-black text-white text-center mb-12">
                  Encontre sua Foto
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                  <div className="hidden md:block absolute top-6 left-[15%] right-[15%] h-0.5 bg-dashed border-t-2 border-dashed border-white/10" />

                  {[
                    {
                      step: 1,
                      title: "Busque o Evento",
                      desc: "Navegue pelo local ou data.",
                    },
                    {
                      step: 2,
                      title: "Escolha as Fotos",
                      desc: "Selecione seus melhores clicks.",
                    },
                    {
                      step: 3,
                      title: "Receba na Hora",
                      desc: "Pagou, baixou. Simples assim.",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="relative flex flex-col items-center text-center z-10"
                    >
                      <div className="w-12 h-12 rounded-full bg-zinc-900 border-2 border-primary flex items-center justify-center text-xl font-bold text-white mb-4 shadow-xl shadow-black/50">
                        {item.step}
                      </div>
                      <h4 className="text-lg font-bold text-white mb-2">
                        {item.title}
                      </h4>
                      <p className="text-zinc-500 text-sm">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="text-center py-8">
                <Button
                  asChild
                  size="lg"
                  className="h-16 px-12 rounded-full text-lg shadow-xl scale-100 hover:scale-105 transition-all"
                >
                  <Link href="/busca">
                    Buscar Minhas Fotos
                    <Search className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-24 border-t border-white/5 bg-zinc-950">
        <div className="container px-4 text-center">
          <h2 className="heading-display text-2xl md:text-3xl font-black text-white mb-6">
            Ainda com dúvidas?
          </h2>
          <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
            Nossa equipe de suporte está pronta para ajudar você a tirar o
            máximo proveito da plataforma.
          </p>
          <div className="flex justify-center gap-4">
            <Button
              asChild
              variant="outline"
              className="rounded-full border-white/10"
            >
              <Link href="/faq">Ver Perguntas Frequentes</Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="rounded-full text-zinc-400 hover:text-white"
            >
              <Link href="/contato">Fale Conosco</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

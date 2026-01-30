import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Camera,
  DollarSign,
  ChevronRight,
  Search,
  Zap,
  Lock,
  Image as ImageIcon,
  CreditCard,
  Shield,
  UploadCloud,
  Check,
  Sparkles,
} from "lucide-react";
import { stackServerApp } from "@/stack/server";
import prisma from "@/lib/prisma";
import { getConfigNumber, CONFIG_KEYS } from "@/lib/config";
import StandardFaq from "@/components/shared/StandardFaq";

import { PageSection, SectionHeader } from "@/components/shared/layout";

export default async function ComoFuncionaPage() {
  const user = await stackServerApp.getUser();

  // Fetch dynamic commission rates
  const taxaPlataforma = await getConfigNumber(CONFIG_KEYS.TAXA_PLATAFORMA);
  const comissaoFotografo = 100 - taxaPlataforma;

  let hasProfile = false;
  if (user) {
    const fotografo = await prisma.fotografo.findUnique({
      where: { userId: user.id },
    });
    hasProfile = !!fotografo;
  }

  const athleteSteps = [
    {
      title: "Busca Inteligente",
      description:
        "Utilize nossa busca por IA para encontrar suas fotos de forma rápida e precisa através de uma única selfie.",
      icon: Search,
    },
    {
      title: "Escolha e Compre",
      description:
        "Navegue pelas suas fotos, selecione as melhores e finalize a compra com segurança.",
      icon: Camera,
    },
    {
      title: "Receba na Hora",
      description:
        "Após o pagamento, o link para download das fotos em alta qualidade é liberado instantaneamente.",
      icon: Sparkles,
    },
  ];

  return (
    <PageSection variant="default" containerWide className="min-h-screen">
      <SectionHeader
        isLanding
        badge="Central de Ajuda GTClicks"
        title={
          <>
            Como podemos <br />
            <span className="text-primary">ajudar você?</span>
          </>
        }
        description="Selecione seu perfil abaixo para ver como a plataforma funciona para você."
      />

      <Tabs defaultValue="fotografo" className="w-full max-w-5xl mx-auto">
        <div className="flex justify-center px-4">
          <TabsList className="bg-surface-subtle border border-border-subtle p-1 h-16 rounded-full w-full max-w-md md:w-auto flex">
            <TabsTrigger
              value="fotografo"
              className="flex-1 md:flex-none rounded-full px-6 md:px-10 h-14 border-2 border-transparent data-[state=active]:bg-surface-page data-[state=active]:border-primary data-[state=active]:text-white font-black uppercase tracking-widest text-[10px] md:text-xs gap-3 transition-all"
            >
              <Camera className="h-5 w-5" />
              <span className="hidden sm:inline">Sou </span>Fotógrafo
            </TabsTrigger>
            <TabsTrigger
              value="atleta"
              className="flex-1 md:flex-none rounded-full px-6 md:px-10 h-14 border-2 border-transparent data-[state=active]:bg-surface-page data-[state=active]:border-primary data-[state=active]:text-white font-black uppercase tracking-widest text-[10px] md:text-xs gap-3 transition-all"
            >
              <Search className="h-5 w-5" />
              <span className="hidden sm:inline">Sou </span>Atleta
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB FOTÓGRAFO - Merged content from /cadastro */}
        <TabsContent
          value="fotografo"
          className="space-y-20 animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-8 rounded-2xl border-primary/20 hover:border-primary/50 transition-colors">
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center mb-6">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {comissaoFotografo}% de Lucro
              </h3>
              <p className="text-zinc-400">
                A maior taxa do mercado. Você fica com a maior parte do valor de
                cada venda, com transparência total via Pix.
              </p>
            </div>

            <div className="glass-card p-8 rounded-2xl border-primary/20 hover:border-primary/50 transition-colors">
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center mb-6">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Proteção Anti-Cópia
              </h3>
              <p className="text-zinc-400">
                Suas fotos são protegidas automaticamente com marca d&apos;água
                inteligente em todas as visualizações.
              </p>
            </div>

            <div className="glass-card p-8 rounded-2xl border-primary/20 hover:border-primary/50 transition-colors">
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center mb-6">
                <UploadCloud className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Upload Inteligente
              </h3>
              <p className="text-zinc-400">
                Arraste e solte suas fotos. Nossa IA organiza e sugere preços
                ideais para suas coleções.
              </p>
            </div>
          </div>

          {/* Step by Step */}
          <div className="bg-white/5 rounded-3xl p-8 md:p-12 border border-white/5">
            <h2 className="heading-display text-3xl font-black text-white text-center mb-12">
              Comece em 3 Passos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              <div className="hidden md:block absolute top-6 left-[15%] right-[15%] h-0.5 border-t-2 border-dashed border-white/10" />

              {[
                {
                  step: 1,
                  title: "Crie sua Conta",
                  desc: "Cadastre-se grátis e configure seu perfil profissional em segundos.",
                },
                {
                  step: 2,
                  title: "Publique Coleções",
                  desc: "Faça upload das fotos dos seus eventos. Gere links exclusivos.",
                },
                {
                  step: 3,
                  title: "Receba Pix",
                  desc: "Vendeu? O dinheiro cai na sua conta. Saque via Pix instantaneamente.",
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

          {/* Specific Seller FAQ */}
          <div className="max-w-4xl mx-auto">
            <h2 className="heading-display text-2xl font-black text-white text-center mb-12">
              Dúvidas Frequentes dos Fotógrafos
            </h2>
            <StandardFaq
              items={[
                {
                  question: "Quanto custa para começar?",
                  answer:
                    "Absolutamente nada. Não cobramos mensalidade nem taxa de adesão. Você só paga uma comissão quando realiza uma venda.",
                },
                {
                  question: "Qual a taxa da plataforma?",
                  answer: `Cobramos apenas ${taxaPlataforma}% de taxa administrativa sobre as vendas. Você fica com ${comissaoFotografo}% do valor total.`,
                },
                {
                  question: "Quando posso sacar?",
                  answer:
                    "Assim que tiver R$ 50,00 de saldo liberado, você pode solicitar o saque via Pix que cai na hora.",
                },
                {
                  question: "Preciso de CNPJ?",
                  answer:
                    "Não! Você pode se cadastrar e receber como Pessoa Física (CPF) sem problemas.",
                },
              ]}
            />
          </div>

          {/* CTA Section */}
          <div className="text-center py-8">
            <Button
              asChild
              size="lg"
              className="h-16 px-12 rounded-full text-lg shadow-xl hover:scale-105 transition-all"
            >
              <Link
                href={
                  user
                    ? hasProfile
                      ? "/dashboard/fotografo/colecoes"
                      : "/dashboard/fotografo/onboarding"
                    : "/registrar?callbackUrl=/dashboard/fotografo/onboarding"
                }
              >
                {user
                  ? hasProfile
                    ? "Acessar Dashboard"
                    : "Criar Meu Perfil"
                  : "Começar Gratuitamente"}
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <p className="mt-4 text-xs text-zinc-500 italic">
              Junte-se a centenas de fotógrafos que já vendem no GTClicks.
            </p>
          </div>
        </TabsContent>

        {/* TAB ATLETA */}
        <TabsContent
          value="atleta"
          className="space-y-20 animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-8 rounded-2xl border-primary/20 hover:border-primary/50 transition-colors">
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center mb-6">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Busca Inteligente
              </h3>
              <p className="text-zinc-400">
                Encontre suas fotos usando filtros de local, data ou
                reconhecimento facial por IA.
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
                Receba os arquivos originais com qualidade máxima para impressão
                ou redes sociais.
              </p>
            </div>

            <div className="glass-card p-8 rounded-2xl border-primary/20 hover:border-primary/50 transition-colors">
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center mb-6">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Pagamento Instantâneo
              </h3>
              <p className="text-zinc-400">
                Pague via Pix e receba o link de download na hora em seu e-mail
                e painel pessoal.
              </p>
            </div>
          </div>

          {/* Step by Step */}
          <div className="bg-white/5 rounded-3xl p-8 md:p-12 border border-white/5">
            <h2 className="heading-display text-3xl font-black text-white text-center mb-12">
              Encontre sua Foto
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              <div className="hidden md:block absolute top-6 left-[15%] right-[15%] h-0.5 border-t-2 border-dashed border-white/10" />

              {[
                {
                  step: 1,
                  title: "Busque o Evento",
                  desc: "Navegue pelo local, data ou use o mapa para encontrar os clicks.",
                },
                {
                  step: 2,
                  title: "Escolha as Fotos",
                  desc: "Adicione ao carrinho ou compre álbuns completos com desconto.",
                },
                {
                  step: 3,
                  title: "Receba na Hora",
                  desc: "Finalize via Pix e baixe em alta resolução imediatamente.",
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
              className="h-16 px-12 rounded-full text-lg shadow-xl hover:scale-105 transition-all"
            >
              <Link href="/busca">
                Buscar Minhas Fotos
                <Search className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </TabsContent>
      </Tabs>
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
    </PageSection>
  );
}

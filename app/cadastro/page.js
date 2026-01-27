import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { stackServerApp } from "@/stack/server";
import prisma from "@/lib/prisma";
import { Camera, DollarSign, Shield, ChevronRight, Check } from "lucide-react";
import StandardFaq from "@/components/shared/StandardFaq";
import { getConfigNumber, CONFIG_KEYS } from "@/lib/config";

export default async function CadastroPage() {
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

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-20 overflow-hidden">
        {/* Background Gradients */}

        <div className="container mx-auto px-4 relative z-10 text-center">
          <Badge variant="secondary" className="mb-8 animate-fade-in">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse mr-2"></span>
            Nova Plataforma para Fotógrafos
          </Badge>

          <h1 className="heading-display font-display text-4xl font-black text-white sm:text-5xl md:text-6xl lg:text-7xl uppercase tracking-tighter leading-[0.85] animate-slide-up">
            Transforme seus <br />
            <span className="text-primary">clicks em lucro</span>
          </h1>

          <p
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            A plataforma mais completa para vender suas fotos. Crie coleções
            exclusivas, proteja seu trabalho e receba pagamentos via Pix
            automaticamente.
          </p>

          <div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            {user ? (
              hasProfile ? (
                <Button
                  asChild
                  size="lg"
                  className="w-full sm:w-auto h-14 px-8 text-lg rounded-full shadow-lg"
                >
                  <Link href="/dashboard/fotografo/colecoes">
                    Acessar Dashboard
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
              ) : (
                <Button
                  asChild
                  size="lg"
                  className="w-full sm:w-auto h-14 px-8 text-lg rounded-full shadow-lg"
                >
                  <Link href="/dashboard/fotografo/onboarding">
                    Criar Perfil de Fotógrafo
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
              )
            ) : (
              <>
                <Button
                  asChild
                  size="lg"
                  className="w-full sm:w-auto h-14 px-8 text-lg rounded-full shadow-lg"
                >
                  <Link href="/registrar?callbackUrl=/dashboard/fotografo/onboarding">
                    Começar Gratuitamente
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto h-14 px-8 text-lg rounded-full border-white/10 hover:bg-white/5 bg-transparent"
                >
                  <Link href="/login?callbackUrl=/dashboard/fotografo/onboarding">
                    Já tenho conta
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section id="beneficios" className="py-16 md:py-24 relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-8 rounded-2xl md:col-span-1 group hover:border-primary/50 transition-colors duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">
                {comissaoFotografo}% de Lucro
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                A maior taxa do mercado. Você fica com a maior parte do valor de
                cada venda, com transparência total.
              </p>
            </div>

            <div className="glass-card p-8 rounded-2xl md:col-span-1 group hover:border-primary/50 transition-colors duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Proteção Anti-Cópia</h3>
              <p className="text-muted-foreground leading-relaxed">
                Suas fotos são protegidas automaticamente com marca d&apos;água
                inteligente em todas as visualizações.
              </p>
            </div>

            <div className="glass-card p-8 rounded-2xl md:col-span-1 group hover:border-primary/50 transition-colors duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <Camera className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Upload Simpson</h3>
              <p className="text-muted-foreground leading-relaxed">
                Arraste e solte suas fotos. Nossa IA organiza e sugere preços
                ideais para suas coleções.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="como-funciona"
        className="py-16 md:py-24 bg-white/5 border-y border-white/5"
      >
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="heading-section font-display text-3xl font-black text-white sm:text-4xl mb-6">
              Como funciona
            </h2>
            <p className="text-muted-foreground text-lg">
              Em apenas três passos você começa a monetizar seu trabalho
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connector Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-linear-to-r from-transparent via-primary/30 to-transparent border-t border-dashed border-white/20" />

            <div className="relative text-center">
              <div className="w-24 h-24 mx-auto glass-card rounded-full flex items-center justify-center mb-6 relative z-10 shadow-xl shadow-black/50">
                <span className="text-3xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Crie sua Conta</h3>
              <p className="text-muted-foreground px-4">
                Cadastre-se grátis e configure seu perfil profissional em
                segundos.
              </p>
            </div>

            <div className="relative text-center">
              <div className="w-24 h-24 mx-auto glass-card rounded-full flex items-center justify-center mb-6 relative z-10 shadow-xl shadow-black/50">
                <span className="text-3xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Publique Coleções</h3>
              <p className="text-muted-foreground px-4">
                Faça upload das fotos dos seus eventos. Gere links exclusivos.
              </p>
            </div>

            <div className="relative text-center">
              <div className="w-24 h-24 mx-auto glass-card rounded-full flex items-center justify-center mb-6 relative z-10 shadow-xl shadow-black/50">
                <span className="text-3xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Receba Pix</h3>
              <p className="text-muted-foreground px-4">
                Vendeu? O dinheiro cai na sua conta. Saques via Pix a qualquer
                momento.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="heading-section font-display text-3xl font-black text-white sm:text-4xl mb-12 text-center">
            Dúvidas Frequentes
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
      </section>
    </div>
  );
}

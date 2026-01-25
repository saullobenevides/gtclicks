import Link from "next/link";
import { Button } from "@/components/ui/button";
import { stackServerApp } from "@/stack/server";
import prisma from "@/lib/prisma";
import { Camera, DollarSign, Shield, ChevronRight, Check } from "lucide-react";

export default async function CadastroPage() {
  const user = await stackServerApp.getUser();

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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/20 blur-[120px] rounded-full opacity-20 pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium mb-8 animate-fade-in">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
            Nova Plataforma para Fotógrafos
          </div>

          <h1 className="heading-display font-display text-4xl font-black text-white sm:text-5xl md:text-7xl animate-slide-up">
            Transforme seus <br />
            <span className="text-gradient-primary">clicks em lucro</span>
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
                  className="w-full sm:w-auto h-14 px-8 text-lg rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
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
                  className="w-full sm:w-auto h-14 px-8 text-lg rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
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
                  className="w-full sm:w-auto h-14 px-8 text-lg rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
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
      <section className="py-16 md:py-24 relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-8 rounded-2xl md:col-span-1 group hover:border-primary/50 transition-colors duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">80% de Lucro</h3>
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
      <section className="py-16 md:py-24 bg-white/5 border-y border-white/5">
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
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="heading-section font-display text-3xl font-black text-white sm:text-4xl mb-12 text-center">
            Dúvidas Frequentes
          </h2>

          <div className="space-y-4">
            {[
              {
                q: "Quanto custa para começar?",
                a: "Absolutamente nada. Não cobramos mensalidade nem taxa de adesão. Você só paga uma comissão quando realiza uma venda.",
              },
              {
                q: "Qual a taxa da plataforma?",
                a: "Cobramos apenas 20% de taxa administrativa sobre as vendas. Você fica com 80% do valor total.",
              },
              {
                q: "Quando posso sacar?",
                a: "Assim que tiver R$ 50,00 de saldo liberado, você pode solicitar o saque via Pix que cai na hora.",
              },
              {
                q: "Preciso de CNPJ?",
                a: "Não! Você pode se cadastrar e receber como Pessoa Física (CPF) sem problemas.",
              },
            ].map((faq, i) => (
              <div
                key={i}
                className="glass-card rounded-xl p-6 hover:bg-white/5 transition-colors"
              >
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                  <div className="bg-primary/20 p-1 rounded-full">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  {faq.q}
                </h3>
                <p className="text-muted-foreground pl-8">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

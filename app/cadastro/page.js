import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { stackServerApp } from "@/stack/server";
import prisma from "@/lib/prisma";

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
    <div className="container">
      <section className="py-16">
        <div className="text-center mb-16">
          <Badge>Seja Fotógrafo</Badge>
          <h1 className="text-5xl md:text-6xl font-bold my-4 bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-400 leading-tight">
            Transforme a cobertura do seu evento em lucro
          </h1>
          <p className="text-xl text-body max-w-3xl mx-auto">
            Fez a cobertura de um jogo ou festa? Crie uma coleção, envie o link para os participantes 
            e veja as vendas acontecerem automaticamente.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-8 bg-card border rounded-md transition hover:-translate-y-1 hover:shadow-lg">
            <div className="text-5xl mb-4">📸</div>
            <h3 className="text-xl font-bold my-4 text-heading">Você no controle</h3>
            <p className="text-body leading-relaxed">Defina seus próprios preços e mantenha 80% de cada venda</p>
          </div>
          <div className="text-center p-8 bg-card border rounded-md transition hover:-translate-y-1 hover:shadow-lg">
            <div className="text-5xl mb-4">💰</div>
            <h3 className="text-xl font-bold my-4 text-heading">Pagamentos rápidos</h3>
            <p className="text-body leading-relaxed">Receba via Pix ou transferência bancária com saque mínimo de R$ 50</p>
          </div>
          <div className="text-center p-8 bg-card border rounded-md transition hover:-translate-y-1 hover:shadow-lg">
            <div className="text-5xl mb-4">🛡️</div>
            <h3 className="text-xl font-bold my-4 text-heading">Proteção automática</h3>
            <p className="text-body leading-relaxed">Suas fotos são protegidas com marca d&apos;água e anti-cópia</p>
          </div>
        </div>

        <div className="text-center p-12 rounded-lg my-16 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
          {user ? (
            hasProfile ? (
              <div className="max-w-lg mx-auto">
                <p className="text-lg text-green-500 mb-6">✅ Você já tem um perfil de fotógrafo!</p>
                <Button asChild>
                  <Link href="/dashboard/fotografo/colecoes">
                    Gerenciar Coleções
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="max-w-lg mx-auto">
                <h2 className="text-3xl font-bold mb-4 text-heading">Crie seu perfil agora</h2>
                <p className="text-lg text-body mb-8">Clique abaixo para começar. Vamos criar seu perfil automaticamente.</p>
                <Button asChild>
                  <Link href="/dashboard/fotografo/colecoes">
                    Criar Meu Perfil de Fotógrafo
                  </Link>
                </Button>
              </div>
            )
          ) : (
            <div className="max-w-lg mx-auto">
              <h2 className="text-3xl font-bold mb-4 text-heading">Pronto para começar?</h2>
              <p className="text-lg text-body mb-8">Faça login ou crie uma conta para começar a vender suas fotos.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                  <Link href="/registrar">
                    Criar Conta Grátis
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/login">
                    Já tenho conta
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="my-16 text-center">
          <h2 className="text-4xl font-bold mb-12 text-heading">Como funciona</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="relative p-8">
              <div className="w-16 h-16 bg-accent text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">1</div>
              <h3 className="text-xl font-bold mb-3 text-heading">Crie seu perfil</h3>
              <p className="text-body leading-relaxed">Cadastre-se gratuitamente e crie seu perfil de fotógrafo</p>
            </div>
            <div className="relative p-8">
              <div className="w-16 h-16 bg-accent text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">2</div>
              <h3 className="text-xl font-bold mb-3 text-heading">Faça upload</h3>
              <p className="text-body leading-relaxed">Envie suas melhores fotos e defina os preços</p>
            </div>
            <div className="relative p-8">
              <div className="w-16 h-16 bg-accent text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">3</div>
              <h3 className="text-xl font-bold mb-3 text-heading">Receba pagamentos</h3>
              <p className="text-body leading-relaxed">Quando alguém comprar, você recebe 80% do valor direto na sua conta</p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto my-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-heading">Perguntas frequentes</h2>
          <details className="bg-card border rounded-md p-6 mb-4 transition hover:border-accent">
            <summary className="font-semibold text-heading cursor-pointer text-lg">Quanto custa para vender no GTClicks?</summary>
            <p className="text-body leading-relaxed mt-4">É totalmente gratuito! Cobramos apenas 20% de comissão sobre cada venda realizada.</p>
          </details>
          <details className="bg-card border rounded-md p-6 mb-4 transition hover:border-accent">
            <summary className="font-semibold text-heading cursor-pointer text-lg">Como recebo meus pagamentos?</summary>
            <p className="text-body leading-relaxed mt-4">Você pode sacar via Pix ou transferência bancária sempre que tiver um saldo mínimo de R$ 50.</p>
          </details>
          <details className="bg-card border rounded-md p-6 mb-4 transition hover:border-accent">
            <summary className="font-semibold text-heading cursor-pointer text-lg">Minhas fotos ficam protegidas?</summary>
            <p className="text-body leading-relaxed mt-4">Sim! Aplicamos marca d&apos;água automática e proteção anti-cópia em todas as previews.</p>
          </details>
          <details className="bg-card border rounded-md p-6 mb-4 transition hover:border-accent">
            <summary className="font-semibold text-heading cursor-pointer text-lg">Posso definir meus próprios preços?</summary>
            <p className="text-body leading-relaxed mt-4">Absolutamente! Você tem total controle sobre os preços de cada licença das suas fotos.</p>
          </details>
        </div>
      </section>
    </div>
  );
}

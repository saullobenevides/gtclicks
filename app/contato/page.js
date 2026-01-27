import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Mail, MessageCircle, MapPin } from "lucide-react";

export const metadata = {
  title: "Fale Conosco",
  description: "Entre em contato com a equipe do GTClicks.",
};

export default function ContatoPage() {
  return (
    <div className="container-wide py-12 md:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="heading-display font-display text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
              Fale Conosco
            </h1>
            <p className="text-xl text-muted-foreground">
              Estamos aqui para ajudar. Envie sua dúvida, sugestão ou reporte um
              problema.
            </p>
          </div>

          <div className="grid gap-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-white">E-mail</CardTitle>
                  <CardDescription className="text-gray-400">
                    Suporte geral e parcerias
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <a
                  href="mailto:suporte@gtclicks.com"
                  className="text-lg font-medium text-white hover:text-primary transition-colors"
                >
                  suporte@gtclicks.com
                </a>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-white">WhatsApp</CardTitle>
                  <CardDescription className="text-gray-400">
                    Atendimento rápido (Seg-Sex, 9h-18h)
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <a
                  href="https://wa.me/5511999999999"
                  className="text-lg font-medium text-white hover:text-green-500 transition-colors"
                >
                  (11) 99999-9999
                </a>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Simple Form Placeholder - In a real app, this would connect to an API route or Resend */}
        <Card className="glass-panel border-white/10 p-6">
          <CardHeader>
            <CardTitle className="text-white">Envie uma mensagem</CardTitle>
            <CardDescription>Responderemos em até 24 horas.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="text-sm font-medium text-white"
                  >
                    Nome
                  </label>
                  <input
                    id="name"
                    className="flex h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Seu nome"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-white"
                  >
                    E-mail
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="flex h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="subject"
                  className="text-sm font-medium text-white"
                >
                  Assunto
                </label>
                <input
                  id="subject"
                  className="flex h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Sobre o que quer falar?"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="message"
                  className="text-sm font-medium text-white"
                >
                  Mensagem
                </label>
                <textarea
                  id="message"
                  className="flex min-h-[120px] w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Escreva sua mensagem..."
                />
              </div>
              <Button
                type="button"
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold"
              >
                Enviar Mensagem
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

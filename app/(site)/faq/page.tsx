import StandardFaq from "@/components/shared/StandardFaq";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata = {
  title: "Perguntas Frequentes (FAQ)",
  description: "Tire suas dúvidas sobre o GTClicks.",
};

export default function FAQPage() {
  return (
    <div className="container-wide px-4 py-12 md:py-24">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="text-center space-y-4 mb-12">
          <h1 className="heading-display font-display text-3xl font-black text-white sm:text-4xl md:text-5xl">
            Perguntas Frequentes
          </h1>
          <p className="text-xl text-muted-foreground">
            Encontre respostas rápidas para as dúvidas mais comuns.
          </p>
        </div>

        <StandardFaq
          items={[
            {
              question: "Como recebo as fotos que comprei?",
              answer:
                "Após a confirmação do pagamento, você receberá um e-mail com o link de download. Além disso, todas as suas compras ficam salvas na área 'Meus Downloads' dentro do seu perfil no site.",
            },
            {
              question: "Quais são as formas de pagamento?",
              answer:
                "Aceitamos PIX (aprovação imediata). Todas as transações são processadas com segurança pelo Asaas.",
            },
            {
              question: "Sou fotógrafo, quanto eu ganho?",
              answer:
                "O GTClicks oferece uma das melhores taxas do mercado. O fotógrafo recebe uma porcentagem competitiva do valor de cada venda realizada. O saldo é acumulado em sua carteira virtual.",
            },
            {
              question: "Posso usar as fotos comercialmente?",
              answer:
                "Depende da licença adquirida. A 'Licença de Uso Pessoal' é restrita a uso próprio. Para publicidade, sites de empresas ou materiais de marketing, você deve adquirir a 'Licença Comercial' ou 'Estendida', conforme disponível na foto.",
            },
            {
              question: "Como faço para vender minhas fotos?",
              answer:
                "Basta criar uma conta, acessar o painel 'Seja Fotógrafo' e completar seu cadastro. Após a aprovação, você poderá criar coleções e fazer upload de suas imagens, definindo os preços que desejar.",
            },
          ]}
        />

        <div className="flex justify-center pt-12">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">Ainda tem dúvidas?</p>
            <Button asChild size="lg" className="min-h-[48px] w-full sm:w-auto">
              <Link href="/contato">Fale Conosco</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

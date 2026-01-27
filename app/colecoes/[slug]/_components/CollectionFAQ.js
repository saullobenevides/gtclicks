import StandardFaq from "@/components/shared/StandardFaq";

const DEFAULT_FAQ = [
  {
    question: "Como recebo as fotos após a compra?",
    answer:
      "Após a confirmação do pagamento, você receberá um link para download das fotos em alta resolução no seu e-mail e também poderá baixá-las diretamente na área 'Meus Pedidos' do site.",
  },
  {
    question: "Quais as formas de pagamento?",
    answer:
      "Aceitamos pagamento via PIX (aprovação instantânea) e Cartão de Crédito.",
  },
  {
    question: "As fotos têm marca d'água?",
    answer:
      "As fotos de pré-visualização possuem marca d'água para proteção. Após a compra, você baixa os arquivos originais em alta qualidade, sem nenhuma marca.",
  },
  {
    question: "Posso compartilhar as fotos nas redes sociais?",
    answer:
      "Sim! Ao adquirir a foto, você recebe a licença de uso pessoal, permitindo a publicação em suas redes sociais e impressão para uso próprio.",
  },
];

export default function CollectionFAQ() {
  return (
    <section className="py-24 bg-secondary/5 border-t border-border/50">
      <div className="container px-4 md:px-6 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Perguntas Frequentes
          </h2>
          <p className="text-muted-foreground text-lg">
            Tire suas dúvidas sobre a compra de fotos
          </p>
        </div>

        <StandardFaq items={DEFAULT_FAQ} />
      </div>
    </section>
  );
}

import StandardFaq from "@/components/shared/StandardFaq";

export default function FAQSection() {
  const faqs = [
    {
      question: "Quanto custa para vender na GT Clicks?",
      answer:
        "Criar uma conta e publicar suas fotos é totalmente gratuito. Cobramos apenas uma pequena taxa de serviço sobre cada venda realizada.",
    },
    {
      question: "Em quanto tempo eu recebo o pagamento da foto vendida?",
      answer:
        "Os valores ficam disponíveis para saque 7 dias após a confirmação da venda.",
    },
    {
      question: "Como eu recebo meu pagamento?",
      answer:
        "Os pagamentos são processados via PIX diretamente para sua conta cadastrada.",
    },
    {
      question: "Minhas fotos estão protegidas?",
      answer:
        "Sim! Todas as fotos são exibidas com marca d'água e em baixa resolução para visualização. O arquivo original em alta resolução só é liberado após a confirmação do pagamento.",
    },
  ];

  return (
    <section className="py-16 sm:py-24 border-t border-white/10 bg-black/40">
      <div className="container-wide px-4 md:px-6">
        <div className="mb-16 flex flex-col items-center text-center gap-4">
          <h2 className="heading-display text-text-3xl md:text-text-4xl font-black text-text-primary uppercase tracking-tight">
            Perguntas <span className="text-action-primary">Frequentes</span>
          </h2>
          <div className="h-1 w-20 bg-action-primary rounded-full" />
        </div>

        <div className="max-w-3xl mx-auto">
          <StandardFaq items={faqs} />
        </div>
      </div>
    </section>
  );
}

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
    <section className="py-space-20">
      <div className="container max-w-3xl mx-auto px-space-6">
        <div className="mb-space-12 flex flex-col items-center text-center gap-space-3">
          <h2 className="heading-section font-display text-text-3xl md:text-text-4xl font-font-bold text-text-primary uppercase tracking-tight">
            PERGUNTAS FREQUENTES
          </h2>
        </div>

        <StandardFaq items={faqs} />
      </div>
    </section>
  );
}

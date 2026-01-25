import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <section className="py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container max-w-3xl mx-auto">
        <div className="mb-16 flex flex-col items-center text-center gap-3">
          <h2 className="heading-section font-display text-4xl font-black text-white sm:text-5xl lg:text-6xl">
            PERGUNTAS FREQUENTES
          </h2>
        </div>

        <Accordion
          type="single"
          collapsible
          className="w-full flex flex-col gap-6"
        >
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="rounded-xl bg-transparent overflow-hidden transition-all duration-300 hover:bg-white/5"
              style={{ borderWidth: "2px", borderColor: "#FF0000" }}
            >
              <AccordionTrigger className="px-8 hover:no-underline transition-colors border-transparent text-left py-5 text-base font-bold text-white flex-row-reverse justify-end gap-4 [&>svg]:text-[#FF0000] [&>svg]:transition-transform [&>svg]:duration-300 [&>svg]:h-5 [&>svg]:w-5 [&>svg]:-rotate-90 [&[data-state=open]>svg]:!rotate-0">
                <span className="[&[data-state=open]]:text-[#FF0000]">
                  {faq.question}
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-8 pb-5 pt-0 text-gray-400 pl-16 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

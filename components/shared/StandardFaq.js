import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/**
 * StandardFaq Component
 * Reusable FAQ component with consistent styling.
 *
 * @param {Object[]} items - Array of FAQ items ({ question: string, answer: string })
 */
export default function StandardFaq({ items }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Accordion
        type="single"
        collapsible
        className="w-full flex flex-col gap-4"
      >
        {items.map((faq, index) => (
          <AccordionItem
            key={index}
            value={`item-${index}`}
            className="rounded-xl border-2 border-primary bg-transparent overflow-hidden transition-all duration-300 hover:bg-white/5 data-[state=open]:bg-white/5"
          >
            <AccordionTrigger className="px-6 md:px-8 hover:no-underline transition-colors border-transparent text-left py-5 text-base font-bold text-white flex-row-reverse justify-end gap-4 [&>svg]:text-primary [&>svg]:transition-transform [&>svg]:duration-300 [&>svg]:h-5 [&>svg]:w-5 [&>svg]:-rotate-90 [&[data-state=open]>svg]:rotate-0!">
              <span className="data-[state=open]:text-primary transition-colors">
                {faq.question}
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-6 md:px-8 pb-6 pt-0 text-gray-400 pl-14 md:pl-16 leading-relaxed text-base">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </>
  );
}

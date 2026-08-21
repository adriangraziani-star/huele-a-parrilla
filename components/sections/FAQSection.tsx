import { AccordionItem } from "@/components/ui/Accordion";
import { faq } from "@/data/faq";

export function FAQSection() {
  return (
    <section id="faq" className="section bg-ivory-deep">
      <div className="container-page">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <header>
            <p className="eyebrow">Preguntas frecuentes</p>
            <h2 className="display-2 mt-3">Resolvemos tus dudas</h2>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-charcoal-muted">
              Todo lo que necesitas saber sobre nuestros cortes, la preparación y el
              despacho.
            </p>
          </header>

          <div className="border-t border-leather/20">
            {faq.map((entry) => (
              <AccordionItem
                key={entry.id}
                question={entry.question}
                answer={entry.answer}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

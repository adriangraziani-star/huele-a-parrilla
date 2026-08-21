"use client";

import { Notice } from "@/components/ui/Notice";
import {
  businessConfig,
  deliveryDaysLabel,
  deliveryWindowLabel,
} from "@/data/business";
import { scrollToSection } from "@/lib/scroll";

const steps = [
  {
    number: "01",
    title: "Elige tus productos",
    body: "Revisa nuestro catálogo, selecciona los cortes que necesitas y agrega las cantidades a tu pedido.",
  },
  {
    number: "02",
    title: "Indica cómo los quieres",
    body: "En los productos personalizables podrás elegir entre pieza entera o porcionado, y dejarnos indicaciones especiales.",
  },
  {
    number: "03",
    title: "Coordina tu despacho",
    body: `Despachamos los días ${deliveryDaysLabel}, aproximadamente entre las ${deliveryWindowLabel}. La jornada específica se coordina contigo por WhatsApp.`,
  },
  {
    number: "04",
    title: "Recibe y paga",
    body: "Preparamos tu pedido, confirmamos los pesos finales y coordinamos la entrega directamente contigo. Pago al recibir.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="como-funciona" className="section bg-ivory-deep">
      <div className="container-page">
        <header className="max-w-2xl">
          <p className="eyebrow">Cómo funciona</p>
          <h2 className="display-2 mt-3">Comprar en Huele a Parrilla es muy simple</h2>
        </header>

        <ol className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <li key={step.number} className="relative border-t-2 border-charcoal pt-5">
              <span className="font-sans text-[0.8rem] font-extrabold tracking-widest text-brand">
                {step.number}
              </span>
              <h3 className="display-3 mt-2">{step.title}</h3>
              <p className="mt-2 text-[0.9rem] leading-relaxed text-charcoal-muted">
                {step.body}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-10 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <Notice tone="info" icon="clock" title="Importante">
            Para pedidos con porcionado o indicaciones especiales, realiza tu pedido
            con al menos {businessConfig.advanceHours} horas de anticipación.
          </Notice>
          <button
            type="button"
            onClick={() => scrollToSection("catalogo")}
            className="btn btn-charcoal w-full lg:w-auto"
          >
            Ver catálogo
          </button>
        </div>
      </div>
    </section>
  );
}

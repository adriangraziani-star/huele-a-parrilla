"use client";

import { EditorialImage } from "@/components/sections/EditorialImage";
import { scrollToSection } from "@/lib/scroll";

export function FinalCTASection() {
  return (
    <section aria-label="Arma tu pedido">
      <EditorialImage
        src="/images/cta-parrilla.jpg"
        alt="Carne a la parrilla"
        overlay="center"
        focus="center 28%"
        className="min-h-[380px]"
      >
        <div className="container-page flex min-h-[380px] flex-col items-center justify-center py-16 text-center">
          <h2 className="display-2 max-w-2xl text-ivory">
            Tu próxima parrilla comienza aquí.
          </h2>
          <p className="mt-4 max-w-lg text-[1rem] leading-relaxed text-ivory/75">
            Elige tus cortes. Indícanos cómo los quieres. Nosotros nos encargamos del
            resto.
          </p>
          <button
            type="button"
            onClick={() => scrollToSection("catalogo")}
            className="btn btn-primary mt-8 px-8 py-3.5 text-[0.95rem]"
          >
            Armar mi pedido
          </button>
        </div>
      </EditorialImage>
    </section>
  );
}

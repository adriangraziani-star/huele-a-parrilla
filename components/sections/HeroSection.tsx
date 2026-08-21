"use client";

import { BrandLogo } from "@/components/layout/BrandLogo";
import { EditorialImage } from "@/components/sections/EditorialImage";
import {
  IconAward,
  IconKnife,
  IconLeaf,
  IconTruck,
} from "@/components/ui/Icons";
import { scrollToSection } from "@/lib/scroll";

const trustPoints = [
  { icon: IconLeaf, label: "Carne fresca", detail: "Origen sur de Chile" },
  { icon: IconKnife, label: "Cortes limpios", detail: "Preparación personalizada" },
  { icon: IconTruck, label: "Despacho a domicilio", detail: "En Santiago" },
  { icon: IconAward, label: "Pago al recibir", detail: "Transferencia o efectivo" },
];

export function HeroSection() {
  return (
    <section id="inicio" className="relative isolate">
      <EditorialImage
        src="/images/hero-campo-sur.jpg"
        alt="Corte de carne fresca sobre tabla, con el campo del sur de Chile al fondo"
        priority
        overlay="strong"
        className="min-h-[620px] pt-[68px] sm:min-h-[660px] lg:min-h-[720px]"
      >
        <div className="container-page flex min-h-[552px] flex-col justify-center py-16 sm:min-h-[592px] lg:min-h-[652px]">
          <div className="max-w-2xl">
            <BrandLogo variant="light" size="lg" className="mb-8" />

            <h1 className="display-1 text-ivory">
              Carne fresca del sur,
              <br />
              <span className="text-brand">directo a tu puerta.</span>
            </h1>

            <p className="mt-6 max-w-xl text-[1.05rem] leading-relaxed text-ivory/80">
              Seleccionamos carnes provenientes del sur de Chile y preparamos cada
              pedido especialmente para ti. Elige tus cortes, indícanos cómo los
              quieres y recíbelos directamente en tu hogar.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => scrollToSection("catalogo")}
                className="btn btn-primary px-7 py-3.5 text-[0.95rem]"
              >
                Armar mi pedido
              </button>
              <button
                type="button"
                onClick={() => scrollToSection("catalogo")}
                className="btn btn-outline-light px-7 py-3.5 text-[0.95rem]"
              >
                Ver catálogo
              </button>
            </div>
          </div>
        </div>
      </EditorialImage>

      {/* Elementos de confianza */}
      <div className="border-b border-leather/15 bg-ivory">
        <div className="container-page grid grid-cols-2 gap-x-6 gap-y-7 py-9 lg:grid-cols-4">
          {trustPoints.map((point) => (
            <div key={point.label} className="flex items-start gap-3">
              <point.icon className="mt-0.5 shrink-0 text-brand" width={22} height={22} />
              <div>
                <p className="font-sans text-[0.88rem] font-bold text-charcoal">
                  {point.label}
                </p>
                <p className="text-[0.8rem] leading-snug text-charcoal-muted">
                  {point.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

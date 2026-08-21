"use client";

import Link from "next/link";

import { BrandLogo } from "@/components/layout/BrandLogo";
import { IconWhatsApp } from "@/components/ui/Icons";
import {
  businessConfig,
  deliveryDaysLabel,
  deliveryWindowShort,
} from "@/data/business";
import { scrollToSection } from "@/lib/scroll";

const navigation = [
  { id: "inicio", label: "Inicio" },
  { id: "como-funciona", label: "Cómo funciona" },
  { id: "catalogo", label: "Catálogo" },
  { id: "despacho", label: "Despacho" },
  { id: "faq", label: "Preguntas frecuentes" },
];

export function Footer() {
  const { instagram, facebook } = businessConfig.socialLinks;

  return (
    <footer className="bg-charcoal text-ivory">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr] md:gap-14">
        <div>
          <BrandLogo variant="light" size="md" />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-ivory/65">
            Carne fresca del sur de Chile, cortes preparados a tu gusto y despacho
            directo a tu hogar en Santiago.
          </p>

          {instagram || facebook ? (
            <div className="mt-6 flex gap-3">
              {instagram ? (
                <a
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-ivory/25 px-4 py-1.5 text-xs font-semibold text-ivory/80 transition hover:border-brand hover:text-ivory"
                >
                  Instagram
                </a>
              ) : null}
              {facebook ? (
                <a
                  href={facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-ivory/25 px-4 py-1.5 text-xs font-semibold text-ivory/80 transition hover:border-brand hover:text-ivory"
                >
                  Facebook
                </a>
              ) : null}
            </div>
          ) : null}
        </div>

        <nav aria-label="Navegación del pie de página">
          <h2 className="eyebrow">Navegación</h2>
          <ul className="mt-4 space-y-2.5">
            {navigation.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className="text-sm text-ivory/70 transition hover:text-ivory"
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="eyebrow">Contacto y despacho</h2>
          <ul className="mt-4 space-y-2.5 text-sm text-ivory/70">
            <li>
              <a
                href={`https://wa.me/${businessConfig.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 transition hover:text-ivory"
              >
                <IconWhatsApp width={16} height={16} className="text-copper" />
                {businessConfig.whatsappDisplay}
              </a>
            </li>
            <li>Despachos: {deliveryDaysLabel}</li>
            <li>Horario: {deliveryWindowShort}</li>
            <li className="text-ivory/50">
              Trabajamos solo con despacho a domicilio. No contamos con local de
              atención al público.
            </li>
          </ul>

          <ul className="mt-6 space-y-2.5 text-sm">
            <li>
              <Link
                href="/politica-de-privacidad"
                className="text-ivory/70 underline-offset-4 transition hover:text-ivory hover:underline"
              >
                Política de privacidad
              </Link>
            </li>
            <li>
              <Link
                href="/terminos-y-condiciones"
                className="text-ivory/70 underline-offset-4 transition hover:text-ivory hover:underline"
              >
                Términos y condiciones
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ivory/10">
        <div className="container-page py-5 text-xs text-ivory/45">
          © {new Date().getFullYear()} {businessConfig.name}. Todos los derechos
          reservados.
        </div>
      </div>
    </footer>
  );
}

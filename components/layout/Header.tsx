"use client";

import { useEffect, useState } from "react";

import { BrandLogo } from "@/components/layout/BrandLogo";
import { IconCart, IconClose, IconMenu } from "@/components/ui/Icons";
import { scrollToSection } from "@/lib/scroll";
import { useOrder } from "@/store/order-store";
import { useUi } from "@/store/ui-store";

const navLinks = [
  { id: "inicio", label: "Inicio" },
  { id: "como-funciona", label: "Cómo funciona" },
  { id: "catalogo", label: "Catálogo" },
  { id: "despacho", label: "Despacho" },
  { id: "faq", label: "Preguntas frecuentes" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("inicio");
  const { totals } = useOrder();
  const { openCart } = useUi();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Marca el enlace correspondiente a la sección visible.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveSection(visible.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: [0, 0.25, 0.5] },
    );

    for (const link of navLinks) {
      const element = document.getElementById(link.id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, []);

  const go = (id: string) => {
    setMenuOpen(false);
    scrollToSection(id);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
        scrolled || menuOpen
          ? "bg-charcoal shadow-[0_1px_0_rgba(245,240,231,0.08)]"
          : "bg-charcoal/85 backdrop-blur-sm"
      }`}
    >
      <div className="container-page flex h-[68px] items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => go("inicio")}
          className="shrink-0"
          aria-label="Huele a Parrilla — ir al inicio"
        >
          <BrandLogo variant="light" size="sm" />
        </button>

        <nav aria-label="Navegación principal" className="hidden lg:block">
          <ul className="flex items-center gap-7">
            {navLinks.map((link) => {
              const active = activeSection === link.id;
              return (
                <li key={link.id}>
                  <button
                    type="button"
                    onClick={() => go(link.id)}
                    aria-current={active ? "true" : undefined}
                    className={`relative py-1 text-[0.83rem] font-semibold transition ${
                      active ? "text-ivory" : "text-ivory/70 hover:text-ivory"
                    }`}
                  >
                    {link.label}
                    <span
                      aria-hidden
                      className={`absolute -bottom-0.5 left-0 h-[2px] w-full origin-left bg-brand transition-transform duration-200 ${
                        active ? "scale-x-100" : "scale-x-0"
                      }`}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openCart}
            className="flex items-center gap-2 rounded-[var(--radius-button)] border border-ivory/25 px-3 py-2 text-[0.8rem] font-semibold text-ivory transition hover:border-ivory/60"
          >
            <IconCart width={18} height={18} />
            <span className="hidden sm:inline">Mi pedido</span>
            <span className="tabular-nums">({totals.itemCount})</span>
          </button>

          <button
            type="button"
            onClick={() => go("catalogo")}
            className="btn btn-primary hidden px-4 py-2 text-[0.8rem] sm:inline-flex"
          >
            Arma tu pedido
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-expanded={menuOpen}
            aria-controls="menu-movil"
            className="rounded-[var(--radius-button)] p-2 text-ivory lg:hidden"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {menuOpen ? <IconClose /> : <IconMenu />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div id="menu-movil" className="border-t border-ivory/10 bg-charcoal lg:hidden">
          <nav aria-label="Navegación móvil" className="container-page py-3">
            <ul className="flex flex-col">
              {navLinks.map((link) => (
                <li key={link.id}>
                  <button
                    type="button"
                    onClick={() => go(link.id)}
                    className="w-full border-b border-ivory/10 py-3 text-left text-[0.95rem] font-semibold text-ivory/85 transition hover:text-ivory"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
              <li className="pt-4">
                <button
                  type="button"
                  onClick={() => go("catalogo")}
                  className="btn btn-primary w-full"
                >
                  Arma tu pedido
                </button>
              </li>
            </ul>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

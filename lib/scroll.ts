/** Desplazamiento suave hacia una sección, respetando la altura del header. */
export const HEADER_OFFSET = 76;

export const scrollToSection = (id: string): void => {
  const target = document.getElementById(id);
  if (!target) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  const top = target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
  window.scrollTo({ top, behavior: prefersReducedMotion ? "auto" : "smooth" });
};

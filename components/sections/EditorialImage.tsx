"use client";

import type { ReactNode } from "react";

import { useImageAvailability } from "@/hooks/useImageAvailability";

/**
 * - `hero`: en móvil el texto va sobre la fotografía, así que la oscurece; en
 *   escritorio la composición se parte en dos columnas y la fotografía se deja
 *   casi limpia, con un difuminado en el borde que la une al panel de texto.
 * - `caption`: banda inferior sólida bajo el texto de las franjas editoriales.
 * - `center`: oscurecimiento parejo, para bloques con el texto centrado.
 */
type OverlayVariant = "hero" | "caption" | "center";

interface EditorialImageProps {
  src: string;
  alt: string;
  children?: ReactNode;
  className?: string;
  priority?: boolean;
  overlay?: OverlayVariant;
  /**
   * Punto de la fotografía que debe conservarse al recortar (`object-position`).
   * Útil cuando el motivo no está al centro: por ejemplo un corte en la parte
   * alta de una foto vertical que se muestra en una franja apaisada.
   */
  focus?: string;
}

/**
 * Fotografía editorial de marca.
 *
 * Las fotografías reales se colocan en `public/images/`. Mientras un archivo no
 * exista se muestra un fondo de la paleta: nunca se genera una imagen falsa ni
 * se usa un placeholder de stock.
 *
 * Los veladores están calculados para funcionar con fotografías claras (cortes
 * sobre fondo blanco o mármol) y oscuras (tabla de madera, parrilla) por igual,
 * de modo que el texto conserve el contraste sin importar qué imagen se cargue.
 */
export function EditorialImage({
  src,
  alt,
  children,
  className = "",
  priority = false,
  overlay = "caption",
  focus,
}: EditorialImageProps) {
  const { ref, missing, onError } = useImageAvailability();

  return (
    <div className={`relative overflow-hidden bg-charcoal ${className}`}>
      {missing ? (
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(120%_100%_at_20%_0%,#3a352f_0%,#1f1e1c_60%)]"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={ref}
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          onError={onError}
          style={focus ? { objectPosition: focus } : undefined}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {/* Tinte base: iguala fotografías de luminosidad muy distinta, de modo
          que un corte sobre fondo blanco y otro sobre tabla oscura convivan en
          la misma franja sin que una parezca apagada al lado de la otra. */}
      <div
        aria-hidden
        className={`absolute inset-0 bg-charcoal/45 ${
          overlay === "hero" ? "lg:bg-charcoal/10" : ""
        }`}
      />

      {overlay === "center" ? (
        <div aria-hidden className="absolute inset-0 bg-charcoal/55" />
      ) : overlay === "hero" ? (
        <>
          {/* Móvil: el texto se apoya sobre la fotografía. */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/80 to-charcoal/10 lg:hidden"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/45 to-transparent lg:hidden"
          />
          {/* Escritorio: solo un difuminado en el borde izquierdo, para que la
              fotografía se funda con el panel del titular sin un corte duro. */}
          <div
            aria-hidden
            className="absolute inset-0 hidden bg-gradient-to-r from-charcoal via-transparent to-transparent lg:block"
          />
        </>
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/85 via-40% to-transparent"
        />
      )}

      {children ? <div className="relative">{children}</div> : null}
    </div>
  );
}

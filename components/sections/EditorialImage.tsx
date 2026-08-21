"use client";

import type { ReactNode } from "react";

import { useImageAvailability } from "@/hooks/useImageAvailability";

interface EditorialImageProps {
  src: string;
  alt: string;
  children?: ReactNode;
  className?: string;
  priority?: boolean;
  overlay?: "soft" | "strong";
}

/**
 * Fotografía editorial de marca.
 *
 * Las fotografías reales se colocan en `public/images/`. Mientras un archivo no
 * exista, se muestra un fondo de la paleta: nunca se genera una imagen falsa ni
 * se usa un placeholder de stock.
 */
export function EditorialImage({
  src,
  alt,
  children,
  className = "",
  priority = false,
  overlay = "soft",
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
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <div
        aria-hidden
        className={`absolute inset-0 ${
          overlay === "strong"
            ? "bg-gradient-to-t from-charcoal via-charcoal/70 to-charcoal/25"
            : "bg-gradient-to-t from-charcoal/90 via-charcoal/45 to-charcoal/10"
        }`}
      />
      {children ? <div className="relative">{children}</div> : null}
    </div>
  );
}

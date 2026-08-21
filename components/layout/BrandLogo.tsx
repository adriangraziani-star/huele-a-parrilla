"use client";

import { useImageAvailability } from "@/hooks/useImageAvailability";

/**
 * Logo oficial de Huele a Parrilla.
 *
 * El asset definitivo se coloca en `public/images/logo-huele-a-parrilla.png`.
 * Mientras no exista el archivo, se muestra una versión tipográfica de marca:
 * nunca se genera ni se reinterpreta un logo artificial.
 */
interface BrandLogoProps {
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const LOGO_SRC = "/images/logo-huele-a-parrilla.png";

const sizeClass = {
  sm: "h-9",
  md: "h-12",
  lg: "h-20 sm:h-24",
};

const wordmarkSize = {
  sm: "text-[0.72rem] tracking-[0.24em]",
  md: "text-[0.85rem] tracking-[0.26em]",
  lg: "text-base tracking-[0.3em] sm:text-lg",
};

export function BrandLogo({
  variant = "light",
  size = "md",
  className = "",
}: BrandLogoProps) {
  const { ref, missing, onError } = useImageAvailability();
  const tone = variant === "light" ? "text-ivory" : "text-charcoal";

  if (missing) {
    return (
      <span
        className={`inline-flex flex-col leading-none ${tone} ${className}`}
        aria-label="Huele a Parrilla"
      >
        <span
          aria-hidden
          className={`font-sans font-extrabold uppercase ${wordmarkSize[size]}`}
        >
          Huele a<span className="text-brand"> Parrilla</span>
        </span>
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={LOGO_SRC}
      alt="Huele a Parrilla"
      onError={onError}
      className={`${sizeClass[size]} w-auto object-contain ${className}`}
    />
  );
}

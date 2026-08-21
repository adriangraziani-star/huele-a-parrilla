"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Detecta si un archivo de imagen todavía no existe en `public/`.
 *
 * El evento `error` de la imagen puede dispararse antes de que React hidrate la
 * página, de modo que el manejador `onError` por sí solo no basta: al montar
 * también se comprueba el estado real del elemento.
 */
export const useImageAvailability = () => {
  const ref = useRef<HTMLImageElement>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    const image = ref.current;
    if (image && image.complete && image.naturalWidth === 0) {
      setMissing(true);
    }
  }, []);

  const onError = useCallback(() => setMissing(true), []);

  return { ref, missing, onError };
};

/** Normalización y validación de teléfonos móviles chilenos. */

export interface NormalizedPhone {
  /** Formato interno consistente: +56912345678 */
  normalized: string | null;
  /** Formato legible: +56 9 1234 5678 */
  display: string | null;
  valid: boolean;
}

/**
 * Acepta 912345678, +56912345678, 9 1234 5678, +56 9 1234 5678.
 * No consulta servicios externos ni verifica si el número tiene WhatsApp.
 */
export const normalizeChileanPhone = (input: string): NormalizedPhone => {
  const digits = input.replace(/\D/g, "");

  let subscriber: string | null = null;
  if (/^569\d{8}$/.test(digits)) {
    subscriber = digits.slice(3);
  } else if (/^9\d{8}$/.test(digits)) {
    subscriber = digits.slice(1);
  }

  if (!subscriber) {
    return { normalized: null, display: null, valid: false };
  }

  return {
    normalized: `+569${subscriber}`,
    display: `+56 9 ${subscriber.slice(0, 4)} ${subscriber.slice(4)}`,
    valid: true,
  };
};

export const isValidChileanPhone = (input: string): boolean =>
  normalizeChileanPhone(input).valid;

/** Validación de formato razonable, sin verificar existencia real. */
export const isValidEmail = (input: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.trim());

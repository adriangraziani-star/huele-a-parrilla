/** Normalización y saneamiento de texto. */

const COMBINING_MARKS_START = 0x0300;
const COMBINING_MARKS_END = 0x036f;
const DIACRITICS = new RegExp(
  `[${String.fromCharCode(COMBINING_MARKS_START)}-${String.fromCharCode(COMBINING_MARKS_END)}]`,
  "g",
);
const HTML_TAGS = /<[^>]*>/g;

/**
 * Quita tildes y pasa a minúsculas para búsquedas tolerantes.
 * "Peñalolén" → "penalolen"
 */
export const normalizeSearchText = (value: string): string =>
  value.normalize("NFD").replace(DIACRITICS, "").toLowerCase().trim();

/**
 * Reemplaza caracteres de control por espacios, conservando los saltos de
 * línea legítimos escritos por el cliente.
 */
const stripControlCharacters = (value: string): string =>
  Array.from(value)
    .map((char) => {
      if (char === "\n") return "\n";
      const code = char.charCodeAt(0);
      return code < 32 || code === 127 ? " " : char;
    })
    .join("");

/**
 * Sanea texto libre escrito por el cliente antes de guardarlo o enviarlo.
 * Conserva tildes, ñ, puntuación y saltos de línea razonables; elimina
 * marcado HTML y caracteres de control.
 */
export const sanitizeFreeText = (value: string, maxLength = 300): string =>
  stripControlCharacters(value.replace(HTML_TAGS, "").replace(/[<>]/g, ""))
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .slice(0, maxLength)
    .trim();

/** Una cadena formada solo por espacios se considera vacía. */
export const isBlank = (value: string | null | undefined): boolean =>
  !value || value.trim().length === 0;

/** Devuelve el texto saneado o `null` si quedó vacío. */
export const toNullableText = (
  value: string | null | undefined,
  maxLength = 300,
): string | null => {
  if (isBlank(value)) return null;
  const clean = sanitizeFreeText(value as string, maxLength);
  return clean.length > 0 ? clean : null;
};

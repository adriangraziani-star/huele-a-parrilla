/** Formateo chileno de precios, pesos y cantidades. */

const clpFormatter = new Intl.NumberFormat("es-CL", {
  style: "decimal",
  maximumFractionDigits: 0,
});

/** 17990 → "$17.990" */
export const formatCLP = (value: number): string =>
  `$${clpFormatter.format(Math.round(value))}`;

/** 1.5 → "1,5" · 2 → "2" */
export const formatNumber = (value: number): string => {
  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded)
    ? String(rounded)
    : String(rounded).replace(".", ",");
};

/** 1.5 → "1,5 kg" */
export const formatWeight = (value: number): string => `${formatNumber(value)} kg`;

/** (1.8, 2.8) → "1,8–2,8 kg" */
export const formatWeightRange = (min: number, max: number): string =>
  min === max ? formatWeight(min) : `${formatNumber(min)}–${formatNumber(max)} kg`;

/** (32382, 50372) → "$32.382–$50.372". Nunca promedia los extremos. */
export const formatPriceRange = (min: number, max: number): string =>
  min === max ? formatCLP(min) : `${formatCLP(min)}–${formatCLP(max)}`;

/** Pluraliza usando la cantidad ya formateada. */
export const pluralize = (
  quantity: number,
  singular: string,
  plural: string,
): string => `${formatNumber(quantity)} ${quantity === 1 ? singular : plural}`;

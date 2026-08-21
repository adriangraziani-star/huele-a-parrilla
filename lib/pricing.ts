import {
  formatCLP,
  formatNumber,
  formatPriceRange,
  formatWeightRange,
  pluralize,
} from "@/lib/format";
import type {
  CartItem,
  CartTotals,
  PreparationType,
  PriceCalculation,
  Product,
  QuantityUnit,
} from "@/types";

/**
 * Motor de cálculo de precios — fuente única para tarjeta, carrito, resumen y
 * mensaje de WhatsApp.
 *
 * Reglas invariables:
 * - Nunca se promedia un rango. Si el peso varía, se conserva `min` y `max`.
 * - Un producto sin rango estimable jamás se representa como $0.
 * - La preparación (pieza entera / porcionado) no genera recargos.
 */

const EMPTY_RESULT = (quantityLabel: string): PriceCalculation => ({
  min: 0,
  max: 0,
  exact: true,
  pricePending: true,
  weightMin: null,
  weightMax: null,
  quantityLabel,
  weightLabel: null,
  priceLabel: "Valor final según peso real",
});

/**
 * Unidad en la que se expresa la cantidad de una línea.
 * Depende de la modalidad comercial y, en el caso de
 * `forcesVariablePieceWeight`, también de la preparación elegida.
 */
export const getQuantityUnit = (
  product: Product,
  preparationType: PreparationType | null,
): QuantityUnit => {
  switch (product.saleMode) {
    case "KG_STANDARD":
      return "kg";
    case "PIECE_VARIABLE_WEIGHT":
    case "PIECE_BY_WEIGHT_WITHOUT_CONFIRMED_RANGE":
      return "piece";
    case "FIXED_UNIT":
      return "unit";
    case "FIXED_PACKAGE":
      return "package";
    case "KG_WITH_WHOLE_PIECE_REFERENCE":
      return isWholePieceModeActive(product, preparationType) ? "piece" : "kg";
  }
};

/**
 * ¿La selección "Pieza entera" cambia la modalidad comercial de este producto?
 * Solo ocurre en productos con `forcesVariablePieceWeight` (Asado de Tiras).
 */
export const isWholePieceModeActive = (
  product: Product,
  preparationType: PreparationType | null,
): boolean =>
  product.wholePieceBehavior === "forcesVariablePieceWeight" &&
  preparationType === "whole" &&
  product.wholePieceWeightMin !== null &&
  product.wholePieceWeightMax !== null;

/** Mínimo y paso vigentes según la unidad activa de la línea. */
export const getQuantityRules = (
  product: Product,
  preparationType: PreparationType | null,
): { minimum: number; step: number } => {
  const unit = getQuantityUnit(product, preparationType);
  if (unit === "kg") {
    return { minimum: product.minimumQuantity, step: product.quantityStep };
  }
  return { minimum: 1, step: 1 };
};

export const formatQuantityLabel = (
  product: Product,
  quantity: number,
  preparationType: PreparationType | null,
): string => {
  const unit = getQuantityUnit(product, preparationType);
  switch (unit) {
    case "kg":
      return `${formatNumber(quantity)} kg`;
    case "piece":
      return pluralize(quantity, "pieza", "piezas");
    case "unit":
      return pluralize(quantity, "unidad", "unidades");
    case "package": {
      const label = pluralize(quantity, "bolsa", "bolsas");
      return product.packageLabel
        ? `${label} de ${product.packageLabel.replace(/^Bolsa de /i, "")}`
        : label;
    }
  }
};

/** Producto vendido libremente por kilogramo. */
const calculateKgProduct = (
  product: Product,
  quantity: number,
): PriceCalculation => {
  const price = product.price ?? 0;
  const subtotal = Math.round(price * quantity);
  return {
    min: subtotal,
    max: subtotal,
    exact: true,
    pricePending: false,
    weightMin: quantity,
    weightMax: quantity,
    quantityLabel: `${formatNumber(quantity)} kg`,
    weightLabel: null,
    priceLabel: formatCLP(subtotal),
  };
};

/**
 * Producto vendido por pieza y valorizado por kilogramo.
 * El rango se multiplica en ambos extremos por la cantidad de piezas.
 */
const calculateVariablePieceProduct = (
  product: Product,
  quantity: number,
  weightMinPerPiece: number,
  weightMaxPerPiece: number,
  unitNoun: { singular: string; plural: string } = {
    singular: "pieza",
    plural: "piezas",
  },
): PriceCalculation => {
  const price = product.price ?? 0;
  const weightMin = weightMinPerPiece * quantity;
  const weightMax = weightMaxPerPiece * quantity;
  const min = Math.round(price * weightMin);
  const max = Math.round(price * weightMax);

  return {
    min,
    max,
    exact: min === max,
    pricePending: false,
    weightMin,
    weightMax,
    quantityLabel: pluralize(quantity, unitNoun.singular, unitNoun.plural),
    weightLabel: `${formatWeightRange(weightMin, weightMax)} aprox.`,
    priceLabel:
      min === max ? formatCLP(min) : `${formatPriceRange(min, max)} aprox.`,
  };
};

/** Producto vendido por unidad con precio fijo. */
const calculateFixedUnitProduct = (
  product: Product,
  quantity: number,
): PriceCalculation => {
  const subtotal = Math.round((product.price ?? 0) * quantity);
  return {
    min: subtotal,
    max: subtotal,
    exact: true,
    pricePending: false,
    weightMin: null,
    weightMax: null,
    quantityLabel: pluralize(quantity, "unidad", "unidades"),
    weightLabel: null,
    priceLabel: formatCLP(subtotal),
  };
};

/** Producto con presentación fija. El peso del envase no se multiplica. */
const calculateFixedPackageProduct = (
  product: Product,
  quantity: number,
): PriceCalculation => {
  const subtotal = Math.round((product.price ?? 0) * quantity);
  return {
    min: subtotal,
    max: subtotal,
    exact: true,
    pricePending: false,
    weightMin: null,
    weightMax: null,
    quantityLabel: formatQuantityLabel(product, quantity, null),
    weightLabel: null,
    priceLabel: formatCLP(subtotal),
  };
};

/** Producto vendido entero cuyo valor solo se conoce tras el pesaje. */
const calculateUnknownWeightProduct = (
  product: Product,
  quantity: number,
): PriceCalculation =>
  EMPTY_RESULT(pluralize(quantity, "pieza", "piezas"));

/**
 * Calcula una línea del carrito delegando según la modalidad comercial.
 * `preparationType` solo influye cuando el producto tiene
 * `wholePieceBehavior: "forcesVariablePieceWeight"`.
 */
export const calculateCartItem = (
  product: Product,
  quantity: number,
  preparationType: PreparationType | null = null,
): PriceCalculation => {
  switch (product.saleMode) {
    case "KG_STANDARD":
      return calculateKgProduct(product, quantity);

    case "PIECE_VARIABLE_WEIGHT":
      return calculateVariablePieceProduct(
        product,
        quantity,
        product.approxWeightMin ?? 0,
        product.approxWeightMax ?? 0,
      );

    case "KG_WITH_WHOLE_PIECE_REFERENCE":
      if (isWholePieceModeActive(product, preparationType)) {
        return calculateVariablePieceProduct(
          product,
          quantity,
          product.wholePieceWeightMin ?? 0,
          product.wholePieceWeightMax ?? 0,
          { singular: "pieza entera", plural: "piezas enteras" },
        );
      }
      return calculateKgProduct(product, quantity);

    case "FIXED_UNIT":
      return calculateFixedUnitProduct(product, quantity);

    case "FIXED_PACKAGE":
      return calculateFixedPackageProduct(product, quantity);

    case "PIECE_BY_WEIGHT_WITHOUT_CONFIRMED_RANGE":
      return calculateUnknownWeightProduct(product, quantity);
  }
};

/** Rango estimado que se muestra en la tarjeta del catálogo. */
export const calculateVariableWeightRange = (
  product: Product,
): { min: number; max: number } | null => {
  if (product.price === null) return null;
  if (product.approxWeightMin === null || product.approxWeightMax === null) {
    return null;
  }
  return {
    min: Math.round(product.price * product.approxWeightMin),
    max: Math.round(product.price * product.approxWeightMax),
  };
};

export interface CartLine {
  item: CartItem;
  product: Product;
  calculation: PriceCalculation;
}

/** Resuelve cada línea contra el catálogo vigente. */
export const buildCartLines = (
  items: CartItem[],
  resolveProduct: (productId: string) => Product | null,
): CartLine[] =>
  items.flatMap((item) => {
    const product = resolveProduct(item.productId);
    if (!product) return [];
    return [
      {
        item,
        product,
        calculation: calculateCartItem(
          product,
          item.quantity,
          item.preparationType,
        ),
      },
    ];
  });

/** Suma los extremos por separado. Nunca colapsa el rango en un promedio. */
export const calculateCartSubtotal = (
  lines: CartLine[],
): { cartMin: number; cartMax: number; hasUnpricedItem: boolean } => {
  let cartMin = 0;
  let cartMax = 0;
  let hasUnpricedItem = false;

  for (const line of lines) {
    if (line.calculation.pricePending) {
      hasUnpricedItem = true;
      continue;
    }
    cartMin += line.calculation.min;
    cartMax += line.calculation.max;
  }

  return { cartMin, cartMax, hasUnpricedItem };
};

/**
 * Totales del pedido. El despacho se suma a ambos extremos y nunca se usa
 * para completar el pedido mínimo.
 */
export const calculateCartTotal = (
  lines: CartLine[],
  shippingFee: number | null,
): CartTotals => {
  const { cartMin, cartMax, hasUnpricedItem } = calculateCartSubtotal(lines);
  const requiresAdvancePreparation = lines.some(
    (line) => line.item.requiresAdvancePreparation,
  );

  return {
    cartMin,
    cartMax,
    exact: cartMin === cartMax,
    hasUnpricedItem,
    shippingFee,
    totalMin: shippingFee === null ? null : cartMin + shippingFee,
    totalMax: shippingFee === null ? null : cartMax + shippingFee,
    itemCount: lines.length,
    requiresAdvancePreparation,
  };
};

/** Etiqueta de un subtotal o total, respetando rangos y valores pendientes. */
export const formatEstimate = (
  min: number,
  max: number,
  options: { approxSuffix?: boolean } = {},
): string => {
  if (min === max) return formatCLP(min);
  return options.approxSuffix === false
    ? formatPriceRange(min, max)
    : `${formatPriceRange(min, max)} aprox.`;
};

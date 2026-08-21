import { categories } from "@/data/categories";
import type { CategoryId, Product } from "@/types";

const categoryOrder: CategoryId[] = [...categories]
  .sort((a, b) => a.order - b.order)
  .map((category) => category.id);

/**
 * Catálogo de Huele a Parrilla — fuente única de verdad.
 *
 * Reglas que deben respetarse al editar este archivo:
 * - `price` siempre entero en pesos chilenos (17990, nunca "$17.990").
 * - `shortDescription` nace en `null`. No inventar descripciones comerciales.
 * - `image` nace en `null`. La V1 del catálogo no usa fotografías.
 * - `categoryId` se declara explícitamente. Nunca se infiere desde el nombre:
 *   Pollo Barriga y Pollo Ganso son cortes de vacuno.
 * - Los productos sin precio vigente confirmado quedan `active: false`.
 */

interface BaseOptions {
  id: string;
  name: string;
  categoryId: CategoryId;
  price: number | null;
  preparation?: boolean;
  instructions?: boolean;
  operationalNote?: string | null;
  portionPlaceholder?: string | null;
  specialInstructionsPlaceholder?: string | null;
  active?: boolean;
  featured?: boolean;
}

const base = (options: BaseOptions) => ({
  id: options.id,
  name: options.name,
  categoryId: options.categoryId,
  price: options.price,
  allowPreparationChoice: options.preparation ?? false,
  allowSpecialInstructions: options.instructions ?? true,
  portionPlaceholder: options.portionPlaceholder ?? null,
  specialInstructionsPlaceholder: options.specialInstructionsPlaceholder ?? null,
  active: options.active ?? true,
  featured: options.featured ?? false,
  image: null,
  shortDescription: null,
  operationalNote: options.operationalNote ?? null,
});

/** Vendido libremente por kilogramo. */
const kg = (
  options: BaseOptions & { minimumQuantity?: number; quantityStep?: number },
): Product => ({
  ...base(options),
  pricingUnit: "kg",
  saleMode: "KG_STANDARD",
  minimumQuantity: options.minimumQuantity ?? 1,
  quantityStep: options.quantityStep ?? 0.5,
  approxWeightMin: null,
  approxWeightMax: null,
  wholePieceWeightMin: null,
  wholePieceWeightMax: null,
  wholePieceBehavior: "standardPreparation",
});

/** Vendido por pieza completa y valorizado por kilogramo. */
const piece = (
  options: BaseOptions & { weightMin: number; weightMax: number },
): Product => ({
  ...base(options),
  pricingUnit: "kg",
  saleMode: "PIECE_VARIABLE_WEIGHT",
  minimumQuantity: 1,
  quantityStep: 1,
  approxWeightMin: options.weightMin,
  approxWeightMax: options.weightMax,
  wholePieceWeightMin: options.weightMin,
  wholePieceWeightMax: options.weightMax,
  wholePieceBehavior: "alreadySoldAsWholePiece",
});

/** Vendido por kilogramo, con rango conocido de la pieza completa. */
const kgWithWholePiece = (
  options: BaseOptions & {
    minimumQuantity?: number;
    quantityStep?: number;
    wholePieceMin: number;
    wholePieceMax: number;
  },
): Product => ({
  ...base(options),
  pricingUnit: "kg",
  saleMode: "KG_WITH_WHOLE_PIECE_REFERENCE",
  minimumQuantity: options.minimumQuantity ?? 1,
  quantityStep: options.quantityStep ?? 0.5,
  approxWeightMin: null,
  approxWeightMax: null,
  wholePieceWeightMin: options.wholePieceMin,
  wholePieceWeightMax: options.wholePieceMax,
  wholePieceBehavior: "forcesVariablePieceWeight",
});

/** Vendido por unidad con precio fijo. */
const fixedUnit = (options: BaseOptions): Product => ({
  ...base(options),
  pricingUnit: "unit",
  saleMode: "FIXED_UNIT",
  minimumQuantity: 1,
  quantityStep: 1,
  approxWeightMin: null,
  approxWeightMax: null,
  wholePieceWeightMin: null,
  wholePieceWeightMax: null,
  wholePieceBehavior: "standardPreparation",
});

/** Presentación fija (bolsa, envase). */
const fixedPackage = (
  options: BaseOptions & { packageLabel: string },
): Product => ({
  ...base(options),
  pricingUnit: "package",
  saleMode: "FIXED_PACKAGE",
  minimumQuantity: 1,
  quantityStep: 1,
  approxWeightMin: null,
  approxWeightMax: null,
  wholePieceWeightMin: null,
  wholePieceWeightMax: null,
  wholePieceBehavior: "standardPreparation",
  packageLabel: options.packageLabel,
});

/** Vendido entero y valorizado por peso, sin rango estándar confirmado. */
const pieceWithoutRange = (options: BaseOptions): Product => ({
  ...base(options),
  pricingUnit: "kg",
  saleMode: "PIECE_BY_WEIGHT_WITHOUT_CONFIRMED_RANGE",
  minimumQuantity: 1,
  quantityStep: 1,
  approxWeightMin: null,
  approxWeightMax: null,
  wholePieceWeightMin: null,
  wholePieceWeightMax: null,
  wholePieceBehavior: "alreadySoldAsWholePiece",
  estimateUnavailable: true,
});

export const products: Product[] = [
  // ─────────────────────────── VACUNO ───────────────────────────
  piece({
    id: "filete",
    name: "Filete",
    categoryId: "vacuno",
    price: 17990,
    weightMin: 1.8,
    weightMax: 2.8,
    preparation: true,
  }),
  kg({ id: "entrana", name: "Entraña", categoryId: "vacuno", price: 16990, preparation: true }),
  kg({
    id: "entrecot",
    name: "Entrecot",
    categoryId: "vacuno",
    price: 15990,
    quantityStep: 1,
    preparation: false,
    operationalNote:
      "Cada Entrecot pesa aproximadamente entre 400 y 600 g. Un kilogramo corresponde normalmente a unas 2 unidades.",
  }),
  piece({
    id: "flat-iron",
    name: "Flat Iron",
    categoryId: "vacuno",
    price: 15990,
    weightMin: 1.5,
    weightMax: 2.2,
    preparation: true,
  }),
  kg({ id: "lomo-vetado", name: "Lomo Vetado", categoryId: "vacuno", price: 15990, preparation: true }),
  kg({ id: "lomo-liso", name: "Lomo Liso", categoryId: "vacuno", price: 14990, preparation: true }),
  piece({
    id: "tomahawk",
    name: "Tomahawk",
    categoryId: "vacuno",
    price: 14990,
    weightMin: 1,
    weightMax: 1.5,
    preparation: false,
  }),
  piece({
    id: "punta-de-ganso",
    name: "Punta de Ganso",
    categoryId: "vacuno",
    price: 14990,
    weightMin: 1.4,
    weightMax: 2,
    preparation: true,
    operationalNote:
      "La pieza conserva su capa de grasa exterior. Si prefieres reducirla, indícalo en las indicaciones especiales.",
  }),
  kg({ id: "punta-picana", name: "Punta Picana", categoryId: "vacuno", price: 13990, preparation: true }),
  kg({ id: "pollo-barriga", name: "Pollo Barriga", categoryId: "vacuno", price: 12990, preparation: true }),
  kg({ id: "asado-americano", name: "Asado Americano", categoryId: "vacuno", price: 12990, preparation: true }),
  kg({ id: "arrachera", name: "Arrachera", categoryId: "vacuno", price: 12990, preparation: true }),
  kg({ id: "chuleta-de-res", name: "Chuleta de Res", categoryId: "vacuno", price: 12990, preparation: true }),
  piece({
    id: "pieza-vacio-argentino",
    name: "Pieza Vacío Estilo Argentino",
    categoryId: "vacuno",
    price: 12990,
    weightMin: 4,
    weightMax: 5.7,
    preparation: true,
  }),
  kg({ id: "postas", name: "Postas", categoryId: "vacuno", price: 12990, preparation: true }),
  kg({ id: "aranita", name: "Arañita", categoryId: "vacuno", price: 12990, preparation: false }),
  kg({ id: "asiento", name: "Asiento", categoryId: "vacuno", price: 12990, preparation: true }),
  kg({ id: "tapabarriga", name: "Tapabarriga", categoryId: "vacuno", price: 12990, preparation: true }),
  kg({ id: "palanca", name: "Palanca", categoryId: "vacuno", price: 12990, preparation: true }),
  kgWithWholePiece({
    id: "asado-de-tiras",
    name: "Asado de Tiras",
    categoryId: "vacuno",
    price: 11990,
    wholePieceMin: 4,
    wholePieceMax: 6,
    preparation: true,
    portionPlaceholder:
      "Ej.: en tiras, corte banderita, grosor delgado, trozos medianos, etc.",
  }),
  piece({
    id: "estomaguillo",
    name: "Estomaguillo",
    categoryId: "vacuno",
    price: 11990,
    weightMin: 6,
    weightMax: 8,
    preparation: true,
  }),
  kg({ id: "sobrecostilla", name: "Sobrecostilla", categoryId: "vacuno", price: 11990, preparation: true }),
  kg({ id: "huachalomo", name: "Huachalomo", categoryId: "vacuno", price: 11990, preparation: true }),
  kg({ id: "plateada", name: "Plateada", categoryId: "vacuno", price: 11990, preparation: true }),
  kg({ id: "pollo-ganso", name: "Pollo Ganso", categoryId: "vacuno", price: 11990, preparation: true }),
  kg({
    id: "molida-tartaro",
    name: "Molida Tártaro",
    categoryId: "vacuno",
    price: 11990,
    preparation: false,
  }),
  kg({
    id: "molida-especial",
    name: "Molida Especial",
    categoryId: "vacuno",
    price: 9990,
    preparation: false,
    specialInstructionsPlaceholder: "Ej.: separar en bolsas de 500 g.",
  }),
  kg({ id: "osobuco", name: "Osobuco", categoryId: "vacuno", price: 8990, preparation: false }),
  kg({ id: "hueso-carnudo", name: "Hueso Carnudo", categoryId: "vacuno", price: 4990, preparation: false }),

  // ─────────────────────────── CERDO ───────────────────────────
  kg({ id: "malaya-de-cerdo", name: "Malaya de Cerdo", categoryId: "cerdo", price: 12990, preparation: true }),
  kg({
    id: "costillar-con-malaya",
    name: "Costillar con Malaya",
    categoryId: "cerdo",
    price: 10990,
    preparation: true,
    operationalNote: "Las piezas parten aproximadamente desde 1 kg.",
  }),
  piece({
    id: "costillar-americano",
    name: "Costillar Americano",
    categoryId: "cerdo",
    price: 10990,
    weightMin: 1.5,
    weightMax: 2.2,
    preparation: true,
  }),
  kg({ id: "pork-belly", name: "Pork Belly", categoryId: "cerdo", price: 10990, preparation: true }),
  kg({ id: "baby-ribs", name: "Baby Ribs", categoryId: "cerdo", price: 10990, preparation: true }),
  kg({ id: "tocino-ahumado", name: "Tocino Ahumado", categoryId: "cerdo", price: 10990, preparation: true }),
  kg({ id: "chuleta-ahumada", name: "Chuleta Ahumada", categoryId: "cerdo", price: 10990, preparation: false }),
  kg({ id: "solomillo-de-cerdo", name: "Solomillo de Cerdo", categoryId: "cerdo", price: 9990, preparation: true }),
  kg({ id: "chuleta-parrillera", name: "Chuleta Parrillera", categoryId: "cerdo", price: 7990, preparation: true }),
  kg({ id: "chuleta-centro", name: "Chuleta Centro", categoryId: "cerdo", price: 7990, preparation: true }),
  kg({ id: "lomo-de-cerdo", name: "Lomo de Cerdo", categoryId: "cerdo", price: 7990, preparation: true }),
  kg({ id: "pulpa-de-cerdo", name: "Pulpa de Cerdo", categoryId: "cerdo", price: 7990, preparation: true }),
  kg({ id: "arrollado", name: "Arrollado", categoryId: "cerdo", price: 7990, preparation: false }),
  kg({ id: "paleta-con-hueso", name: "Paleta con Hueso", categoryId: "cerdo", price: 6990, preparation: true }),
  kg({ id: "cazuela-de-cerdo", name: "Cazuela de Cerdo", categoryId: "cerdo", price: 6990, preparation: false }),
  kg({ id: "patas-de-cerdo", name: "Patas de Cerdo", categoryId: "cerdo", price: 5990, preparation: false }),
  kg({ id: "manteca", name: "Manteca", categoryId: "cerdo", price: 4990, preparation: false }),
  // Se conserva internamente hasta nueva confirmación comercial.
  kg({
    id: "entrana-de-cerdo",
    name: "Entraña de Cerdo",
    categoryId: "cerdo",
    price: null,
    preparation: false,
    active: false,
  }),

  // ─────────────────────────── POLLO ───────────────────────────
  kg({
    id: "filete-de-pechuga",
    name: "Filete de Pechuga sin Hueso",
    categoryId: "pollo",
    price: 8990,
    preparation: false,
  }),
  kg({ id: "pechuga-con-hueso", name: "Pechuga con Hueso", categoryId: "pollo", price: 7990, preparation: false }),
  pieceWithoutRange({
    id: "pollo-entero",
    name: "Pollo Entero",
    categoryId: "pollo",
    price: 5990,
    preparation: false,
  }),
  kg({
    id: "truto-entero",
    name: "Truto Entero / Truto Largo",
    categoryId: "pollo",
    price: 4990,
    preparation: false,
  }),
  kg({ id: "truto-corto", name: "Truto Corto", categoryId: "pollo", price: 4990, preparation: false }),
  kg({ id: "truto-ala", name: "Truto Ala / Alas", categoryId: "pollo", price: 4990, preparation: false }),
  kg({ id: "corazon-de-pollo", name: "Corazón de Pollo", categoryId: "pollo", price: 4990, preparation: false }),
  kg({ id: "panita-de-pollo", name: "Panita de Pollo", categoryId: "pollo", price: 3990, preparation: false }),
  kg({ id: "patas-de-pollo", name: "Patas de Pollo", categoryId: "pollo", price: 1990, preparation: false }),

  // ───────────────────────── SUBPRODUCTOS ─────────────────────────
  piece({
    id: "lengua",
    name: "Lengua",
    categoryId: "subproductos",
    price: 10990,
    weightMin: 1.4,
    weightMax: 1.9,
    preparation: false,
  }),
  fixedUnit({
    id: "pata-de-vacuno",
    name: "Pata de Vacuno",
    categoryId: "subproductos",
    price: 10990,
    preparation: false,
  }),
  kg({ id: "cola-de-res", name: "Cola de Res", categoryId: "subproductos", price: 8990, preparation: false }),
  kg({
    id: "corazon-de-vacuno",
    name: "Corazón de Vacuno",
    categoryId: "subproductos",
    price: 6990,
    preparation: false,
  }),
  kg({ id: "ubre", name: "Ubre", categoryId: "subproductos", price: 6990, preparation: false }),
  kg({ id: "guata-cayo", name: "Guata Cayo", categoryId: "subproductos", price: 6990, preparation: false }),
  kg({
    id: "guatita-surtida",
    name: "Guatita Surtida",
    categoryId: "subproductos",
    price: 5990,
    preparation: false,
  }),
  kg({ id: "rinon", name: "Riñón", categoryId: "subproductos", price: 5990, preparation: false }),
  // Sin precio vigente confirmado: se registran internamente y no se publican.
  kg({ id: "tuetano", name: "Tuétano", categoryId: "subproductos", price: null, active: false }),
  kg({ id: "charchas", name: "Charchas", categoryId: "subproductos", price: null, active: false }),
  kg({ id: "chunchules", name: "Chunchules", categoryId: "subproductos", price: null, active: false }),
  kg({ id: "higado", name: "Hígado", categoryId: "subproductos", price: null, active: false }),

  // ─────────────────────────── EXTRAS ───────────────────────────
  kg({
    id: "longaniza-artesanal",
    name: "Longaniza Artesanal / Tradicional",
    categoryId: "extras",
    price: 7990,
    preparation: false,
  }),
  kg({ id: "butifarras", name: "Butifarras", categoryId: "extras", price: 7990, preparation: false }),
  fixedPackage({
    id: "carbon",
    name: "Carbón",
    categoryId: "extras",
    price: 4990,
    packageLabel: "Bolsa de 2,5 kg",
    preparation: false,
    instructions: false,
  }),
  // Pendiente de confirmación de precio y presentación.
  kg({
    id: "longaniza-ahumada",
    name: "Longaniza Ahumada",
    categoryId: "extras",
    price: null,
    preparation: false,
    active: false,
  }),
];

/** Índice por id para resolver rápidamente los productos del carrito. */
export const productsById: Record<string, Product> = Object.fromEntries(
  products.map((product) => [product.id, product]),
);

export const getProduct = (productId: string): Product | null =>
  productsById[productId] ?? null;

/**
 * Productos publicables en el catálogo: solo los que tienen precio vigente
 * confirmado. Los productos sin precio permanecen registrados internamente pero
 * nunca se muestran al cliente.
 *
 * Un producto publicado con `active: false` sí aparece, marcado como
 * "No disponible temporalmente" y sin controles de agregado.
 *
 * Orden: por categoría y, dentro de ella, por precio de mayor a menor.
 */
export const catalogProducts: Product[] = products
  .filter((product) => product.price !== null)
  .sort((a, b) => {
    const categoryDiff =
      categoryOrder.indexOf(a.categoryId) - categoryOrder.indexOf(b.categoryId);
    if (categoryDiff !== 0) return categoryDiff;
    return (b.price ?? 0) - (a.price ?? 0);
  });

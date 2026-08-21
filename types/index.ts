/**
 * Tipos centrales del dominio de Huele a Parrilla.
 * Toda la aplicación (catálogo, carrito, cotizador, despacho, formulario y
 * generador de WhatsApp) trabaja sobre estas definiciones.
 */

export type CategoryId = "vacuno" | "cerdo" | "pollo" | "subproductos" | "extras";

export interface Category {
  id: CategoryId;
  name: string;
  /** Orden en que aparecen los filtros del catálogo. */
  order: number;
}

/**
 * Modalidad comercial: define cómo puede seleccionar realmente el producto el
 * cliente. No debe confundirse con `pricingUnit`, que solo indica cómo se
 * valoriza el producto.
 */
export type SaleMode =
  | "KG_STANDARD"
  | "PIECE_VARIABLE_WEIGHT"
  | "KG_WITH_WHOLE_PIECE_REFERENCE"
  | "FIXED_UNIT"
  | "FIXED_PACKAGE"
  | "PIECE_BY_WEIGHT_WITHOUT_CONFIRMED_RANGE";

/** Cómo se valoriza el producto. */
export type PricingUnit = "kg" | "unit" | "package";

/**
 * Qué significa "Pieza entera" para este producto.
 * - standardPreparation: entregar la cantidad pedida sin porcionar (Lomo Vetado).
 * - forcesVariablePieceWeight: activa el rango real de la pieza (Asado de Tiras).
 * - alreadySoldAsWholePiece: ya se vende como pieza (Filete, Estomaguillo).
 */
export type WholePieceBehavior =
  | "standardPreparation"
  | "forcesVariablePieceWeight"
  | "alreadySoldAsWholePiece";

export type PreparationType = "whole" | "portioned";

export interface Product {
  id: string;
  name: string;
  categoryId: CategoryId;
  /** Precio en pesos chilenos como entero. `null` cuando no hay precio vigente. */
  price: number | null;
  pricingUnit: PricingUnit;
  saleMode: SaleMode;
  minimumQuantity: number;
  quantityStep: number;
  approxWeightMin: number | null;
  approxWeightMax: number | null;
  wholePieceWeightMin: number | null;
  wholePieceWeightMax: number | null;
  wholePieceBehavior: WholePieceBehavior;
  allowPreparationChoice: boolean;
  allowSpecialInstructions: boolean;
  portionPlaceholder: string | null;
  specialInstructionsPlaceholder: string | null;
  active: boolean;
  featured: boolean;
  image: string | null;
  shortDescription: string | null;
  operationalNote: string | null;
  /** Presentación fija, p. ej. "Bolsa de 2,5 kg". */
  packageLabel?: string | null;
  /** El valor solo puede conocerse tras el pesaje real. */
  estimateUnavailable?: boolean;
}

export interface Zone {
  id: number;
  /** Uso interno. Nunca se muestra al cliente. */
  internalName: string;
  /** Mínimo exigido considerando SOLO productos, sin despacho. */
  minimumOrder: number;
  shippingFee: number;
}

export interface Commune {
  id: string;
  name: string;
  slug: string;
  zoneId: number;
  active: boolean;
  deliveryNote: string | null;
}

export interface CommuneConditions {
  commune: Commune;
  zone: Zone;
  minimumOrder: number;
  shippingFee: number;
  active: boolean;
}

export interface CartItem {
  cartItemId: string;
  productId: string;
  /** Expresada en la unidad que corresponda: kg, piezas, bolsas o unidades. */
  quantity: number;
  preparationType: PreparationType | null;
  portionInstructions: string | null;
  specialInstructions: string | null;
  requiresAdvancePreparation: boolean;
}

/** Resultado estructurado de todo cálculo de precio. */
export interface PriceCalculation {
  min: number;
  max: number;
  exact: boolean;
  pricePending: boolean;
  weightMin: number | null;
  weightMax: number | null;
  /** "2 kg", "1 pieza", "2 bolsas de 2,5 kg", "2 unidades". */
  quantityLabel: string;
  /** "1,8–2,8 kg aprox." o null. */
  weightLabel: string | null;
  /** "$31.980", "$32.382–$50.372 aprox." o "Valor final según peso real". */
  priceLabel: string;
}

export type QuantityUnit = "kg" | "piece" | "unit" | "package";

export type DeliveryValidationStatus =
  | "EMPTY_CART"
  | "SAFE"
  | "UNCERTAIN"
  | "BELOW_MINIMUM"
  | "UNKNOWN_VALUE";

export interface DeliveryValidation {
  status: DeliveryValidationStatus;
  minimumOrder: number;
  shippingFee: number;
  /** minimumOrder − cartMin. Fórmula única en toda la aplicación. */
  missingAmount: number;
  cartMin: number;
  cartMax: number;
  hasUnpricedItem: boolean;
}

export interface CartTotals {
  cartMin: number;
  cartMax: number;
  exact: boolean;
  hasUnpricedItem: boolean;
  totalMin: number | null;
  totalMax: number | null;
  shippingFee: number | null;
  itemCount: number;
  requiresAdvancePreparation: boolean;
}

export type ResidenceType = "house" | "apartment";
export type PaymentMethod = "bank_transfer" | "cash";

export interface CustomerData {
  fullName: string;
  phone: string;
  email: string;
}

export interface DeliveryData {
  address: string;
  residenceType: ResidenceType | null;
  apartmentNumber: string;
  deliveryInstructions: string;
}

export interface PaymentData {
  method: PaymentMethod | null;
}

/** Estado completo del pedido usado por el resumen y el generador de WhatsApp. */
export interface OrderSnapshot {
  items: CartItem[];
  products: Record<string, Product>;
  commune: Commune | null;
  conditions: CommuneConditions | null;
  totals: CartTotals;
  customer: CustomerData;
  delivery: DeliveryData;
  payment: PaymentData;
}

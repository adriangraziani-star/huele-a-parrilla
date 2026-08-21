import { communes, getCommune } from "@/data/communes";
import { getZone } from "@/data/zones";
import { normalizeSearchText } from "@/lib/text";
import type {
  Commune,
  CommuneConditions,
  DeliveryValidation,
  DeliveryValidationStatus,
} from "@/types";

/** Condiciones vigentes de una comuna, derivadas de su zona. */
export const getShippingForCommune = (
  communeId: string | null,
): CommuneConditions | null => {
  const commune = getCommune(communeId);
  if (!commune) return null;

  const zone = getZone(commune.zoneId);
  if (!zone) return null;

  return {
    commune,
    zone,
    minimumOrder: zone.minimumOrder,
    shippingFee: zone.shippingFee,
    active: commune.active,
  };
};

/**
 * Busca comunas ignorando mayúsculas y tildes.
 * Orden: coincidencia exacta → comienzo del nombre → coincidencia parcial.
 */
export const searchCommunes = (query: string, limit = 8): Commune[] => {
  const term = normalizeSearchText(query);
  if (term.length === 0) return [];

  const scored = communes
    .filter((commune) => commune.active)
    .map((commune) => {
      const name = normalizeSearchText(commune.name);
      if (name === term) return { commune, score: 0 };
      if (name.startsWith(term)) return { commune, score: 1 };
      if (name.includes(term)) return { commune, score: 2 };
      return null;
    })
    .filter((entry): entry is { commune: Commune; score: number } => entry !== null)
    .sort((a, b) => a.score - b.score || a.commune.name.localeCompare(b.commune.name, "es"));

  return scored.slice(0, limit).map((entry) => entry.commune);
};

/** Listado completo ordenado alfabéticamente, para el enlace "Ver comunas". */
export const listActiveCommunes = (): Commune[] =>
  [...communes]
    .filter((commune) => commune.active)
    .sort((a, b) => a.name.localeCompare(b.name, "es"));

/**
 * Valida el pedido mínimo de la comuna.
 *
 * REGLA CRÍTICA: la comparación usa exclusivamente el subtotal de PRODUCTOS.
 * El despacho nunca se suma antes de validar.
 *
 * El monto faltante es siempre `minimumOrder − cartMin`, tanto en
 * `UNCERTAIN` como en `BELOW_MINIMUM`: el objetivo es asegurar el mínimo
 * incluso en el peor escenario de pesaje.
 */
export const validateDeliveryMinimum = (
  cart: { cartMin: number; cartMax: number; hasUnpricedItem: boolean; itemCount: number },
  conditions: CommuneConditions,
): DeliveryValidation => {
  const { minimumOrder, shippingFee } = conditions;
  const missingAmount = Math.max(0, minimumOrder - cart.cartMin);

  let status: DeliveryValidationStatus;
  if (cart.itemCount === 0) {
    status = "EMPTY_CART";
  } else if (cart.cartMin >= minimumOrder) {
    status = "SAFE";
  } else if (cart.hasUnpricedItem) {
    status = "UNKNOWN_VALUE";
  } else if (cart.cartMax >= minimumOrder) {
    status = "UNCERTAIN";
  } else {
    status = "BELOW_MINIMUM";
  }

  return {
    status,
    minimumOrder,
    shippingFee,
    missingAmount,
    cartMin: cart.cartMin,
    cartMax: cart.cartMax,
    hasUnpricedItem: cart.hasUnpricedItem,
  };
};

/**
 * El mínimo se considera completamente cumplido solo cuando el peor escenario
 * de pesaje ya lo alcanza. Política conservadora.
 */
export const isMinimumSatisfied = (validation: DeliveryValidation): boolean =>
  validation.status === "SAFE";

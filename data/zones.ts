import type { Zone } from "@/types";

/**
 * Las zonas son lógica interna: nunca se muestran al cliente.
 * Cambiar aquí una condición actualiza automáticamente todas sus comunas.
 */
export const zones: Zone[] = [
  { id: 1, internalName: "Zona 1", minimumOrder: 40000, shippingFee: 2990 },
  { id: 2, internalName: "Zona 2", minimumOrder: 50000, shippingFee: 4990 },
  { id: 3, internalName: "Zona 3", minimumOrder: 60000, shippingFee: 4990 },
  { id: 4, internalName: "Zona 4", minimumOrder: 100000, shippingFee: 14990 },
];

export const getZone = (zoneId: number): Zone | null =>
  zones.find((zone) => zone.id === zoneId) ?? null;

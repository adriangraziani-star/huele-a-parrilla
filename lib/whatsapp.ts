import {
  businessConfig,
  deliveryDaysLabel,
} from "@/data/business";
import { formatCLP, formatWeightRange } from "@/lib/format";
import { normalizeChileanPhone } from "@/lib/phone";
import { formatEstimate, type CartLine } from "@/lib/pricing";
import { isBlank } from "@/lib/text";
import type { OrderSnapshot, PaymentMethod, PreparationType } from "@/types";

/** Valores internos → texto visible para el cliente y para WhatsApp. */
export const preparationLabel = (value: PreparationType): string =>
  value === "whole" ? "Pieza entera" : "Porcionado";

export const paymentLabel = (value: PaymentMethod): string =>
  value === "bank_transfer" ? "Transferencia" : "Efectivo";

export const residenceLabel = (value: "house" | "apartment"): string =>
  value === "house" ? "Casa" : "Departamento";

/** Añade una línea solo si tiene contenido. Nunca imprime null/undefined. */
const pushIfPresent = (lines: string[], label: string, value: string | null | undefined) => {
  if (isBlank(value)) return;
  lines.push(`${label}: ${value}`);
};

const buildProductBlock = (line: CartLine): string => {
  const { product, item, calculation } = line;
  const rows: string[] = [`• ${product.name} — ${calculation.quantityLabel}`];

  if (calculation.pricePending) {
    if (product.price !== null) {
      rows.push(`Precio: ${formatCLP(product.price)}/kg`);
    }
    rows.push("Valor final según peso real");
  } else if (calculation.exact) {
    rows.push(`Subtotal: ${formatCLP(calculation.min)}`);
  } else {
    if (calculation.weightMin !== null && calculation.weightMax !== null) {
      rows.push(
        `Peso aprox.: ${formatWeightRange(calculation.weightMin, calculation.weightMax)}`,
      );
    }
    if (product.price !== null) {
      rows.push(`Precio: ${formatCLP(product.price)}/kg`);
    }
    rows.push(`Valor estimado: ${formatEstimate(calculation.min, calculation.max, { approxSuffix: false })}`);
  }

  if (item.preparationType) {
    rows.push(`Preparación: ${preparationLabel(item.preparationType)}`);
  }
  pushIfPresent(rows, "Cómo prepararlo", item.portionInstructions);
  pushIfPresent(rows, "Indicaciones", item.specialInstructions);

  return rows.join("\n");
};

/**
 * Construye el mensaje prellenado de WhatsApp a partir del estado real del
 * pedido. Nunca se guarda una copia estática: se regenera en cada uso.
 */
export const generateWhatsAppMessage = (
  order: OrderSnapshot,
  lines: CartLine[],
): string => {
  const blocks: string[] = [];

  blocks.push(
    "Hola Huele a Parrilla 👋🥩\nArmé mi pedido desde la página web y quisiera coordinarlo:",
  );

  // CLIENTE
  const customerRows: string[] = ["*CLIENTE*"];
  pushIfPresent(customerRows, "Nombre", order.customer.fullName.trim());
  const phone = normalizeChileanPhone(order.customer.phone);
  pushIfPresent(customerRows, "WhatsApp", phone.display ?? order.customer.phone.trim());
  pushIfPresent(customerRows, "Correo", order.customer.email.trim());
  blocks.push(customerRows.join("\n"));

  // ENTREGA
  const deliveryRows: string[] = ["*ENTREGA*"];
  pushIfPresent(deliveryRows, "Comuna", order.commune?.name);
  pushIfPresent(deliveryRows, "Dirección", order.delivery.address.trim());
  if (order.delivery.residenceType) {
    deliveryRows.push(`Domicilio: ${residenceLabel(order.delivery.residenceType)}`);
    if (order.delivery.residenceType === "apartment") {
      pushIfPresent(deliveryRows, "Depto.", order.delivery.apartmentNumber.trim());
    }
  }
  pushIfPresent(deliveryRows, "Indicaciones", order.delivery.deliveryInstructions.trim());
  blocks.push(deliveryRows.join("\n"));

  // PEDIDO
  // El encabezado va pegado al primer producto; los productos se separan
  // entre sí por una línea en blanco para que el mensaje sea legible.
  blocks.push(`*PEDIDO*\n${lines.map(buildProductBlock).join("\n\n")}`);

  // VALORES
  const { totals, conditions } = order;
  const valueRows: string[] = ["*VALORES*"];
  const shippingLabel = conditions
    ? `Despacho ${conditions.commune.name}: ${formatCLP(conditions.shippingFee)}`
    : null;

  if (totals.hasUnpricedItem) {
    valueRows.push(`Subtotal calculable: ${formatEstimate(totals.cartMin, totals.cartMax)}`);
    const pendingNames = lines
      .filter((line) => line.calculation.pricePending)
      .map((line) => line.product.name);
    for (const name of pendingNames) {
      valueRows.push(`+ ${name} según peso real`);
    }
    if (shippingLabel) valueRows.push(shippingLabel);
    valueRows.push("Total definitivo sujeto a pesaje");
  } else {
    valueRows.push(`Productos: ${formatEstimate(totals.cartMin, totals.cartMax)}`);
    if (shippingLabel) valueRows.push(shippingLabel);
    if (totals.totalMin !== null && totals.totalMax !== null) {
      valueRows.push(`Total estimado: ${formatEstimate(totals.totalMin, totals.totalMax)}`);
    }
  }
  blocks.push(valueRows.join("\n"));

  // PAGO
  if (order.payment.method) {
    blocks.push(`Forma de pago: ${paymentLabel(order.payment.method)}`);
  }

  // ANTICIPACIÓN
  if (totals.requiresAdvancePreparation) {
    blocks.push(
      `⚠️ Este pedido incluye preparación especial y considera el requerimiento mínimo de ${businessConfig.advanceHours} horas de anticipación.`,
    );
  }

  blocks.push(
    `Quedo atento para coordinar la jornada de despacho disponible (${deliveryDaysLabel}). ¡Gracias!`,
  );

  return blocks.join("\n\n");
};

/** URL de wa.me con el mensaje codificado. Destino: siempre Huele a Parrilla. */
export const generateWhatsAppUrl = (message: string): string =>
  `https://wa.me/${businessConfig.whatsapp}?text=${encodeURIComponent(message)}`;

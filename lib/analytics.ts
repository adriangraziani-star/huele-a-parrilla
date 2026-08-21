/**
 * Capa de analítica preparada pero no conectada.
 *
 * La V1 no integra Meta Pixel, Google Analytics ni Tag Manager: no hay
 * credenciales configuradas. `trackEvent` deja la arquitectura lista para
 * enchufar un proveedor sin tocar los componentes.
 *
 * NUNCA enviar información personal (nombre, teléfono, correo, dirección ni
 * instrucciones escritas por el cliente).
 */

export type AnalyticsEvent =
  | "view_catalog"
  | "search_product"
  | "select_category"
  | "add_to_cart"
  | "remove_from_cart"
  | "update_quantity"
  | "open_cart"
  | "commune_search"
  | "select_commune"
  | "delivery_minimum_met"
  | "delivery_minimum_not_met"
  | "delivery_minimum_uncertain"
  | "begin_customer_form"
  | "customer_form_error"
  | "payment_method_selected"
  | "review_order"
  | "whatsapp_order_click";

export type AnalyticsPayload = Record<string, string | number | boolean | null>;

type AnalyticsSink = (event: AnalyticsEvent, payload?: AnalyticsPayload) => void;

let sink: AnalyticsSink | null = null;

/** Permite conectar un proveedor real cuando existan credenciales. */
export const setAnalyticsSink = (nextSink: AnalyticsSink | null): void => {
  sink = nextSink;
};

export const trackEvent = (
  event: AnalyticsEvent,
  payload?: AnalyticsPayload,
): void => {
  if (!sink) return;
  try {
    sink(event, payload);
  } catch {
    // La analítica nunca debe interrumpir la compra.
  }
};

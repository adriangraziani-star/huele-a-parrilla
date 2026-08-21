"use client";

import { useMemo, useState } from "react";

import { Notice } from "@/components/ui/Notice";
import { IconWhatsApp } from "@/components/ui/Icons";
import {
  businessConfig,
  deliveryDaysLabel,
  deliveryWindowShort,
} from "@/data/business";
import { productsById } from "@/data/products";
import { trackEvent } from "@/lib/analytics";
import { formatCLP, formatWeightRange } from "@/lib/format";
import { normalizeChileanPhone } from "@/lib/phone";
import { formatEstimate } from "@/lib/pricing";
import { scrollToSection } from "@/lib/scroll";
import { isBlank } from "@/lib/text";
import {
  generateWhatsAppMessage,
  generateWhatsAppUrl,
  paymentLabel,
  preparationLabel,
  residenceLabel,
} from "@/lib/whatsapp";
import { useOrder } from "@/store/order-store";
import { useUi } from "@/store/ui-store";
import type { OrderSnapshot } from "@/types";

export function OrderReviewSection() {
  const {
    lines,
    items,
    totals,
    commune,
    minimumSatisfied,
    unavailableItems,
    customer,
    delivery,
    payment,
  } = useOrder();
  const { openCart, showToast } = useUi();
  const [opened, setOpened] = useState(false);

  const formComplete =
    !isBlank(customer.fullName) &&
    normalizeChileanPhone(customer.phone).valid &&
    !isBlank(delivery.address) &&
    delivery.residenceType !== null &&
    (delivery.residenceType !== "apartment" || !isBlank(delivery.apartmentNumber)) &&
    payment.method !== null;

  const ready =
    lines.length > 0 &&
    unavailableItems.length === 0 &&
    commune !== null &&
    commune.active &&
    minimumSatisfied &&
    formComplete;

  const message = useMemo(() => {
    if (!ready || !commune) return "";
    const snapshot: OrderSnapshot = {
      items,
      products: productsById,
      commune: commune.commune,
      conditions: commune,
      totals,
      customer,
      delivery,
      payment,
    };
    return generateWhatsAppMessage(snapshot, lines);
  }, [ready, commune, items, totals, customer, delivery, payment, lines]);

  const handleSend = () => {
    if (!ready) return;
    trackEvent("whatsapp_order_click", {
      products: lines.length,
      commune_id: commune?.commune.id ?? null,
      subtotal_min: totals.cartMin,
      subtotal_max: totals.cartMax,
      special_preparation: totals.requiresAdvancePreparation,
    });
    // Abrimos WhatsApp con el mensaje preparado: el envío lo confirma el cliente.
    window.open(generateWhatsAppUrl(message), "_blank", "noopener,noreferrer");
    setOpened(true);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      showToast("Pedido copiado");
    } catch {
      showToast("No pudimos copiar el resumen en este navegador");
    }
  };

  return (
    <section id="resumen" className="section bg-ivory">
      <div className="container-page">
        <header className="max-w-2xl">
          <p className="eyebrow">Revisión</p>
          <h2 className="display-2 mt-3">Revisa tu pedido</h2>
          <p className="mt-4 text-[1.02rem] leading-relaxed text-charcoal-muted">
            Verifica que tus productos, datos y condiciones de entrega estén
            correctos antes de enviarnos la solicitud por WhatsApp.
          </p>
        </header>

        {lines.length === 0 ? (
          <div className="panel mt-8 max-w-xl px-6 py-10 text-center">
            <p className="display-3">Todavía no hay nada que revisar</p>
            <p className="mt-2 text-sm text-charcoal-muted">
              Arma tu pedido en el catálogo y vuelve aquí para revisarlo antes de
              enviarlo.
            </p>
            <button
              type="button"
              onClick={() => scrollToSection("catalogo")}
              className="btn btn-charcoal mt-6"
            >
              Ver catálogo
            </button>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
            <div className="space-y-6">
              {/* TU PEDIDO */}
              <Block title="Tu pedido" action={{ label: "Editar pedido", onClick: openCart }}>
                <ul className="divide-y divide-leather/15">
                  {lines.map(({ item, product, calculation }) => (
                    <li key={item.cartItemId} className="py-3.5 first:pt-0 last:pb-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-sans font-bold text-charcoal">
                            {product.name}
                          </p>
                          <p className="mt-0.5 text-[0.83rem] text-charcoal-muted">
                            Cantidad: {calculation.quantityLabel}
                          </p>
                          {calculation.weightMin !== null &&
                          calculation.weightMax !== null &&
                          !calculation.exact ? (
                            <p className="text-[0.83rem] text-charcoal-muted">
                              Peso aproximado:{" "}
                              {formatWeightRange(
                                calculation.weightMin,
                                calculation.weightMax,
                              )}
                            </p>
                          ) : null}
                          {product.pricingUnit === "kg" && product.price !== null ? (
                            <p className="text-[0.83rem] text-charcoal-muted">
                              Precio por kg: {formatCLP(product.price)}
                            </p>
                          ) : null}
                          {product.packageLabel ? (
                            <p className="text-[0.83rem] text-charcoal-muted">
                              Presentación: {product.packageLabel}
                            </p>
                          ) : null}
                          {item.preparationType ? (
                            <p className="mt-1 text-[0.83rem] text-charcoal">
                              <span className="font-semibold">Preparación:</span>{" "}
                              {preparationLabel(item.preparationType)}
                            </p>
                          ) : null}
                          {item.portionInstructions ? (
                            <p className="text-[0.83rem] whitespace-pre-line text-charcoal">
                              <span className="font-semibold">Cómo prepararlo:</span>{" "}
                              {item.portionInstructions}
                            </p>
                          ) : null}
                          {item.specialInstructions ? (
                            <p className="text-[0.83rem] whitespace-pre-line text-charcoal">
                              <span className="font-semibold">
                                Indicaciones especiales:
                              </span>{" "}
                              {item.specialInstructions}
                            </p>
                          ) : null}
                        </div>
                        <p className="price shrink-0 text-right text-[0.92rem]">
                          {calculation.pricePending ? (
                            <span className="text-[0.78rem] font-semibold text-leather">
                              Según peso real
                            </span>
                          ) : (
                            formatEstimate(calculation.min, calculation.max, {
                              approxSuffix: false,
                            })
                          )}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Block>

              {/* ENTREGA */}
              <Block
                title="Entrega"
                action={{
                  label: "Cambiar comuna o dirección",
                  onClick: () => scrollToSection("despacho"),
                }}
              >
                <dl className="space-y-1.5 text-[0.88rem]">
                  <Row label="Comuna" value={commune?.commune.name} />
                  <Row label="Dirección" value={delivery.address} />
                  <Row
                    label="Tipo de domicilio"
                    value={
                      delivery.residenceType
                        ? residenceLabel(delivery.residenceType)
                        : undefined
                    }
                  />
                  {delivery.residenceType === "apartment" ? (
                    <Row label="Departamento" value={delivery.apartmentNumber} />
                  ) : null}
                  <Row
                    label="Indicaciones para el delivery"
                    value={delivery.deliveryInstructions}
                  />
                  <Row
                    label="Despacho"
                    value={commune ? formatCLP(commune.shippingFee) : undefined}
                  />
                  <Row label="Días de reparto" value={deliveryDaysLabel} />
                  <Row label="Horario aproximado" value={deliveryWindowShort} />
                </dl>
                <p className="mt-3 text-[0.82rem] text-charcoal-muted">
                  La jornada disponible de despacho será coordinada contigo
                  directamente por WhatsApp.
                </p>
              </Block>

              {/* TUS DATOS */}
              <Block
                title="Tus datos"
                action={{ label: "Editar datos", onClick: () => scrollToSection("datos") }}
              >
                <dl className="space-y-1.5 text-[0.88rem]">
                  <Row label="Nombre" value={customer.fullName} />
                  <Row
                    label="WhatsApp"
                    value={
                      normalizeChileanPhone(customer.phone).display ?? customer.phone
                    }
                  />
                  <Row label="Correo" value={customer.email} />
                  <Row
                    label="Forma de pago"
                    value={payment.method ? paymentLabel(payment.method) : undefined}
                  />
                </dl>
                <p className="mt-3 text-[0.82rem] font-semibold text-charcoal">
                  Pago al recibir.
                </p>
              </Block>
            </div>

            {/* VALORES + CTA */}
            <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
              <div className="panel p-5">
                <h3 className="display-3">Resumen de valores</h3>

                <dl className="mt-4 space-y-2 text-[0.9rem]">
                  <div className="flex justify-between gap-4">
                    <dt className="text-charcoal-muted">
                      {totals.hasUnpricedItem ? "Subtotal calculable" : "Productos"}
                    </dt>
                    <dd className="price">
                      {formatEstimate(totals.cartMin, totals.cartMax)}
                    </dd>
                  </div>
                  {lines
                    .filter((line) => line.calculation.pricePending)
                    .map((line) => (
                      <div
                        key={line.item.cartItemId}
                        className="flex justify-between gap-4"
                      >
                        <dt className="text-charcoal-muted">+ {line.product.name}</dt>
                        <dd className="text-[0.8rem] font-semibold text-leather">
                          Según peso real
                        </dd>
                      </div>
                    ))}
                  <div className="flex justify-between gap-4">
                    <dt className="text-charcoal-muted">Despacho</dt>
                    <dd className={commune ? "price" : "text-[0.8rem] text-leather"}>
                      {commune ? formatCLP(commune.shippingFee) : "Por calcular"}
                    </dd>
                  </div>
                </dl>

                <div className="hairline mt-3 flex items-baseline justify-between gap-4 pt-3">
                  <span className="font-sans font-bold text-charcoal">
                    {totals.hasUnpricedItem ? "Total parcial estimado" : "Total estimado"}
                  </span>
                  <span className="price text-[1.3rem]">
                    {totals.totalMin !== null && totals.totalMax !== null
                      ? formatEstimate(totals.totalMin, totals.totalMax)
                      : formatEstimate(totals.cartMin, totals.cartMax)}
                  </span>
                </div>

                {totals.hasUnpricedItem ? (
                  <p className="mt-1.5 text-[0.78rem] text-leather">
                    + producto(s) cuyo valor será confirmado según peso real.
                  </p>
                ) : null}

                {!totals.exact || totals.hasUnpricedItem ? (
                  <p className="mt-3 text-[0.78rem] leading-relaxed text-charcoal-muted">
                    Los pesos de algunas piezas son aproximados y pueden variar. El
                    monto definitivo será confirmado según el peso real de los
                    productos preparados.
                  </p>
                ) : null}
              </div>

              <div className="panel space-y-3 p-5">
                <p className="font-sans text-[0.88rem] font-bold text-charcoal">
                  Antes de enviar tu pedido
                </p>
                <p className="text-[0.84rem] leading-relaxed text-charcoal-muted">
                  {businessConfig.name} realiza despachos los días{" "}
                  {deliveryDaysLabel} aproximadamente entre las{" "}
                  {businessConfig.deliveryWindow.from} y las{" "}
                  {businessConfig.deliveryWindow.to} hrs.
                </p>

                {totals.requiresAdvancePreparation ? (
                  <Notice tone="info" icon="clock" title="Preparación especial">
                    Tu pedido contiene porcionado o indicaciones especiales. Debe
                    solicitarse con al menos {businessConfig.advanceHours} horas de
                    anticipación.
                  </Notice>
                ) : null}

                {!ready ? <PendingChecklist
                  hasItems={lines.length > 0}
                  noUnavailable={unavailableItems.length === 0}
                  hasCommune={commune !== null && commune.active}
                  minimumSatisfied={minimumSatisfied}
                  formComplete={formComplete}
                /> : null}

                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!ready}
                  className="btn btn-primary w-full"
                >
                  <IconWhatsApp />
                  Enviar mi pedido por WhatsApp
                </button>

                <p className="text-center text-[0.76rem] leading-relaxed text-charcoal-muted">
                  Al presionar este botón abriremos WhatsApp con la información de tu
                  pedido preparada. El mensaje no se enviará hasta que tú lo
                  confirmes dentro de WhatsApp.
                </p>

                {ready ? (
                  <button type="button" onClick={handleCopy} className="btn-ghost w-full">
                    Copiar resumen
                  </button>
                ) : null}
              </div>

              {opened ? (
                <Notice tone="confirm" icon="check" title="Tu solicitud está lista para coordinar">
                  Abrimos WhatsApp con toda la información de tu pedido. Solo debes
                  enviar el mensaje para continuar la coordinación con nuestro
                  equipo.
                </Notice>
              ) : null}
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}

function PendingChecklist({
  hasItems,
  noUnavailable,
  hasCommune,
  minimumSatisfied,
  formComplete,
}: {
  hasItems: boolean;
  noUnavailable: boolean;
  hasCommune: boolean;
  minimumSatisfied: boolean;
  formComplete: boolean;
}) {
  const pending: string[] = [];
  if (!hasItems) pending.push("Agrega al menos un producto a tu pedido.");
  if (!noUnavailable) pending.push("Elimina los productos no disponibles.");
  if (!hasCommune) pending.push("Selecciona una comuna con despacho habilitado.");
  else if (!minimumSatisfied) {
    pending.push("Tu pedido aún no cumple con el mínimo de despacho de tu comuna.");
  }
  if (!formComplete) pending.push("Completa los datos para tu pedido.");

  if (pending.length === 0) return null;

  return (
    <Notice tone="warning" icon="alert" title="Falta un paso antes de enviar">
      <ul className="mt-1 list-disc space-y-0.5 pl-4">
        {pending.map((entry) => (
          <li key={entry}>{entry}</li>
        ))}
      </ul>
    </Notice>
  );
}

function Block({
  title,
  action,
  children,
}: {
  title: string;
  action?: { label: string; onClick: () => void };
  children: React.ReactNode;
}) {
  return (
    <div className="card p-5">
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <h3 className="display-3">{title}</h3>
        {action ? (
          <button type="button" onClick={action.onClick} className="btn-ghost">
            {action.label}
          </button>
        ) : null}
      </div>
      {children}
    </div>
  );
}

/** Omite por completo las filas sin contenido: nunca imprime null ni vacíos. */
function Row({ label, value }: { label: string; value?: string | null }) {
  if (isBlank(value)) return null;
  return (
    <div className="flex flex-wrap justify-between gap-x-4">
      <dt className="text-charcoal-muted">{label}</dt>
      <dd className="whitespace-pre-line text-right font-semibold text-charcoal">
        {value}
      </dd>
    </div>
  );
}

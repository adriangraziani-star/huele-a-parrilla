"use client";

import { useState } from "react";

import { Notice } from "@/components/ui/Notice";
import { businessConfig } from "@/data/business";
import { formatCLP } from "@/lib/format";
import { formatEstimate, type CartLine } from "@/lib/pricing";
import type { CartTotals, CommuneConditions, DeliveryValidation } from "@/types";

interface CartSummaryProps {
  totals: CartTotals;
  lines: CartLine[];
  conditions: CommuneConditions | null;
  validation: DeliveryValidation | null;
  onChangeCommune?: () => void;
}

/**
 * Bloque de valores del pedido.
 * Antes de seleccionar comuna el despacho se muestra como "Por calcular":
 * nunca como $0, porque sugeriría despacho gratuito.
 */
export function CartSummary({
  totals,
  lines,
  conditions,
  validation,
  onChangeCommune,
}: CartSummaryProps) {
  const [explanationOpen, setExplanationOpen] = useState(false);

  const pendingProducts = lines
    .filter((line) => line.calculation.pricePending)
    .map((line) => line.product.name);

  const showRangeNote = !totals.exact || totals.hasUnpricedItem;

  return (
    <div className="space-y-3">
      <dl className="space-y-2 text-[0.9rem]">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-charcoal-muted">
            {totals.hasUnpricedItem ? "Subtotal calculable" : "Productos"}
          </dt>
          <dd className="price">{formatEstimate(totals.cartMin, totals.cartMax)}</dd>
        </div>

        {pendingProducts.map((name) => (
          <div key={name} className="flex items-baseline justify-between gap-4">
            <dt className="text-charcoal-muted">+ {name}</dt>
            <dd className="text-[0.82rem] font-semibold text-leather">
              Según peso real
            </dd>
          </div>
        ))}

        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-charcoal-muted">
            {conditions ? `Despacho a ${conditions.commune.name}` : "Despacho"}
            {conditions && onChangeCommune ? (
              <button type="button" onClick={onChangeCommune} className="btn-ghost ml-1">
                Cambiar
              </button>
            ) : null}
          </dt>
          <dd className={conditions ? "price" : "text-[0.82rem] font-semibold text-leather"}>
            {conditions ? formatCLP(conditions.shippingFee) : "Por calcular"}
          </dd>
        </div>
      </dl>

      <div className="hairline pt-3">
        {totals.hasUnpricedItem ? (
          <div>
            <div className="flex items-baseline justify-between gap-3">
              <span className="shrink-0 font-sans text-[0.95rem] font-bold whitespace-nowrap text-charcoal">
                Total parcial estimado
              </span>
              <span className="price text-right text-[1.05rem] leading-tight">
                {totals.totalMin !== null && totals.totalMax !== null
                  ? formatEstimate(totals.totalMin, totals.totalMax)
                  : formatEstimate(totals.cartMin, totals.cartMax)}
              </span>
            </div>
            <p className="mt-1 text-[0.78rem] text-leather">
              + producto(s) sujeto(s) a peso real. El total definitivo se confirma
              tras el pesaje.
            </p>
          </div>
        ) : (
          <div className="flex items-baseline justify-between gap-3">
            <span className="shrink-0 font-sans text-[0.95rem] font-bold whitespace-nowrap text-charcoal">
              {conditions ? "Total estimado" : "Subtotal estimado"}
            </span>
            <span className="price text-right text-[1.05rem] leading-tight">
              {conditions && totals.totalMin !== null && totals.totalMax !== null
                ? formatEstimate(totals.totalMin, totals.totalMax)
                : formatEstimate(totals.cartMin, totals.cartMax)}
            </span>
          </div>
        )}
      </div>

      {showRangeNote ? (
        <div className="text-[0.78rem] leading-relaxed text-charcoal-muted">
          <p>
            Algunos productos pueden variar según el peso real de las piezas. El
            monto definitivo se confirma una vez preparados y pesados.
          </p>
          <button
            type="button"
            onClick={() => setExplanationOpen((value) => !value)}
            aria-expanded={explanationOpen}
            className="btn-ghost mt-0.5 px-0"
          >
            ¿Por qué es aproximado?
          </button>
          {explanationOpen ? (
            <p className="mt-1 rounded-[8px] bg-cream/70 px-3 py-2">
              Algunos cortes se comercializan por pieza completa. Como cada pieza
              posee un peso diferente, calculamos un rango utilizando sus pesos
              aproximados. El monto definitivo se confirma según el peso real.
            </p>
          ) : null}
        </div>
      ) : null}

      {validation ? <MinimumStatus validation={validation} conditions={conditions} /> : null}

      {totals.requiresAdvancePreparation ? (
        <Notice tone="info" icon="clock">
          Este pedido incluye preparación especial y debe realizarse con al menos{" "}
          {businessConfig.advanceHours} horas de anticipación.
        </Notice>
      ) : null}

      <p className="text-[0.78rem] text-charcoal-muted">
        Te confirmaremos los pesos definitivos antes del despacho.
      </p>
    </div>
  );
}

function MinimumStatus({
  validation,
  conditions,
}: {
  validation: DeliveryValidation;
  conditions: CommuneConditions | null;
}) {
  const communeName = conditions?.commune.name ?? "tu comuna";

  switch (validation.status) {
    case "SAFE":
      return (
        <Notice tone="confirm" icon="check">
          Tu pedido cumple con el mínimo de despacho para {communeName}.
        </Notice>
      );

    case "UNCERTAIN":
      return (
        <Notice
          tone="warning"
          icon="alert"
          title="El cumplimiento depende del peso final"
        >
          El valor mínimo estimado de tu pedido es{" "}
          {formatCLP(validation.cartMin)} y el pedido mínimo para {communeName} es{" "}
          {formatCLP(validation.minimumOrder)}. Te recomendamos agregar al menos{" "}
          <strong>{formatCLP(validation.missingAmount)}</strong> en productos para
          asegurarlo.
        </Notice>
      );

    case "BELOW_MINIMUM":
      return (
        <Notice
          tone="alert"
          icon="alert"
          title={`Te faltan ${formatCLP(validation.missingAmount)} en productos`}
        >
          Agrega un poco más a tu pedido para alcanzar el mínimo de despacho de{" "}
          {formatCLP(validation.minimumOrder)} correspondiente a {communeName}.
        </Notice>
      );

    case "UNKNOWN_VALUE":
      return (
        <Notice tone="warning" icon="alert">
          Tu pedido contiene productos cuyo valor depende del peso real. La
          validación definitiva del mínimo puede requerir confirmación por
          WhatsApp.
        </Notice>
      );

    case "EMPTY_CART":
      return null;
  }
}

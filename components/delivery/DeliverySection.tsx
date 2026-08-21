"use client";

import { useMemo, useRef, useState } from "react";

import { Notice } from "@/components/ui/Notice";
import { IconPin, IconSearch } from "@/components/ui/Icons";
import {
  businessConfig,
  deliveryDaysLabel,
  deliveryWindowShort,
} from "@/data/business";
import { trackEvent } from "@/lib/analytics";
import { listActiveCommunes, searchCommunes } from "@/lib/delivery";
import { formatCLP } from "@/lib/format";
import { formatEstimate } from "@/lib/pricing";
import { scrollToSection } from "@/lib/scroll";
import { useOrder } from "@/store/order-store";
import type { Commune, DeliveryValidationStatus } from "@/types";

export function DeliverySection() {
  const { commune, validation, totals, minimumSatisfied, setCommune } = useOrder();
  const [query, setQuery] = useState("");
  const [touched, setTouched] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = useMemo(() => searchCommunes(query), [query]);
  const allCommunes = useMemo(() => listActiveCommunes(), []);

  const select = (selected: Commune) => {
    setCommune(selected.id);
    setQuery("");
    setTouched(false);
    setListOpen(false);
  };

  const noResults = touched && query.trim().length > 1 && suggestions.length === 0;

  return (
    <section id="despacho" className="section bg-ivory">
      <div className="container-page">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div>
            <p className="eyebrow">Despacho</p>
            <h2 className="display-2 mt-3">
              Consulta las condiciones de despacho a tu comuna
            </h2>
            <p className="mt-4 max-w-xl text-[1.02rem] leading-relaxed text-charcoal-muted">
              Selecciona tu comuna para conocer el valor del despacho y el pedido
              mínimo correspondiente.
            </p>

            <div className="mt-7 max-w-md">
              <label className="field-label" htmlFor="buscador-comuna">
                Comuna
              </label>
              <div className="relative">
                <IconSearch
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-leather"
                  width={18}
                  height={18}
                />
                <input
                  id="buscador-comuna"
                  ref={inputRef}
                  type="text"
                  role="combobox"
                  aria-expanded={suggestions.length > 0}
                  aria-controls="sugerencias-comuna"
                  aria-autocomplete="list"
                  autoComplete="off"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setTouched(true);
                    if (event.target.value.length > 1) trackEvent("commune_search");
                  }}
                  placeholder="Escribe tu comuna"
                  className="field-input pl-10"
                />
              </div>

              {suggestions.length > 0 ? (
                <ul
                  id="sugerencias-comuna"
                  role="listbox"
                  aria-label="Comunas disponibles"
                  className="mt-2 overflow-hidden rounded-[var(--radius-field)] border border-leather/25 bg-[#fffdf9]"
                >
                  {suggestions.map((item) => (
                    <li key={item.id} role="option" aria-selected={commune?.commune.id === item.id}>
                      <button
                        type="button"
                        onClick={() => select(item)}
                        className="w-full border-b border-leather/10 px-4 py-2.5 text-left text-[0.9rem] font-semibold text-charcoal transition last:border-b-0 hover:bg-cream"
                      >
                        {item.name}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}

              {noResults ? (
                <Notice tone="warning" icon="alert" className="mt-3">
                  Por el momento no tenemos esta comuna habilitada para despacho
                  desde la página.
                </Notice>
              ) : null}

              <button
                type="button"
                onClick={() => setListOpen((value) => !value)}
                aria-expanded={listOpen}
                className="btn-ghost mt-2 px-0"
              >
                {listOpen ? "Ocultar comunas disponibles" : "Ver comunas disponibles"}
              </button>

              {listOpen ? (
                <ul className="mt-2 grid max-h-64 grid-cols-2 gap-x-4 gap-y-1 overflow-y-auto rounded-[var(--radius-field)] border border-leather/20 bg-[#fffdf9] p-4 text-[0.84rem]">
                  {allCommunes.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => select(item)}
                        className="text-left text-charcoal-muted transition hover:text-brand"
                      >
                        {item.name}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <div className="mt-9 max-w-xl border-l-2 border-copper/40 pl-4 text-[0.86rem] leading-relaxed text-charcoal-muted">
              <p className="font-bold text-charcoal">Información de entrega</p>
              <p className="mt-1.5">
                Realizamos despachos los días {deliveryDaysLabel} entre las{" "}
                {businessConfig.deliveryWindow.from} y las{" "}
                {businessConfig.deliveryWindow.to} hrs aproximadamente.
              </p>
              <p className="mt-1.5">
                La hora exacta de entrega puede variar según la ruta de reparto.
              </p>
              <p className="mt-1.5">
                Una vez enviada tu solicitud por WhatsApp coordinaremos contigo la
                jornada disponible.
              </p>
            </div>
          </div>

          {/* Resultado */}
          <div className="lg:pt-14">
            {!commune ? (
              <div className="panel px-6 py-10 text-center">
                <IconPin className="mx-auto text-copper" width={28} height={28} />
                <p className="display-3 mt-3">Selecciona tu comuna</p>
                <p className="mx-auto mt-2 max-w-xs text-sm text-charcoal-muted">
                  Aquí verás el valor del despacho, el pedido mínimo y si tu pedido
                  alcanza el mínimo requerido.
                </p>
              </div>
            ) : !commune.active ? (
              <div className="panel px-6 py-8">
                <Notice tone="warning" icon="alert">
                  El despacho a {commune.commune.name} se encuentra temporalmente no
                  disponible.
                </Notice>
              </div>
            ) : (
              <div className="panel overflow-hidden">
                <div className="bg-charcoal px-6 py-5 text-ivory">
                  <p className="text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-copper">
                    Sí, despachamos a
                  </p>
                  <p className="display-3 mt-1 text-ivory">{commune.commune.name}</p>
                </div>

                <dl className="grid grid-cols-2 gap-px bg-leather/15">
                  <div className="bg-cream px-5 py-4">
                    <dt className="text-[0.76rem] font-semibold uppercase tracking-wide text-charcoal-muted">
                      Pedido mínimo
                    </dt>
                    <dd className="price mt-1 text-[1.1rem]">
                      {formatCLP(commune.minimumOrder)}
                    </dd>
                    <p className="mt-0.5 text-[0.72rem] text-charcoal-muted">
                      solo productos
                    </p>
                  </div>
                  <div className="bg-cream px-5 py-4">
                    <dt className="text-[0.76rem] font-semibold uppercase tracking-wide text-charcoal-muted">
                      Despacho
                    </dt>
                    <dd className="price mt-1 text-[1.1rem]">
                      {formatCLP(commune.shippingFee)}
                    </dd>
                  </div>
                </dl>

                <div className="space-y-1 bg-cream px-5 pb-5 text-[0.84rem] text-charcoal-muted">
                  <p>
                    <span className="font-semibold text-charcoal">Días:</span>{" "}
                    {deliveryDaysLabel}
                  </p>
                  <p>
                    <span className="font-semibold text-charcoal">Horario:</span>{" "}
                    {deliveryWindowShort}
                  </p>
                  {commune.commune.deliveryNote ? (
                    <p>{commune.commune.deliveryNote}</p>
                  ) : null}
                </div>

                <div className="space-y-4 px-5 py-5">
                  {totals.itemCount === 0 ? (
                    <>
                      <Notice tone="info">
                        El pedido mínimo para {commune.commune.name} es de{" "}
                        {formatCLP(commune.minimumOrder)} en productos. Agrega
                        productos al catálogo y aquí te indicaremos automáticamente
                        si alcanzas el mínimo.
                      </Notice>
                      <button
                        type="button"
                        onClick={() => scrollToSection("catalogo")}
                        className="btn btn-charcoal w-full"
                      >
                        Ver catálogo
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex items-baseline justify-between gap-4 text-[0.9rem]">
                        <span className="text-charcoal-muted">Tu pedido</span>
                        <span className="price">
                          {formatEstimate(totals.cartMin, totals.cartMax)}
                        </span>
                      </div>

                      <div aria-live="polite">
                        {validation ? (
                          <MinimumFeedback status={validation.status} />
                        ) : null}
                      </div>

                      {minimumSatisfied ? (
                        <>
                          <dl className="hairline space-y-1.5 pt-3 text-[0.9rem]">
                            <div className="flex justify-between gap-4">
                              <dt className="text-charcoal-muted">Productos</dt>
                              <dd className="price">
                                {formatEstimate(totals.cartMin, totals.cartMax)}
                              </dd>
                            </div>
                            <div className="flex justify-between gap-4">
                              <dt className="text-charcoal-muted">Despacho</dt>
                              <dd className="price">{formatCLP(commune.shippingFee)}</dd>
                            </div>
                            <div className="flex justify-between gap-4 pt-1">
                              <dt className="font-bold text-charcoal">Total estimado</dt>
                              <dd className="price text-[1.1rem]">
                                {totals.totalMin !== null && totals.totalMax !== null
                                  ? formatEstimate(totals.totalMin, totals.totalMax)
                                  : "—"}
                              </dd>
                            </div>
                          </dl>
                          <button
                            type="button"
                            onClick={() => scrollToSection("datos")}
                            className="btn btn-primary w-full"
                          >
                            Continuar con mis datos
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => scrollToSection("catalogo")}
                          className="btn btn-charcoal w-full"
                        >
                          Seguir agregando productos
                        </button>
                      )}
                    </>
                  )}

                  {totals.requiresAdvancePreparation ? (
                    <Notice tone="info" icon="clock">
                      Tu pedido incluye preparación especial. Recuerda realizarlo con
                      al menos {businessConfig.advanceHours} horas de anticipación.
                    </Notice>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Estado del mínimo para la comuna seleccionada. */
function MinimumFeedback({ status }: { status: DeliveryValidationStatus }) {
  const { validation, commune } = useOrder();
  if (!validation || !commune) return null;

  switch (status) {
    case "SAFE":
      return (
        <Notice tone="confirm" icon="check">
          Tu pedido cumple con el mínimo de despacho para {commune.commune.name}.
        </Notice>
      );
    case "UNCERTAIN":
      return (
        <Notice tone="warning" icon="alert" title="El cumplimiento depende del peso final">
          Tu pedido podría quedar bajo el mínimo. Te recomendamos agregar al menos{" "}
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
          Agrega un poco más para alcanzar el mínimo de despacho correspondiente a{" "}
          {commune.commune.name}.
        </Notice>
      );
    case "UNKNOWN_VALUE":
      return (
        <Notice tone="warning" icon="alert">
          Tu pedido contiene productos cuyo valor depende del peso real. La
          validación definitiva del mínimo podría requerir confirmación.
        </Notice>
      );
    default:
      return null;
  }
}

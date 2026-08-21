"use client";

import { useRef, useState } from "react";

import { Notice } from "@/components/ui/Notice";
import {
  businessConfig,
  deliveryDaysLabel,
  deliveryWindowShort,
} from "@/data/business";
import { trackEvent } from "@/lib/analytics";
import { formatCLP } from "@/lib/format";
import { isValidChileanPhone, isValidEmail } from "@/lib/phone";
import { scrollToSection } from "@/lib/scroll";
import { isBlank } from "@/lib/text";
import { useOrder } from "@/store/order-store";

type FieldName =
  | "fullName"
  | "phone"
  | "email"
  | "address"
  | "residenceType"
  | "apartmentNumber"
  | "paymentMethod";

type Errors = Partial<Record<FieldName, string>>;

export function CustomerFormSection() {
  const {
    totals,
    commune,
    validation,
    minimumSatisfied,
    unavailableItems,
    customer,
    delivery,
    payment,
    setCustomer,
    setDelivery,
    setPayment,
  } = useOrder();

  const [errors, setErrors] = useState<Errors>({});
  const [started, setStarted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const markStarted = () => {
    if (started) return;
    setStarted(true);
    trackEvent("begin_customer_form");
  };

  const clearError = (field: FieldName) =>
    setErrors((current) => ({ ...current, [field]: undefined }));

  const validate = (): Errors => {
    const next: Errors = {};

    if (isBlank(customer.fullName)) {
      next.fullName = "Ingresa tu nombre y apellido.";
    }
    if (!isValidChileanPhone(customer.phone)) {
      next.phone = "Ingresa un número de WhatsApp válido.";
    }
    if (!isBlank(customer.email) && !isValidEmail(customer.email)) {
      next.email = "Revisa que el correo esté correctamente escrito.";
    }
    if (isBlank(delivery.address)) {
      next.address = "Ingresa la dirección donde debemos entregar tu pedido.";
    }
    if (delivery.residenceType === null) {
      next.residenceType = "Indícanos si la entrega es en casa o departamento.";
    }
    if (delivery.residenceType === "apartment" && isBlank(delivery.apartmentNumber)) {
      next.apartmentNumber = "Ingresa el número de departamento.";
    }
    if (payment.method === null) {
      next.paymentMethod = "Selecciona cómo prefieres pagar.";
    }

    return next;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const next = validate();
    setErrors(next);

    const firstError = Object.keys(next)[0];
    if (firstError) {
      trackEvent("customer_form_error", { field: firstError });
      const element = formRef.current?.querySelector<HTMLElement>(
        `[data-field="${firstError}"]`,
      );
      element?.scrollIntoView({ block: "center", behavior: "smooth" });
      element?.querySelector<HTMLElement>("input, textarea, select")?.focus();
      return;
    }

    trackEvent("review_order");
    scrollToSection("resumen");
  };

  // Estados previos al formulario: el flujo progresivo evita mostrar campos
  // funcionales cuando todavía faltan condiciones.
  const blockedReason = (() => {
    if (totals.itemCount === 0) return "empty-cart";
    if (unavailableItems.length > 0) return "unavailable";
    if (!commune) return "no-commune";
    if (!commune.active) return "inactive-commune";
    if (!minimumSatisfied) return "minimum";
    return null;
  })();

  return (
    <section id="datos" className="section bg-ivory-deep">
      <div className="container-page">
        <header className="max-w-2xl">
          <p className="eyebrow">Tus datos</p>
          <h2 className="display-2 mt-3">Datos para tu pedido</h2>
          <p className="mt-4 text-[1.02rem] leading-relaxed text-charcoal-muted">
            Completa tus datos para preparar el resumen de tu solicitud y enviarlo
            directamente a nuestro WhatsApp.
          </p>
        </header>

        {blockedReason ? (
          <BlockedState reason={blockedReason} missingAmount={validation?.missingAmount ?? 0} />
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:gap-12">
            <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  name="fullName"
                  label="Nombre y apellido"
                  required
                  error={errors.fullName}
                >
                  <input
                    type="text"
                    autoComplete="name"
                    value={customer.fullName}
                    onFocus={markStarted}
                    onChange={(event) => {
                      setCustomer({ fullName: event.target.value });
                      clearError("fullName");
                    }}
                    placeholder="Ej.: Juan Pérez"
                    className="field-input"
                    aria-invalid={errors.fullName ? "true" : undefined}
                    aria-describedby={errors.fullName ? "error-fullName" : undefined}
                  />
                </Field>

                <Field name="phone" label="WhatsApp" required error={errors.phone}>
                  <input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={customer.phone}
                    onFocus={markStarted}
                    onChange={(event) => {
                      setCustomer({ phone: event.target.value });
                      clearError("phone");
                    }}
                    placeholder="Ej.: +56 9 1234 5678"
                    className="field-input"
                    aria-invalid={errors.phone ? "true" : undefined}
                    aria-describedby={errors.phone ? "error-phone" : undefined}
                  />
                </Field>

                <Field
                  name="email"
                  label="Correo electrónico"
                  optional
                  error={errors.email}
                >
                  <input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={customer.email}
                    onChange={(event) => {
                      setCustomer({ email: event.target.value });
                      clearError("email");
                    }}
                    placeholder="Ej.: nombre@correo.cl"
                    className="field-input"
                    aria-invalid={errors.email ? "true" : undefined}
                    aria-describedby={errors.email ? "error-email" : undefined}
                  />
                </Field>

                <div data-field="commune">
                  <span className="field-label">Comuna *</span>
                  <div className="flex items-center justify-between gap-3 rounded-[var(--radius-field)] border border-leather/25 bg-cream px-3.5 py-2.5">
                    <span className="font-semibold text-charcoal">
                      {commune?.commune.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => scrollToSection("despacho")}
                      className="btn-ghost"
                    >
                      Cambiar
                    </button>
                  </div>
                </div>
              </div>

              <Field name="address" label="Dirección" required error={errors.address}>
                <input
                  type="text"
                  autoComplete="street-address"
                  value={delivery.address}
                  onChange={(event) => {
                    setDelivery({ address: event.target.value });
                    clearError("address");
                  }}
                  placeholder="Ej.: Av. Irarrázaval 1234"
                  className="field-input"
                  aria-invalid={errors.address ? "true" : undefined}
                  aria-describedby={errors.address ? "error-address" : undefined}
                />
              </Field>

              <fieldset data-field="residenceType">
                <legend className="field-label">Tipo de domicilio *</legend>
                <div className="flex flex-wrap gap-3">
                  <RadioCard
                    name="residence"
                    checked={delivery.residenceType === "house"}
                    onSelect={() => {
                      // Al volver a Casa se limpia el departamento para no dejar
                      // información contradictoria.
                      setDelivery({ residenceType: "house", apartmentNumber: "" });
                      clearError("residenceType");
                    }}
                    label="Casa"
                  />
                  <RadioCard
                    name="residence"
                    checked={delivery.residenceType === "apartment"}
                    onSelect={() => {
                      setDelivery({ residenceType: "apartment" });
                      clearError("residenceType");
                    }}
                    label="Departamento"
                  />
                </div>
                {errors.residenceType ? (
                  <p className="field-error" role="alert">
                    {errors.residenceType}
                  </p>
                ) : null}
              </fieldset>

              {delivery.residenceType === "apartment" ? (
                <div className="animate-rise">
                  <Field
                    name="apartmentNumber"
                    label="Número de departamento"
                    required
                    error={errors.apartmentNumber}
                  >
                    <input
                      type="text"
                      value={delivery.apartmentNumber}
                      onChange={(event) => {
                        setDelivery({ apartmentNumber: event.target.value });
                        clearError("apartmentNumber");
                      }}
                      placeholder="Ej.: 804"
                      className="field-input sm:max-w-[14rem]"
                      aria-invalid={errors.apartmentNumber ? "true" : undefined}
                      aria-describedby={
                        errors.apartmentNumber ? "error-apartmentNumber" : undefined
                      }
                    />
                  </Field>
                </div>
              ) : null}

              <Field
                name="deliveryInstructions"
                label="Indicaciones para el delivery"
                optional
              >
                <textarea
                  rows={2}
                  maxLength={300}
                  value={delivery.deliveryInstructions}
                  onChange={(event) =>
                    setDelivery({ deliveryInstructions: event.target.value })
                  }
                  placeholder="Ej.: llamar al llegar, entregar en conserjería, portón lateral, casa interior, etc."
                  className="field-input resize-y"
                />
              </Field>

              <fieldset data-field="paymentMethod">
                <legend className="field-label">Forma de pago *</legend>
                <div className="flex flex-wrap gap-3">
                  <RadioCard
                    name="payment"
                    checked={payment.method === "bank_transfer"}
                    onSelect={() => {
                      setPayment("bank_transfer");
                      clearError("paymentMethod");
                    }}
                    label="Transferencia"
                  />
                  <RadioCard
                    name="payment"
                    checked={payment.method === "cash"}
                    onSelect={() => {
                      setPayment("cash");
                      clearError("paymentMethod");
                    }}
                    label="Efectivo"
                  />
                </div>
                <p className="field-hint mt-2">
                  Pago al recibir. Coordinamos los detalles contigo por WhatsApp.
                </p>
                {errors.paymentMethod ? (
                  <p className="field-error" role="alert">
                    {errors.paymentMethod}
                  </p>
                ) : null}
              </fieldset>

              {Object.values(errors).some(Boolean) ? (
                <Notice tone="alert" icon="alert" className="mt-2">
                  Revisa los campos marcados antes de continuar.
                </Notice>
              ) : null}

              <div className="hairline pt-6">
                <p className="text-[0.78rem] text-charcoal-muted">
                  * Campos obligatorios. Utilizaremos estos datos únicamente para
                  gestionar tu solicitud y coordinar la entrega.
                </p>
                <button type="submit" className="btn btn-charcoal mt-4 w-full sm:w-auto">
                  Revisar mi pedido
                </button>
              </div>
            </form>

            <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
              <div className="panel p-5">
                <h3 className="display-3">Tu entrega</h3>
                <dl className="mt-3 space-y-1.5 text-[0.88rem]">
                  <div className="flex justify-between gap-4">
                    <dt className="text-charcoal-muted">Comuna</dt>
                    <dd className="font-semibold text-charcoal">
                      {commune?.commune.name}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-charcoal-muted">Despacho</dt>
                    <dd className="price">{formatCLP(commune?.shippingFee ?? 0)}</dd>
                  </div>
                </dl>
                <div className="hairline mt-4 pt-3 text-[0.84rem] text-charcoal-muted">
                  <p className="font-bold text-charcoal">Sobre tu despacho</p>
                  <p className="mt-1">Despachos: {deliveryDaysLabel}</p>
                  <p>{deliveryWindowShort}</p>
                  <p className="mt-1.5">
                    Coordinaremos contigo la jornada disponible mediante WhatsApp.
                  </p>
                </div>
              </div>

              {totals.requiresAdvancePreparation ? (
                <Notice tone="info" icon="clock" title="Preparación especial">
                  Tu pedido incluye porcionado o indicaciones especiales. Recuerda
                  realizarlo con al menos {businessConfig.advanceHours} horas de
                  anticipación.
                </Notice>
              ) : null}
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}

function BlockedState({
  reason,
  missingAmount,
}: {
  reason: string;
  missingAmount: number;
}) {
  const content = {
    "empty-cart": {
      title: "Aún no tienes productos en tu pedido",
      body: "Agrega al menos un producto para poder completar tus datos.",
      cta: { label: "Ver catálogo", target: "catalogo" },
    },
    unavailable: {
      title: "Revisa tu pedido",
      body: "Uno de los productos ya no se encuentra disponible. Elimínalo desde tu pedido para continuar.",
      cta: { label: "Ver catálogo", target: "catalogo" },
    },
    "no-commune": {
      title: "Selecciona primero tu comuna",
      body: "Necesitamos conocer tu comuna para calcular las condiciones de despacho.",
      cta: { label: "Consultar despacho", target: "despacho" },
    },
    "inactive-commune": {
      title: "Despacho no disponible en esta comuna",
      body: "Selecciona otra comuna para continuar con tu pedido.",
      cta: { label: "Consultar despacho", target: "despacho" },
    },
    minimum: {
      title: "Tu pedido aún no alcanza el mínimo de tu comuna",
      body:
        missingAmount > 0
          ? `Te faltan ${formatCLP(missingAmount)} en productos para asegurar el mínimo de despacho.`
          : "Agrega un poco más a tu pedido para alcanzar el mínimo de despacho.",
      cta: { label: "Seguir agregando productos", target: "catalogo" },
    },
  }[reason];

  if (!content) return null;

  return (
    <div className="panel mt-8 max-w-xl px-6 py-10 text-center">
      <p className="display-3">{content.title}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-charcoal-muted">{content.body}</p>
      <button
        type="button"
        onClick={() => scrollToSection(content.cta.target)}
        className="btn btn-charcoal mt-6"
      >
        {content.cta.label}
      </button>
    </div>
  );
}

interface FieldProps {
  name: string;
  label: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
}

/**
 * Campo de formulario con label siempre visible.
 * El control va anidado dentro del `<label>`, de modo que la asociación
 * accesible existe sin depender de que cada input declare un id.
 */
function Field({ name, label, required, optional, error, children }: FieldProps) {
  return (
    <div data-field={name}>
      <label className="block">
        <span className="field-label">
          {label}
          {required ? " *" : null}
          {optional ? (
            <span className="font-normal text-charcoal-muted"> — opcional</span>
          ) : null}
        </span>
        {children}
      </label>
      {error ? (
        <p className="field-error" id={`error-${name}`} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function RadioCard({
  name,
  checked,
  onSelect,
  label,
}: {
  name: string;
  checked: boolean;
  onSelect: () => void;
  label: string;
}) {
  return (
    <label
      className={`inline-flex cursor-pointer items-center gap-2.5 rounded-[var(--radius-field)] border px-4 py-2.5 text-[0.9rem] font-semibold transition ${
        checked
          ? "border-brand bg-[#fffdf9] text-charcoal shadow-[0_0_0_1px_var(--color-brand)]"
          : "border-leather/25 bg-[#fffdf9] text-charcoal-muted hover:border-leather/50"
      }`}
    >
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onSelect}
        className="h-4 w-4 accent-[var(--color-brand)]"
      />
      {label}
    </label>
  );
}

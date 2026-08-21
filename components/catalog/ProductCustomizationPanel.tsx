"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Modal } from "@/components/ui/Modal";
import { Notice } from "@/components/ui/Notice";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { businessConfig } from "@/data/business";
import { formatCLP, formatPriceRange, formatWeightRange } from "@/lib/format";
import {
  calculateCartItem,
  formatQuantityLabel,
  getQuantityRules,
  isWholePieceModeActive,
} from "@/lib/pricing";
import { toNullableText } from "@/lib/text";
import type { CartSelection } from "@/store/order-store";
import type { PreparationType, Product } from "@/types";

const PORTION_MAX = 300;
const INSTRUCTIONS_MAX = 300;

const DEFAULT_PORTION_PLACEHOLDER =
  "Ej.: bistecs de aproximadamente 2 dedos, 4 porciones similares, cortes delgados, etc.";
const DEFAULT_INSTRUCTIONS_PLACEHOLDER =
  "Ej.: poca grasa, pieza pequeña dentro de lo posible, dejar grasa exterior, etc.";

interface ProductCustomizationPanelProps {
  product: Product;
  initialQuantity: number;
  initialSelection?: CartSelection | null;
  mode: "add" | "edit";
  onCancel: () => void;
  onConfirm: (selection: CartSelection) => void;
}

/**
 * Panel único de personalización, usado tanto para agregar como para editar.
 *
 * Reglas implementadas aquí:
 * - La preparación nunca se asume: si el producto la permite, hay que elegirla.
 * - "Porcionado" exige instrucciones; "Pieza entera" las limpia al guardar.
 * - En productos con `forcesVariablePieceWeight`, elegir pieza entera cambia la
 *   unidad de la cantidad (kg → piezas) y recalcula el rango antes de agregar.
 * - La preparación no altera el precio por kilogramo ni agrega recargos.
 */
export function ProductCustomizationPanel({
  product,
  initialQuantity,
  initialSelection,
  mode,
  onCancel,
  onConfirm,
}: ProductCustomizationPanelProps) {
  const [preparationType, setPreparationType] = useState<PreparationType | null>(
    initialSelection?.preparationType ?? null,
  );
  const [quantity, setQuantity] = useState(initialQuantity);
  const [portionInstructions, setPortionInstructions] = useState(
    initialSelection?.portionInstructions ?? "",
  );
  const [specialInstructions, setSpecialInstructions] = useState(
    initialSelection?.specialInstructions ?? "",
  );
  const [errors, setErrors] = useState<{ preparation?: string; portion?: string }>({});

  const portionRef = useRef<HTMLTextAreaElement>(null);
  const preparationRef = useRef<HTMLFieldSetElement>(null);

  const wholePieceModeActive = isWholePieceModeActive(product, preparationType);
  const rules = useMemo(
    () => getQuantityRules(product, preparationType),
    [product, preparationType],
  );

  // Al cambiar de unidad (kg ↔ piezas) la cantidad debe reiniciarse al mínimo
  // de la nueva modalidad: "1 kg pieza entera" no sería una selección válida.
  const previousUnitRef = useRef(wholePieceModeActive);
  useEffect(() => {
    if (previousUnitRef.current !== wholePieceModeActive) {
      previousUnitRef.current = wholePieceModeActive;
      setQuantity(rules.minimum);
    }
  }, [wholePieceModeActive, rules.minimum]);

  const calculation = calculateCartItem(product, quantity, preparationType);

  const showPreparationChoice = product.allowPreparationChoice;
  const showPortionField = preparationType === "portioned";
  const showSpecialInstructions = product.allowSpecialInstructions;

  const advanceWarningVisible =
    showPreparationChoice || product.allowSpecialInstructions;

  const validate = (): boolean => {
    const nextErrors: { preparation?: string; portion?: string } = {};

    if (showPreparationChoice && preparationType === null) {
      nextErrors.preparation = "Selecciona cómo quieres este producto.";
    }
    if (preparationType === "portioned" && toNullableText(portionInstructions) === null) {
      nextErrors.portion = "Cuéntanos brevemente cómo quieres que preparemos este producto.";
    }

    setErrors(nextErrors);

    if (nextErrors.preparation) {
      preparationRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
      return false;
    }
    if (nextErrors.portion) {
      portionRef.current?.focus();
      return false;
    }
    return true;
  };

  /** El producto no ofrece preparación: solo admite observaciones opcionales. */
  const instructionsOnly = !showPreparationChoice && showSpecialInstructions;

  const handleSkipInstructions = () => {
    onConfirm({
      quantity,
      preparationType: null,
      portionInstructions: null,
      specialInstructions: null,
    });
  };

  const handleConfirm = () => {
    if (!validate()) return;

    onConfirm({
      quantity,
      preparationType,
      // Al guardar como pieza entera se limpian las instrucciones de porcionado
      // para no enviar información contradictoria a WhatsApp.
      portionInstructions:
        preparationType === "portioned"
          ? toNullableText(portionInstructions, PORTION_MAX)
          : null,
      specialInstructions: showSpecialInstructions
        ? toNullableText(specialInstructions, INSTRUCTIONS_MAX)
        : null,
    });
  };

  const wholePieceReference =
    product.wholePieceBehavior === "forcesVariablePieceWeight" &&
    product.wholePieceWeightMin !== null &&
    product.wholePieceWeightMax !== null
      ? formatWeightRange(product.wholePieceWeightMin, product.wholePieceWeightMax)
      : null;

  return (
    <Modal
      open
      onClose={onCancel}
      title={
        mode === "edit"
          ? `Editar ${product.name}`
          : `¿Cómo quieres tu ${product.name}?`
      }
      description="Indícanos cómo prefieres que preparemos este producto."
      footer={
        <div className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between text-sm">
            <span className="font-semibold text-charcoal-muted">
              {calculation.quantityLabel}
              {calculation.weightLabel ? ` · ${calculation.weightLabel}` : ""}
            </span>
            <span className="price text-[1.05rem]">
              {calculation.pricePending
                ? "Según peso real"
                : calculation.exact
                  ? formatCLP(calculation.min)
                  : `${formatPriceRange(calculation.min, calculation.max)} aprox.`}
            </span>
          </div>
          <button type="button" onClick={handleConfirm} className="btn btn-primary w-full">
            {mode === "edit" ? "Guardar cambios" : "Agregar a mi pedido"}
          </button>
          {/* Cuando el producto solo acepta observaciones, el cliente puede
              agregarlo directamente sin escribir nada. */}
          {instructionsOnly && mode === "add" ? (
            <button
              type="button"
              onClick={handleSkipInstructions}
              className="btn btn-outline w-full"
            >
              Agregar sin indicaciones
            </button>
          ) : null}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Cantidad */}
        <div>
          <span className="field-label">Cantidad</span>
          <QuantityStepper
            value={quantity}
            minimum={rules.minimum}
            step={rules.step}
            productName={product.name}
            label={formatQuantityLabel(product, quantity, preparationType)}
            onChange={setQuantity}
          />
          {product.operationalNote ? (
            <p className="field-hint mt-2">{product.operationalNote}</p>
          ) : null}
        </div>

        {/* Preparación */}
        {showPreparationChoice ? (
          <fieldset ref={preparationRef}>
            <legend className="field-label">Preparación *</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <PreparationOption
                name={`preparation-${product.id}`}
                value="whole"
                checked={preparationType === "whole"}
                onSelect={() => {
                  setPreparationType("whole");
                  setErrors((current) => ({ ...current, preparation: undefined }));
                }}
                title="Pieza entera"
                description="Te entregamos el corte entero, sin porcionar."
              />
              <PreparationOption
                name={`preparation-${product.id}`}
                value="portioned"
                checked={preparationType === "portioned"}
                onSelect={() => {
                  setPreparationType("portioned");
                  setErrors((current) => ({ ...current, preparation: undefined }));
                }}
                title="Porcionado"
                description="Cuéntanos cómo quieres que lo preparemos."
              />
            </div>
            {errors.preparation ? (
              <p className="field-error" role="alert">
                {errors.preparation}
              </p>
            ) : null}
          </fieldset>
        ) : null}

        {/* Aviso de cambio de peso al elegir pieza entera */}
        {wholePieceModeActive && wholePieceReference ? (
          <Notice tone="warning" icon="alert" title="Cambia el peso estimado">
            Al solicitar pieza entera, el peso aproximado será de{" "}
            <strong>{wholePieceReference}</strong> y el valor estimado se ajusta a{" "}
            <strong>
              {formatPriceRange(calculation.min, calculation.max)}
            </strong>
            .
          </Notice>
        ) : null}

        {/* Instrucciones de porcionado */}
        {showPortionField ? (
          <div className="animate-rise">
            <label className="field-label" htmlFor={`portion-${product.id}`}>
              ¿Cómo quieres que lo preparemos? *
            </label>
            <textarea
              id={`portion-${product.id}`}
              ref={portionRef}
              rows={3}
              maxLength={PORTION_MAX}
              value={portionInstructions}
              onChange={(event) => {
                setPortionInstructions(event.target.value);
                if (errors.portion) {
                  setErrors((current) => ({ ...current, portion: undefined }));
                }
              }}
              placeholder={product.portionPlaceholder ?? DEFAULT_PORTION_PLACEHOLDER}
              className="field-input resize-y"
              aria-invalid={errors.portion ? "true" : undefined}
              aria-describedby={errors.portion ? `portion-error-${product.id}` : undefined}
            />
            <CharacterCount value={portionInstructions.length} max={PORTION_MAX} />
            {errors.portion ? (
              <p className="field-error" id={`portion-error-${product.id}`} role="alert">
                {errors.portion}
              </p>
            ) : null}
          </div>
        ) : null}

        {/* Indicaciones especiales */}
        {showSpecialInstructions ? (
          <div>
            <label className="field-label" htmlFor={`instructions-${product.id}`}>
              Indicaciones especiales{" "}
              <span className="font-normal text-charcoal-muted">— opcional</span>
            </label>
            <textarea
              id={`instructions-${product.id}`}
              rows={2}
              maxLength={INSTRUCTIONS_MAX}
              value={specialInstructions}
              onChange={(event) => setSpecialInstructions(event.target.value)}
              placeholder={
                product.specialInstructionsPlaceholder ?? DEFAULT_INSTRUCTIONS_PLACEHOLDER
              }
              className="field-input resize-y"
            />
            <CharacterCount value={specialInstructions.length} max={INSTRUCTIONS_MAX} />
            <p className="field-hint mt-1.5">
              Haremos lo posible por respetar tus indicaciones según las
              características de cada pieza disponible.
            </p>
          </div>
        ) : null}

        {advanceWarningVisible ? (
          <Notice tone="info" icon="clock" title="Preparación especial">
            Los pedidos con porcionado o instrucciones especiales deben realizarse
            con al menos {businessConfig.advanceHours} horas de anticipación.
          </Notice>
        ) : null}
      </div>
    </Modal>
  );
}

function CharacterCount({ value, max }: { value: number; max: number }) {
  if (value < max - 60) return null;
  return (
    <p className="field-hint mt-1 text-right tabular-nums">
      {value} / {max}
    </p>
  );
}

interface PreparationOptionProps {
  name: string;
  value: PreparationType;
  checked: boolean;
  onSelect: () => void;
  title: string;
  description: string;
}

/** Tarjeta seleccionable construida sobre un radio real. */
function PreparationOption({
  name,
  value,
  checked,
  onSelect,
  title,
  description,
}: PreparationOptionProps) {
  return (
    <label
      className={`flex cursor-pointer gap-3 rounded-[var(--radius-field)] border p-3.5 transition ${
        checked
          ? "border-brand bg-[#fffdf9] shadow-[0_0_0_1px_var(--color-brand)]"
          : "border-leather/25 bg-[#fffdf9] hover:border-leather/50"
      }`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onSelect}
        className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-brand)]"
      />
      <span className="min-w-0">
        <span
          className={`block text-[0.92rem] ${checked ? "font-bold text-charcoal" : "font-semibold text-charcoal"}`}
        >
          {title}
          {checked ? <span className="ml-1.5 text-brand">✓</span> : null}
        </span>
        <span className="mt-0.5 block text-[0.8rem] leading-snug text-charcoal-muted">
          {description}
        </span>
      </span>
    </label>
  );
}

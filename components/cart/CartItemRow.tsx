"use client";

import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { formatCLP, formatPriceRange } from "@/lib/format";
import { formatQuantityLabel, getQuantityRules, type CartLine } from "@/lib/pricing";
import { preparationLabel } from "@/lib/whatsapp";

interface CartItemRowProps {
  line: CartLine;
  onQuantityChange: (cartItemId: string, quantity: number) => void;
  onEdit: (line: CartLine) => void;
  onRemove: (cartItemId: string) => void;
}

export function CartItemRow({
  line,
  onQuantityChange,
  onEdit,
  onRemove,
}: CartItemRowProps) {
  const { item, product, calculation } = line;
  const rules = getQuantityRules(product, item.preparationType);
  const editable = product.allowPreparationChoice || product.allowSpecialInstructions;
  const unavailable = !product.active || product.price === null;

  return (
    <li className="border-b border-leather/15 py-4 last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-sans text-[0.98rem] font-bold text-charcoal">
            {product.name}
          </h3>
          <p className="mt-0.5 text-[0.8rem] text-charcoal-muted">
            {calculation.quantityLabel}
            {calculation.weightLabel ? ` · ${calculation.weightLabel}` : ""}
            {product.price !== null && product.pricingUnit === "kg"
              ? ` · ${formatCLP(product.price)}/kg`
              : ""}
          </p>
        </div>
        <p className="price shrink-0 text-right text-[0.95rem] leading-tight">
          {calculation.pricePending ? (
            <span className="text-[0.78rem] font-semibold text-leather">
              Valor según peso real
            </span>
          ) : calculation.exact ? (
            formatCLP(calculation.min)
          ) : (
            <>
              {formatPriceRange(calculation.min, calculation.max)}
              <span className="block text-[0.7rem] font-normal text-charcoal-muted">
                aprox.
              </span>
            </>
          )}
        </p>
      </div>

      {item.preparationType || item.portionInstructions || item.specialInstructions ? (
        <dl className="mt-2.5 space-y-1 rounded-[8px] bg-cream/70 px-3 py-2 text-[0.8rem] leading-snug">
          {item.preparationType ? (
            <div className="flex gap-1.5">
              <dt className="font-semibold text-charcoal">Preparación:</dt>
              <dd className="text-charcoal-muted">
                {preparationLabel(item.preparationType)}
              </dd>
            </div>
          ) : null}
          {item.portionInstructions ? (
            <div className="flex gap-1.5">
              <dt className="shrink-0 font-semibold text-charcoal">Cómo prepararlo:</dt>
              <dd className="whitespace-pre-line text-charcoal-muted">
                {item.portionInstructions}
              </dd>
            </div>
          ) : null}
          {item.specialInstructions ? (
            <div className="flex gap-1.5">
              <dt className="shrink-0 font-semibold text-charcoal">Indicaciones:</dt>
              <dd className="whitespace-pre-line text-charcoal-muted">
                {item.specialInstructions}
              </dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      {unavailable ? (
        <p className="mt-2.5 text-[0.8rem] font-semibold text-brand-dark">
          Este producto ya no se encuentra disponible. Elimínalo para continuar.
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        {unavailable ? (
          <span />
        ) : (
          <QuantityStepper
            value={item.quantity}
            minimum={rules.minimum}
            step={rules.step}
            productName={product.name}
            label={formatQuantityLabel(product, item.quantity, item.preparationType)}
            onChange={(value) => onQuantityChange(item.cartItemId, value)}
            size="sm"
          />
        )}

        <div className="flex items-center gap-1">
          {editable && !unavailable ? (
            <button type="button" onClick={() => onEdit(line)} className="btn-ghost">
              Editar preparación
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => onRemove(item.cartItemId)}
            className="btn-ghost"
          >
            Eliminar
          </button>
        </div>
      </div>
    </li>
  );
}

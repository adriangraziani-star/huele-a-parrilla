"use client";

import { useState } from "react";

import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { formatCLP, formatPriceRange, formatWeightRange } from "@/lib/format";
import {
  calculateCartItem,
  calculateVariableWeightRange,
  formatQuantityLabel,
  getQuantityRules,
} from "@/lib/pricing";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  inCart: boolean;
  onAdd: (product: Product, quantity: number) => void;
}

/**
 * Tarjeta del catálogo.
 *
 * La V1 no usa fotografías: la tarjeta se sostiene con jerarquía tipográfica,
 * espacio y composición. Cuando en el futuro `product.image` deje de ser null,
 * la imagen se renderiza sin alterar la lógica comercial.
 */
export function ProductCard({ product, inCart, onAdd }: ProductCardProps) {
  const rules = getQuantityRules(product, null);
  const [quantity, setQuantity] = useState(rules.minimum);

  const unavailable = !product.active || product.price === null;
  const pieceRange = calculateVariableWeightRange(product);
  const calculation = product.price !== null
    ? calculateCartItem(product, quantity, null)
    : null;

  const pricePerUnitLabel = (() => {
    if (product.price === null) return null;
    switch (product.saleMode) {
      case "FIXED_UNIT":
        return `${formatCLP(product.price)} c/u`;
      case "FIXED_PACKAGE":
        return formatCLP(product.price);
      default:
        return `${formatCLP(product.price)} / kg`;
    }
  })();

  const saleModeLabel = (() => {
    switch (product.saleMode) {
      case "PIECE_VARIABLE_WEIGHT":
        return product.approxWeightMin !== null && product.approxWeightMax !== null
          ? `Venta por pieza · ${formatWeightRange(product.approxWeightMin, product.approxWeightMax)} aprox.`
          : "Venta por pieza";
      case "PIECE_BY_WEIGHT_WITHOUT_CONFIRMED_RANGE":
        return "Venta por pieza · peso final según pieza";
      case "FIXED_UNIT":
        return "Venta por unidad";
      case "FIXED_PACKAGE":
        return product.packageLabel ?? "Presentación fija";
      case "KG_WITH_WHOLE_PIECE_REFERENCE":
        return product.wholePieceWeightMin !== null && product.wholePieceWeightMax !== null
          ? `Desde 1 kg · pieza entera ${formatWeightRange(product.wholePieceWeightMin, product.wholePieceWeightMax)} aprox.`
          : "Venta por kilogramo";
      default:
        return "Venta por kilogramo";
    }
  })();

  return (
    <article className="card card-hover flex flex-col p-5">
      {product.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="mb-4 aspect-[4/3] w-full rounded-[10px] object-cover"
        />
      ) : null}

      <header>
        <h3 className="display-3 text-charcoal">{product.name}</h3>
        {product.shortDescription ? (
          <p className="mt-1.5 text-[0.86rem] leading-snug text-charcoal-muted">
            {product.shortDescription}
          </p>
        ) : null}
        <p className="mt-1.5 text-[0.78rem] text-leather">{saleModeLabel}</p>
      </header>

      <div className="mt-4">
        {pricePerUnitLabel ? (
          <p className="price text-[1.35rem] leading-none">{pricePerUnitLabel}</p>
        ) : null}

        {pieceRange ? (
          <p className="mt-1.5 text-[0.8rem] text-charcoal-muted">
            Valor estimado:{" "}
            <span className="font-semibold text-charcoal">
              {formatPriceRange(pieceRange.min, pieceRange.max)}
            </span>
          </p>
        ) : null}

        {product.estimateUnavailable ? (
          <p className="mt-1.5 text-[0.8rem] font-semibold text-leather">
            Valor final según peso real
          </p>
        ) : null}
      </div>

      {product.operationalNote ? (
        <p className="mt-3 border-l-2 border-copper/50 pl-3 text-[0.78rem] leading-snug text-charcoal-muted">
          {product.operationalNote}
        </p>
      ) : null}

      <div className="mt-auto pt-5">
        {unavailable ? (
          <p className="rounded-[var(--radius-field)] border border-leather/25 bg-cream px-3 py-2.5 text-center text-[0.82rem] font-semibold text-charcoal-muted">
            No disponible temporalmente
          </p>
        ) : (
          <>
            <QuantityStepper
              value={quantity}
              minimum={rules.minimum}
              step={rules.step}
              productName={product.name}
              label={formatQuantityLabel(product, quantity, null)}
              onChange={setQuantity}
              size="sm"
            />

            {/* El valor de la línea aparece cuando el cliente ajusta la
                cantidad; en el mínimo coincidiría con el precio ya visible
                arriba y solo duplicaría información. */}
            {calculation && !calculation.pricePending && quantity > rules.minimum ? (
              <p className="mt-2 text-right text-[0.85rem]" aria-live="polite">
                <span className="text-charcoal-muted">Subtotal: </span>
                <span className="price">
                  {calculation.exact
                    ? formatCLP(calculation.min)
                    : formatPriceRange(calculation.min, calculation.max)}
                </span>
              </p>
            ) : null}

            <button
              type="button"
              onClick={() => onAdd(product, quantity)}
              className="btn btn-charcoal mt-3 w-full"
            >
              Agregar
            </button>

            {inCart ? (
              <p className="mt-2 text-center text-[0.75rem] font-semibold text-copper">
                ✓ En tu pedido
              </p>
            ) : null}
          </>
        )}
      </div>
    </article>
  );
}

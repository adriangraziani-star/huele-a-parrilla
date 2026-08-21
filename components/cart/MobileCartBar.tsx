"use client";

import { formatEstimate } from "@/lib/pricing";
import { useOrder } from "@/store/order-store";
import { useUi } from "@/store/ui-store";

/**
 * Barra persistente que aparece solo cuando el pedido tiene productos.
 * Aplica el principio de interacción progresiva: nada se muestra antes de tiempo.
 */
export function MobileCartBar() {
  const { totals } = useOrder();
  const { openCart, cartOpen, customization } = useUi();

  if (totals.itemCount === 0 || cartOpen || customization) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ivory/10 bg-charcoal px-4 py-3 lg:hidden">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.8rem] font-semibold text-ivory">
            {totals.itemCount} {totals.itemCount === 1 ? "producto" : "productos"}
          </p>
          <p className="truncate text-[0.78rem] text-ivory/65">
            {totals.hasUnpricedItem ? "Total parcial " : ""}
            {formatEstimate(
              totals.totalMin ?? totals.cartMin,
              totals.totalMax ?? totals.cartMax,
            )}
          </p>
        </div>
        <button type="button" onClick={openCart} className="btn btn-primary shrink-0 py-2.5">
          Ver pedido
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";

import { CartItemRow } from "@/components/cart/CartItemRow";
import { CartSummary } from "@/components/cart/CartSummary";
import { Modal } from "@/components/ui/Modal";
import { Notice } from "@/components/ui/Notice";
import { scrollToSection } from "@/lib/scroll";
import { useOrder } from "@/store/order-store";
import { useUi } from "@/store/ui-store";

export function CartDrawer() {
  const {
    lines,
    totals,
    commune,
    validation,
    minimumSatisfied,
    unavailableItems,
    updateQuantity,
    removeItem,
    clearCart,
  } = useOrder();
  const { cartOpen, closeCart, openCustomization } = useUi();
  const [confirmingClear, setConfirmingClear] = useState(false);

  if (!cartOpen) return null;

  const goTo = (id: string) => {
    closeCart();
    // Esperar al cierre del panel para que el scroll no compita con el modal.
    setTimeout(() => scrollToSection(id), 60);
  };

  const empty = lines.length === 0;

  return (
    <Modal
      open={cartOpen}
      onClose={closeCart}
      variant="drawer"
      title="Tu pedido"
      description={
        empty
          ? undefined
          : `${totals.itemCount} ${totals.itemCount === 1 ? "producto" : "productos"}`
      }
      footer={
        empty ? undefined : (
          <div className="space-y-3">
            <CartSummary
              totals={totals}
              lines={lines}
              conditions={commune}
              validation={validation}
              onChangeCommune={() => goTo("despacho")}
            />

            {!commune ? (
              <button
                type="button"
                onClick={() => goTo("despacho")}
                className="btn btn-charcoal w-full"
              >
                Consultar despacho
              </button>
            ) : minimumSatisfied && unavailableItems.length === 0 ? (
              <button
                type="button"
                onClick={() => goTo("datos")}
                className="btn btn-primary w-full"
              >
                Continuar con mis datos
              </button>
            ) : (
              <button
                type="button"
                onClick={() => goTo("catalogo")}
                className="btn btn-charcoal w-full"
              >
                Seguir agregando productos
              </button>
            )}

            <div className="text-center">
              {confirmingClear ? (
                <span className="inline-flex items-center gap-3 text-[0.8rem]">
                  <span className="text-charcoal-muted">¿Vaciar todo el pedido?</span>
                  <button
                    type="button"
                    onClick={() => {
                      clearCart();
                      setConfirmingClear(false);
                    }}
                    className="font-bold text-brand-dark underline"
                  >
                    Sí, vaciar
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingClear(false)}
                    className="font-semibold text-charcoal-muted underline"
                  >
                    Cancelar
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmingClear(true)}
                  className="btn-ghost"
                >
                  Vaciar pedido
                </button>
              )}
            </div>
          </div>
        )
      }
    >
      {empty ? (
        <div className="py-10 text-center">
          <p className="display-3">Tu pedido todavía está vacío</p>
          <p className="mt-2 text-sm text-charcoal-muted">
            Agrega productos desde nuestro catálogo para comenzar.
          </p>
          <button
            type="button"
            onClick={() => goTo("catalogo")}
            className="btn btn-charcoal mt-6"
          >
            Ver catálogo
          </button>
        </div>
      ) : (
        <>
          {unavailableItems.length > 0 ? (
            <Notice tone="alert" icon="alert" className="mb-4">
              Uno de los productos de tu pedido ya no se encuentra disponible.
              Elimínalo para poder continuar.
            </Notice>
          ) : null}

          <ul>
            {lines.map((line) => (
              <CartItemRow
                key={line.item.cartItemId}
                line={line}
                onQuantityChange={updateQuantity}
                onEdit={(target) =>
                  openCustomization({
                    product: target.product,
                    quantity: target.item.quantity,
                    editing: target.item,
                  })
                }
                onRemove={removeItem}
              />
            ))}
          </ul>
        </>
      )}
    </Modal>
  );
}

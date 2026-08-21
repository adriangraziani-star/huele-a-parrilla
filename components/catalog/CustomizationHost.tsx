"use client";

import { ProductCustomizationPanel } from "@/components/catalog/ProductCustomizationPanel";
import { useOrder } from "@/store/order-store";
import { useUi } from "@/store/ui-store";

/**
 * Conecta el panel de personalización con el estado del pedido.
 * El mismo componente sirve para agregar y para editar una línea existente.
 */
export function CustomizationHost() {
  const { addItem, updateItemSelection } = useOrder();
  const { customization, closeCustomization, showToast } = useUi();

  if (!customization) return null;

  const { product, quantity, editing } = customization;

  return (
    <ProductCustomizationPanel
      key={editing?.cartItemId ?? product.id}
      product={product}
      initialQuantity={editing?.quantity ?? quantity}
      initialSelection={
        editing
          ? {
              quantity: editing.quantity,
              preparationType: editing.preparationType,
              portionInstructions: editing.portionInstructions,
              specialInstructions: editing.specialInstructions,
            }
          : null
      }
      mode={editing ? "edit" : "add"}
      onCancel={closeCustomization}
      onConfirm={(selection) => {
        if (editing) {
          updateItemSelection(editing.cartItemId, selection);
          showToast("Preparación actualizada");
        } else {
          addItem(product, selection);
          showToast(`${product.name} agregado a tu pedido`);
        }
        closeCustomization();
      }}
    />
  );
}

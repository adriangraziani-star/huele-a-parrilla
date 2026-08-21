import { describe, expect, it } from "vitest";

import { getProduct } from "@/data/products";
import { formatCLP, formatPriceRange } from "@/lib/format";
import {
  calculateCartItem,
  calculateCartTotal,
  getQuantityUnit,
  type CartLine,
} from "@/lib/pricing";
import type { CartItem, PreparationType, Product } from "@/types";

const product = (id: string): Product => {
  const found = getProduct(id);
  if (!found) throw new Error(`Producto inexistente en el catálogo: ${id}`);
  return found;
};

const line = (
  id: string,
  quantity: number,
  preparationType: PreparationType | null = null,
): CartLine => {
  const target = product(id);
  const item: CartItem = {
    cartItemId: `test-${id}-${quantity}-${preparationType ?? "none"}`,
    productId: id,
    quantity,
    preparationType,
    portionInstructions: null,
    specialInstructions: null,
    requiresAdvancePreparation: preparationType === "portioned",
  };
  return {
    item,
    product: target,
    calculation: calculateCartItem(target, quantity, preparationType),
  };
};

describe("auditoría matemática obligatoria", () => {
  it("1. Filete — 1 pieza de 1,8–2,8 kg a $17.990/kg", () => {
    const result = calculateCartItem(product("filete"), 1);
    expect(result.min).toBe(32382);
    expect(result.max).toBe(50372);
    expect(result.exact).toBe(false);
    expect(formatPriceRange(result.min, result.max)).toBe("$32.382–$50.372");
  });

  it("2. Tomahawk — 2 piezas de 1–1,5 kg a $14.990/kg", () => {
    const result = calculateCartItem(product("tomahawk"), 2);
    expect(result.weightMin).toBe(2);
    expect(result.weightMax).toBe(3);
    expect(result.min).toBe(29980);
    expect(result.max).toBe(44970);
  });

  it("3. Vacío Argentino — 1 pieza de 4–5,7 kg a $12.990/kg", () => {
    const result = calculateCartItem(product("pieza-vacio-argentino"), 1);
    expect(result.min).toBe(51960);
    expect(result.max).toBe(74043);
  });

  it("4. Estomaguillo — 1 pieza de 6–8 kg a $11.990/kg", () => {
    const result = calculateCartItem(product("estomaguillo"), 1);
    expect(result.min).toBe(71940);
    expect(result.max).toBe(95920);
  });

  it("5. Asado de Tiras por kilogramo — 2 kg a $11.990/kg", () => {
    const result = calculateCartItem(product("asado-de-tiras"), 2, "portioned");
    expect(result.min).toBe(23980);
    expect(result.max).toBe(23980);
    expect(result.exact).toBe(true);
  });

  it("6. Asado de Tiras pieza entera — 4–6 kg", () => {
    const result = calculateCartItem(product("asado-de-tiras"), 1, "whole");
    expect(result.weightMin).toBe(4);
    expect(result.weightMax).toBe(6);
    expect(result.min).toBe(47960);
    expect(result.max).toBe(71940);
  });

  it("7. Costillar Americano — 1 pieza de 1,5–2,2 kg a $10.990/kg", () => {
    const result = calculateCartItem(product("costillar-americano"), 1);
    expect(result.min).toBe(16485);
    expect(result.max).toBe(24178);
  });

  it("8. Flat Iron — 1 pieza de 1,5–2,2 kg a $15.990/kg", () => {
    const result = calculateCartItem(product("flat-iron"), 1);
    expect(result.min).toBe(23985);
    expect(result.max).toBe(35178);
  });

  it("9. Punta de Ganso — 1 pieza de 1,4–2 kg a $14.990/kg", () => {
    const result = calculateCartItem(product("punta-de-ganso"), 1);
    expect(result.min).toBe(20986);
    expect(result.max).toBe(29980);
  });

  it("10. Lengua — 1 pieza de 1,4–1,9 kg a $10.990/kg", () => {
    const result = calculateCartItem(product("lengua"), 1);
    expect(result.min).toBe(15386);
    expect(result.max).toBe(20881);
  });

  it("11. Carbón — 3 bolsas a $4.990", () => {
    const result = calculateCartItem(product("carbon"), 3);
    expect(result.min).toBe(14970);
    expect(result.exact).toBe(true);
    expect(result.quantityLabel).toBe("3 bolsas de 2,5 kg");
  });

  it("12. Pata de Vacuno — 2 unidades a $10.990", () => {
    const result = calculateCartItem(product("pata-de-vacuno"), 2);
    expect(result.min).toBe(21980);
    expect(result.quantityLabel).toBe("2 unidades");
  });

  it("13. Lomo Vetado — 2,5 kg a $15.990/kg", () => {
    const result = calculateCartItem(product("lomo-vetado"), 2.5);
    expect(result.min).toBe(39975);
    expect(result.exact).toBe(true);
    expect(formatCLP(result.min)).toBe("$39.975");
  });

  it("14. Pedido mixto: Lomo Vetado 2 kg + Filete 1 pieza + Carbón 2 bolsas", () => {
    const lines = [line("lomo-vetado", 2), line("filete", 1), line("carbon", 2)];
    const totals = calculateCartTotal(lines, null);
    expect(totals.cartMin).toBe(74342);
    expect(totals.cartMax).toBe(92332);
    expect(totals.itemCount).toBe(3);
  });

  it("15. Pedido mixto + despacho de Ñuñoa ($2.990)", () => {
    const lines = [line("lomo-vetado", 2), line("filete", 1), line("carbon", 2)];
    const totals = calculateCartTotal(lines, 2990);
    expect(totals.totalMin).toBe(77332);
    expect(totals.totalMax).toBe(95322);
  });

  it("19. Pollo Entero — sin rango estimable, nunca $0", () => {
    const result = calculateCartItem(product("pollo-entero"), 1);
    expect(result.pricePending).toBe(true);
    expect(result.priceLabel).toBe("Valor final según peso real");
    expect(result.priceLabel).not.toContain("$0");
  });
});

describe("modalidades de venta", () => {
  it("el Filete no admite selección por kilogramo", () => {
    expect(getQuantityUnit(product("filete"), null)).toBe("piece");
  });

  it("el Estomaguillo opera siempre en piezas, con cualquier preparación", () => {
    expect(getQuantityUnit(product("estomaguillo"), "whole")).toBe("piece");
    expect(getQuantityUnit(product("estomaguillo"), "portioned")).toBe("piece");
  });

  it("el Estomaguillo mantiene su rango aunque se porcione", () => {
    const whole = calculateCartItem(product("estomaguillo"), 1, "whole");
    const portioned = calculateCartItem(product("estomaguillo"), 1, "portioned");
    expect(portioned.min).toBe(whole.min);
    expect(portioned.max).toBe(whole.max);
  });

  it("el Asado de Tiras cambia de kilogramos a piezas al elegir pieza entera", () => {
    expect(getQuantityUnit(product("asado-de-tiras"), "portioned")).toBe("kg");
    expect(getQuantityUnit(product("asado-de-tiras"), "whole")).toBe("piece");
  });

  it("el Lomo Vetado en pieza entera conserva los kilos solicitados", () => {
    const result = calculateCartItem(product("lomo-vetado"), 2, "whole");
    expect(result.min).toBe(31980);
    expect(result.max).toBe(31980);
    expect(result.weightMin).toBe(2);
  });

  it("la preparación nunca modifica el precio", () => {
    const whole = calculateCartItem(product("lomo-vetado"), 2, "whole");
    const portioned = calculateCartItem(product("lomo-vetado"), 2, "portioned");
    expect(whole.min).toBe(portioned.min);
  });
});

describe("totales del carrito", () => {
  it("suma los extremos por separado, sin promediar", () => {
    const lines = [line("lomo-vetado", 2), line("filete", 1)];
    const totals = calculateCartTotal(lines, null);
    expect(totals.cartMin).toBe(31980 + 32382);
    expect(totals.cartMax).toBe(31980 + 50372);
    expect(totals.exact).toBe(false);
  });

  it("marca los productos sin estimación sin sumarlos al subtotal", () => {
    const lines = [line("lomo-vetado", 2), line("pollo-entero", 1)];
    const totals = calculateCartTotal(lines, null);
    expect(totals.hasUnpricedItem).toBe(true);
    expect(totals.cartMin).toBe(31980);
  });

  it("el despacho se suma a ambos extremos del rango", () => {
    const lines = [line("filete", 1)];
    const totals = calculateCartTotal(lines, 4990);
    expect(totals.totalMin).toBe(32382 + 4990);
    expect(totals.totalMax).toBe(50372 + 4990);
  });

  it("detecta la necesidad de anticipación cuando hay porcionado", () => {
    const totals = calculateCartTotal([line("lomo-vetado", 1, "portioned")], null);
    expect(totals.requiresAdvancePreparation).toBe(true);
  });
});

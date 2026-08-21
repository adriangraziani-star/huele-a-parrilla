import { describe, expect, it } from "vitest";

import {
  getShippingForCommune,
  isMinimumSatisfied,
  searchCommunes,
  validateDeliveryMinimum,
} from "@/lib/delivery";
import type { CommuneConditions } from "@/types";

const conditions = (communeId: string): CommuneConditions => {
  const found = getShippingForCommune(communeId);
  if (!found) throw new Error(`Comuna inexistente: ${communeId}`);
  return found;
};

const cart = (cartMin: number, cartMax: number, hasUnpricedItem = false) => ({
  cartMin,
  cartMax,
  hasUnpricedItem,
  itemCount: 1,
});

describe("condiciones por comuna", () => {
  it("Ñuñoa pertenece a la zona de $40.000 y $2.990", () => {
    const nunoa = conditions("nunoa");
    expect(nunoa.minimumOrder).toBe(40000);
    expect(nunoa.shippingFee).toBe(2990);
  });

  it("Peñalolén exige $50.000 con despacho de $4.990", () => {
    const penalolen = conditions("penalolen");
    expect(penalolen.minimumOrder).toBe(50000);
    expect(penalolen.shippingFee).toBe(4990);
  });

  it("Maipú exige $60.000 con despacho de $4.990", () => {
    const maipu = conditions("maipu");
    expect(maipu.minimumOrder).toBe(60000);
    expect(maipu.shippingFee).toBe(4990);
  });

  it("Padre Hurtado exige $100.000 con despacho de $14.990", () => {
    const padreHurtado = conditions("padre-hurtado");
    expect(padreHurtado.minimumOrder).toBe(100000);
    expect(padreHurtado.shippingFee).toBe(14990);
  });

  it("Chicureo se mantiene seleccionable dentro de la zona más lejana", () => {
    const chicureo = conditions("chicureo");
    expect(chicureo.minimumOrder).toBe(100000);
    expect(chicureo.shippingFee).toBe(14990);
  });

  it("una comuna no configurada no devuelve condiciones", () => {
    expect(getShippingForCommune("valparaiso")).toBeNull();
    expect(getShippingForCommune(null)).toBeNull();
  });
});

describe("búsqueda de comunas sin tildes", () => {
  it("nunoa encuentra Ñuñoa", () => {
    expect(searchCommunes("nunoa")[0]?.name).toBe("Ñuñoa");
  });

  it("penalolen encuentra Peñalolén", () => {
    expect(searchCommunes("penalolen")[0]?.name).toBe("Peñalolén");
  });

  it("maipu encuentra Maipú", () => {
    expect(searchCommunes("MAIPU")[0]?.name).toBe("Maipú");
  });

  it("san devuelve todas las comunas que lo contienen", () => {
    const names = searchCommunes("san", 20).map((commune) => commune.name);
    expect(names).toContain("San Miguel");
    expect(names).toContain("San Joaquín");
    expect(names).toContain("San Ramón");
    expect(names).toContain("San Bernardo");
  });

  it("una consulta vacía no devuelve resultados", () => {
    expect(searchCommunes("")).toHaveLength(0);
  });
});

describe("validación del pedido mínimo", () => {
  it("EMPTY_CART cuando no hay productos", () => {
    const result = validateDeliveryMinimum(
      { cartMin: 0, cartMax: 0, hasUnpricedItem: false, itemCount: 0 },
      conditions("nunoa"),
    );
    expect(result.status).toBe("EMPTY_CART");
  });

  it("SAFE cuando el peor escenario ya alcanza el mínimo", () => {
    const result = validateDeliveryMinimum(cart(52000, 70000), conditions("penalolen"));
    expect(result.status).toBe("SAFE");
    expect(isMinimumSatisfied(result)).toBe(true);
  });

  it("17. UNCERTAIN en Peñalolén: $45.000–$62.000 contra mínimo $50.000", () => {
    const result = validateDeliveryMinimum(cart(45000, 62000), conditions("penalolen"));
    expect(result.status).toBe("UNCERTAIN");
    expect(result.missingAmount).toBe(5000);
    expect(isMinimumSatisfied(result)).toBe(false);
  });

  it("16. BELOW_MINIMUM en Maipú: $52.000 exactos contra mínimo $60.000", () => {
    const result = validateDeliveryMinimum(cart(52000, 52000), conditions("maipu"));
    expect(result.status).toBe("BELOW_MINIMUM");
    expect(result.missingAmount).toBe(8000);
  });

  it("el faltante usa siempre minimumOrder − cartMin", () => {
    const result = validateDeliveryMinimum(cart(35000, 42000), conditions("penalolen"));
    expect(result.status).toBe("BELOW_MINIMUM");
    expect(result.missingAmount).toBe(15000);
  });

  it("el despacho nunca completa el mínimo", () => {
    // Productos $38.000 + despacho $2.990 = $40.990, pero el mínimo es $40.000
    // de productos: el pedido no cumple.
    const result = validateDeliveryMinimum(cart(38000, 38000), conditions("nunoa"));
    expect(result.status).toBe("BELOW_MINIMUM");
    expect(result.missingAmount).toBe(2000);
  });

  it("UNKNOWN_VALUE cuando existe un producto sin rango estimable", () => {
    const result = validateDeliveryMinimum(cart(20000, 20000, true), conditions("nunoa"));
    expect(result.status).toBe("UNKNOWN_VALUE");
  });

  it("18. cambiar de comuna recalcula mínimo y despacho", () => {
    const nunoa = validateDeliveryMinimum(cart(52000, 52000), conditions("nunoa"));
    expect(nunoa.status).toBe("SAFE");
    expect(nunoa.shippingFee).toBe(2990);

    const padreHurtado = validateDeliveryMinimum(
      cart(52000, 52000),
      conditions("padre-hurtado"),
    );
    expect(padreHurtado.status).toBe("BELOW_MINIMUM");
    expect(padreHurtado.minimumOrder).toBe(100000);
    expect(padreHurtado.shippingFee).toBe(14990);
    expect(padreHurtado.missingAmount).toBe(48000);
  });
});

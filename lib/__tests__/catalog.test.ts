import { describe, expect, it } from "vitest";

import { categories } from "@/data/categories";
import { catalogProducts, getProduct, products } from "@/data/products";

/** Precios vigentes declarados como fuente única. */
const officialPrices: Record<string, number> = {
  filete: 17990,
  entrana: 16990,
  "flat-iron": 15990,
  "lomo-vetado": 15990,
  entrecot: 15990,
  "lomo-liso": 14990,
  tomahawk: 14990,
  "punta-de-ganso": 14990,
  "pieza-vacio-argentino": 12990,
  "asado-de-tiras": 11990,
  estomaguillo: 11990,
  "costillar-americano": 10990,
  "costillar-con-malaya": 10990,
  "chuleta-ahumada": 10990,
  carbon: 4990,
};

/** Rangos de peso vigentes. */
const officialRanges: Record<string, [number, number]> = {
  filete: [1.8, 2.8],
  tomahawk: [1, 1.5],
  "flat-iron": [1.5, 2.2],
  "punta-de-ganso": [1.4, 2],
  "pieza-vacio-argentino": [4, 5.7],
  estomaguillo: [6, 8],
  "costillar-americano": [1.5, 2.2],
  lengua: [1.4, 1.9],
};

describe("integridad del catálogo", () => {
  it("los precios coinciden con la tabla oficial", () => {
    for (const [id, price] of Object.entries(officialPrices)) {
      expect(getProduct(id)?.price, `precio de ${id}`).toBe(price);
    }
  });

  it("los rangos de peso coinciden con la tabla oficial", () => {
    for (const [id, [min, max]] of Object.entries(officialRanges)) {
      const product = getProduct(id);
      expect(product?.approxWeightMin, `peso mínimo de ${id}`).toBe(min);
      expect(product?.approxWeightMax, `peso máximo de ${id}`).toBe(max);
    }
  });

  it("el Asado de Tiras declara la pieza entera de 4 a 6 kg", () => {
    const product = getProduct("asado-de-tiras");
    expect(product?.saleMode).toBe("KG_WITH_WHOLE_PIECE_REFERENCE");
    expect(product?.wholePieceBehavior).toBe("forcesVariablePieceWeight");
    expect(product?.wholePieceWeightMin).toBe(4);
    expect(product?.wholePieceWeightMax).toBe(6);
  });

  it("el Estomaguillo se vende únicamente por pieza", () => {
    const product = getProduct("estomaguillo");
    expect(product?.saleMode).toBe("PIECE_VARIABLE_WEIGHT");
    expect(product?.wholePieceBehavior).toBe("alreadySoldAsWholePiece");
  });

  it("el Entrecot avanza de kilo en kilo y no ofrece porcionado", () => {
    const product = getProduct("entrecot");
    expect(product?.quantityStep).toBe(1);
    expect(product?.allowPreparationChoice).toBe(false);
    expect(product?.operationalNote).toContain("400 y 600 g");
  });

  it("Pollo Barriga y Pollo Ganso pertenecen a vacuno", () => {
    expect(getProduct("pollo-barriga")?.categoryId).toBe("vacuno");
    expect(getProduct("pollo-ganso")?.categoryId).toBe("vacuno");
  });

  it("el Carbón se vende por bolsa y no por kilogramo", () => {
    const product = getProduct("carbon");
    expect(product?.saleMode).toBe("FIXED_PACKAGE");
    expect(product?.pricingUnit).toBe("package");
    expect(product?.packageLabel).toBe("Bolsa de 2,5 kg");
  });

  it("la Pata de Vacuno se vende por unidad", () => {
    expect(getProduct("pata-de-vacuno")?.saleMode).toBe("FIXED_UNIT");
    expect(getProduct("pata-de-vacuno")?.price).toBe(10990);
  });

  it("las molidas no ofrecen pieza entera / porcionado", () => {
    expect(getProduct("molida-especial")?.allowPreparationChoice).toBe(false);
    expect(getProduct("molida-tartaro")?.allowPreparationChoice).toBe(false);
    expect(getProduct("molida-especial")?.allowSpecialInstructions).toBe(true);
  });

  it("los productos sin precio confirmado no se publican", () => {
    const pendientes = [
      "tuetano",
      "charchas",
      "chunchules",
      "higado",
      "entrana-de-cerdo",
      "longaniza-ahumada",
    ];
    for (const id of pendientes) {
      expect(getProduct(id)?.price, `precio de ${id}`).toBeNull();
      expect(getProduct(id)?.active, `estado de ${id}`).toBe(false);
      expect(catalogProducts.some((product) => product.id === id)).toBe(false);
    }
  });

  it("ningún producto nace con descripción o imagen inventada", () => {
    for (const product of products) {
      expect(product.shortDescription, `descripción de ${product.id}`).toBeNull();
      expect(product.image, `imagen de ${product.id}`).toBeNull();
    }
  });

  it("no existen identificadores duplicados", () => {
    const ids = products.map((product) => product.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("toda categoría declarada existe en el listado de categorías", () => {
    const known = new Set(categories.map((category) => category.id));
    for (const product of products) {
      expect(known.has(product.categoryId), `categoría de ${product.id}`).toBe(true);
    }
  });

  it("los productos por kilogramo parten en 1 kg", () => {
    for (const product of products) {
      if (product.saleMode === "KG_STANDARD") {
        expect(product.minimumQuantity, `mínimo de ${product.id}`).toBe(1);
      }
    }
  });

  it("el catálogo se ordena por categoría y luego por precio descendente", () => {
    const order = categories.sort((a, b) => a.order - b.order).map((c) => c.id);
    let previousCategory = -1;
    let previousPrice = Infinity;
    for (const product of catalogProducts) {
      const categoryIndex = order.indexOf(product.categoryId);
      if (categoryIndex !== previousCategory) {
        expect(categoryIndex).toBeGreaterThan(previousCategory);
        previousCategory = categoryIndex;
        previousPrice = Infinity;
      }
      expect(product.price ?? 0).toBeLessThanOrEqual(previousPrice);
      previousPrice = product.price ?? 0;
    }
  });
});

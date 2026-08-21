import { describe, expect, it } from "vitest";

import { getShippingForCommune } from "@/lib/delivery";
import { getProduct, productsById } from "@/data/products";
import { normalizeChileanPhone, isValidChileanPhone, isValidEmail } from "@/lib/phone";
import { calculateCartItem, calculateCartTotal, type CartLine } from "@/lib/pricing";
import { normalizeSearchText, sanitizeFreeText, toNullableText } from "@/lib/text";
import { generateWhatsAppMessage, generateWhatsAppUrl } from "@/lib/whatsapp";
import type { CartItem, OrderSnapshot, PreparationType, Product } from "@/types";

const product = (id: string): Product => {
  const found = getProduct(id);
  if (!found) throw new Error(`Producto inexistente: ${id}`);
  return found;
};

const makeLine = (
  id: string,
  quantity: number,
  extra: Partial<CartItem> = {},
): CartLine => {
  const target = product(id);
  const preparationType = (extra.preparationType ?? null) as PreparationType | null;
  const item: CartItem = {
    cartItemId: `${id}-${quantity}`,
    productId: id,
    quantity,
    preparationType,
    portionInstructions: null,
    specialInstructions: null,
    requiresAdvancePreparation: false,
    ...extra,
  };
  return {
    item,
    product: target,
    calculation: calculateCartItem(target, quantity, preparationType),
  };
};

const buildOrder = (
  lines: CartLine[],
  overrides: Partial<OrderSnapshot> = {},
): OrderSnapshot => {
  const conditions = getShippingForCommune("nunoa");
  return {
    items: lines.map((line) => line.item),
    products: productsById,
    commune: conditions?.commune ?? null,
    conditions,
    totals: calculateCartTotal(lines, conditions?.shippingFee ?? null),
    customer: {
      fullName: "Juan Pérez",
      phone: "+56 9 1234 5678",
      email: "juan@email.cl",
    },
    delivery: {
      address: "Av. Irarrázaval 1234",
      residenceType: "apartment",
      apartmentNumber: "804",
      deliveryInstructions: "Llamar al llegar.",
    },
    payment: { method: "bank_transfer" },
    ...overrides,
  };
};

describe("mensaje de WhatsApp", () => {
  it("incluye todos los bloques del pedido modelo", () => {
    const lines = [
      makeLine("lomo-vetado", 2, {
        preparationType: "portioned",
        portionInstructions: "Bistecs de aproximadamente 2 dedos",
        specialInstructions: "Poca grasa",
        requiresAdvancePreparation: true,
      }),
      makeLine("filete", 1, { preparationType: "whole" }),
      makeLine("carbon", 2),
    ];
    const message = generateWhatsAppMessage(buildOrder(lines), lines);

    expect(message).toContain("*CLIENTE*");
    expect(message).toContain("Nombre: Juan Pérez");
    expect(message).toContain("WhatsApp: +56 9 1234 5678");
    expect(message).toContain("Correo: juan@email.cl");

    expect(message).toContain("*ENTREGA*");
    expect(message).toContain("Comuna: Ñuñoa");
    expect(message).toContain("Dirección: Av. Irarrázaval 1234");
    expect(message).toContain("Domicilio: Departamento");
    expect(message).toContain("Depto.: 804");

    expect(message).toContain("*PEDIDO*");
    expect(message).toContain("• Lomo Vetado — 2 kg");
    expect(message).toContain("Preparación: Porcionado");
    expect(message).toContain("Cómo prepararlo: Bistecs de aproximadamente 2 dedos");
    expect(message).toContain("Indicaciones: Poca grasa");
    expect(message).toContain("• Filete — 1 pieza");
    expect(message).toContain("Peso aprox.: 1,8–2,8 kg");
    expect(message).toContain("Valor estimado: $32.382–$50.372");
    expect(message).toContain("• Carbón — 2 bolsas de 2,5 kg");

    expect(message).toContain("*VALORES*");
    expect(message).toContain("Productos: $74.342–$92.332 aprox.");
    expect(message).toContain("Despacho Ñuñoa: $2.990");
    expect(message).toContain("Total estimado: $77.332–$95.322 aprox.");
    expect(message).toContain("Forma de pago: Transferencia");
    expect(message).toContain("14 horas de anticipación");
  });

  it("omite los campos vacíos en vez de imprimir null o undefined", () => {
    const lines = [makeLine("carbon", 1)];
    const order = buildOrder(lines, {
      customer: { fullName: "Ana Soto", phone: "912345678", email: "" },
      delivery: {
        address: "Los Militares 1234",
        residenceType: "house",
        apartmentNumber: "",
        deliveryInstructions: "",
      },
      payment: { method: "cash" },
    });
    const message = generateWhatsAppMessage(order, lines);

    expect(message).not.toContain("null");
    expect(message).not.toContain("undefined");
    expect(message).not.toContain("Correo:");
    expect(message).not.toContain("Depto.:");
    expect(message).not.toContain("Indicaciones:");
    expect(message).toContain("Domicilio: Casa");
    expect(message).toContain("Forma de pago: Efectivo");
  });

  it("no muestra preparación en productos que no la admiten", () => {
    const lines = [makeLine("carbon", 2)];
    const message = generateWhatsAppMessage(buildOrder(lines), lines);
    expect(message).not.toContain("Preparación:");
    expect(message).not.toContain("No aplica");
  });

  it("no incluye la advertencia de anticipación si el pedido no la requiere", () => {
    const lines = [makeLine("carbon", 2)];
    const message = generateWhatsAppMessage(buildOrder(lines), lines);
    expect(message).not.toContain("preparación especial");
  });

  it("un producto sin rango estimable nunca aparece como $0", () => {
    const lines = [makeLine("lomo-vetado", 3), makeLine("pollo-entero", 1)];
    const message = generateWhatsAppMessage(buildOrder(lines), lines);
    expect(message).toContain("Valor final según peso real");
    expect(message).toContain("Subtotal calculable:");
    expect(message).toContain("+ Pollo Entero según peso real");
    expect(message).toContain("Total definitivo sujeto a pesaje");
    expect(message).not.toContain("$0");
  });

  it("codifica tildes, ñ y saltos de línea en la URL", () => {
    const lines = [makeLine("lomo-vetado", 1)];
    const url = generateWhatsAppUrl(generateWhatsAppMessage(buildOrder(lines), lines));
    expect(url.startsWith("https://wa.me/56930169902?text=")).toBe(true);
    expect(url).not.toContain(" ");
    expect(decodeURIComponent(url.split("?text=")[1])).toContain("Ñuñoa");
  });

  it("conserva las instrucciones exactamente como las escribió el cliente", () => {
    const texto = "bistecs de 2 dedos, no tan finos";
    const lines = [
      makeLine("lomo-vetado", 1, {
        preparationType: "portioned",
        portionInstructions: texto,
      }),
    ];
    const message = generateWhatsAppMessage(buildOrder(lines), lines);
    expect(message).toContain(`Cómo prepararlo: ${texto}`);
  });
});

describe("normalización de teléfonos", () => {
  it("acepta los formatos habituales", () => {
    for (const input of [
      "912345678",
      "+56912345678",
      "9 1234 5678",
      "+56 9 1234 5678",
      "56912345678",
    ]) {
      expect(normalizeChileanPhone(input).normalized).toBe("+56912345678");
    }
  });

  it("da formato legible", () => {
    expect(normalizeChileanPhone("912345678").display).toBe("+56 9 1234 5678");
  });

  it("rechaza números inválidos", () => {
    expect(isValidChileanPhone("12345")).toBe(false);
    expect(isValidChileanPhone("221234567")).toBe(false);
    expect(isValidChileanPhone("")).toBe(false);
  });

  it("valida el formato del correo sin verificar existencia", () => {
    expect(isValidEmail("juan@email.cl")).toBe(true);
    expect(isValidEmail("juan@email")).toBe(false);
    expect(isValidEmail("sin-arroba.cl")).toBe(false);
  });
});

describe("saneamiento de texto libre", () => {
  it("elimina marcado HTML pero conserva tildes y ñ", () => {
    expect(sanitizeFreeText("<b>Poca</b> grasa, ñandú á")).toBe("Poca grasa, ñandú á");
  });

  it("neutraliza intentos de inyección", () => {
    const result = sanitizeFreeText("<script>alert('x')</script>Sin tendón");
    expect(result).not.toContain("<");
    expect(result).not.toContain("script>");
    expect(result).toContain("Sin tendón");
  });

  it("una cadena de solo espacios se considera vacía", () => {
    expect(toNullableText("   ")).toBeNull();
    expect(toNullableText("")).toBeNull();
    expect(toNullableText("  Poca grasa  ")).toBe("Poca grasa");
  });

  it("respeta el límite de caracteres", () => {
    expect(sanitizeFreeText("a".repeat(500), 300)).toHaveLength(300);
  });

  it("normaliza texto para búsquedas", () => {
    expect(normalizeSearchText("Peñalolén")).toBe("penalolen");
    expect(normalizeSearchText("  TOMAHAWK ")).toBe("tomahawk");
  });
});

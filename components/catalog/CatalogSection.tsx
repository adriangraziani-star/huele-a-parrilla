"use client";

import { useMemo, useState } from "react";

import { ProductCard } from "@/components/catalog/ProductCard";
import { IconSearch } from "@/components/ui/Icons";
import { categories } from "@/data/categories";
import { catalogProducts } from "@/data/products";
import { trackEvent } from "@/lib/analytics";
import { normalizeSearchText } from "@/lib/text";
import { useOrder } from "@/store/order-store";
import { useUi } from "@/store/ui-store";
import type { CategoryId, Product } from "@/types";

type Filter = CategoryId | "todos";

const filters: { id: Filter; label: string }[] = [
  { id: "todos", label: "Todos" },
  ...[...categories]
    .sort((a, b) => a.order - b.order)
    .map((category) => ({ id: category.id as Filter, label: category.name })),
];

export function CatalogSection() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("todos");
  const { items, addItem } = useOrder();
  const { openCustomization, showToast } = useUi();

  const productsInCart = useMemo(
    () => new Set(items.map((item) => item.productId)),
    [items],
  );

  const visibleProducts = useMemo(() => {
    const term = normalizeSearchText(query);
    return catalogProducts.filter((product) => {
      const matchesCategory = filter === "todos" || product.categoryId === filter;
      const matchesQuery =
        term.length === 0 || normalizeSearchText(product.name).includes(term);
      return matchesCategory && matchesQuery;
    });
  }, [query, filter]);

  const handleAdd = (product: Product, quantity: number) => {
    // Sin personalización posible, el producto entra directamente al pedido.
    if (!product.allowPreparationChoice && !product.allowSpecialInstructions) {
      addItem(product, {
        quantity,
        preparationType: null,
        portionInstructions: null,
        specialInstructions: null,
      });
      showToast(`${product.name} agregado a tu pedido`);
      return;
    }
    openCustomization({ product, quantity, editing: null });
  };

  const handleFilter = (next: Filter) => {
    setFilter(next);
    trackEvent("select_category", { category: next });
  };

  return (
    <section id="catalogo" className="section bg-ivory-deep">
      <div className="container-page">
        <header className="max-w-2xl">
          <p className="eyebrow">Catálogo</p>
          <h2 className="display-2 mt-3">Arma tu pedido</h2>
          <p className="mt-4 text-[1.02rem] leading-relaxed text-charcoal-muted">
            Explora nuestros productos, selecciona las cantidades y personaliza tus
            cortes cuando corresponda.
          </p>
        </header>

        <div className="mt-8 flex flex-col gap-4">
          <div className="relative max-w-md">
            <IconSearch
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-leather"
              width={18}
              height={18}
            />
            <label className="sr-only" htmlFor="buscador-catalogo">
              Buscar producto
            </label>
            <input
              id="buscador-catalogo"
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                if (event.target.value.length > 2) {
                  trackEvent("search_product");
                }
              }}
              placeholder="¿Qué estás buscando?"
              className="field-input pl-10"
            />
          </div>

          <div className="-mx-5 overflow-x-auto px-5 pb-1 md:mx-0 md:px-0">
            <div
              role="group"
              aria-label="Filtrar por categoría"
              className="flex w-max gap-2 md:w-auto md:flex-wrap"
            >
              {filters.map((entry) => {
                const active = filter === entry.id;
                return (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => handleFilter(entry.id)}
                    aria-pressed={active}
                    className={`whitespace-nowrap rounded-full border px-4 py-2 text-[0.83rem] font-semibold transition ${
                      active
                        ? "border-charcoal bg-charcoal text-ivory"
                        : "border-leather/30 bg-transparent text-charcoal hover:border-charcoal"
                    }`}
                  >
                    {entry.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {visibleProducts.length === 0 ? (
          <div className="panel mt-8 px-6 py-12 text-center">
            <p className="display-3">No encontramos productos con ese nombre</p>
            <p className="mt-2 text-sm text-charcoal-muted">
              Revisa la escritura o vuelve a ver el catálogo completo.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setFilter("todos");
              }}
              className="btn btn-charcoal mt-5"
            >
              Ver todos los productos
            </button>
          </div>
        ) : (
          <>
            <p className="mt-6 text-[0.8rem] text-charcoal-muted" aria-live="polite">
              {visibleProducts.length}{" "}
              {visibleProducts.length === 1 ? "producto" : "productos"}
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {visibleProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  inCart={productsInCart.has(product.id)}
                  onAdd={handleAdd}
                />
              ))}
            </div>
          </>
        )}

        <p className="mt-8 max-w-2xl text-[0.82rem] leading-relaxed text-charcoal-muted">
          Los pesos de las piezas son aproximados y pueden variar. El valor
          definitivo será confirmado según el peso real de los productos preparados
          para tu pedido.
        </p>
      </div>
    </section>
  );
}

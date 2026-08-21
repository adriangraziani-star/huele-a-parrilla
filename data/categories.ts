import type { Category } from "@/types";

export const categories: Category[] = [
  { id: "vacuno", name: "Vacuno", order: 1 },
  { id: "cerdo", name: "Cerdo", order: 2 },
  { id: "pollo", name: "Pollo", order: 3 },
  { id: "subproductos", name: "Subproductos", order: 4 },
  { id: "extras", name: "Extras", order: 5 },
];

export const getCategoryName = (id: string): string =>
  categories.find((category) => category.id === id)?.name ?? id;

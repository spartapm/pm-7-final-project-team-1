import type { Product } from "./types";
import raw from "./data/products.json";

export const PRODUCTS = raw as Product[];

export function productById(id: string | undefined | null) {
  if (!id) return undefined;
  return PRODUCTS.find((p) => p.id === id);
}

export function productsByCategory(category: Product["category"]) {
  return PRODUCTS.filter((p) => p.category === category);
}

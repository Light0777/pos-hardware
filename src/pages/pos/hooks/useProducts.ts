import { useState, useEffect } from "react";
import { getProducts } from "../../../renderer/services/productApi";
import type { Product } from "../../../renderer/types/product";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  return { products, loading };
}
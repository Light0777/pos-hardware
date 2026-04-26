import { useCartStore } from "../store/cartStore";
import { calculateCart } from "../services/cartService";

export function useCartTotals() {
  const items = useCartStore((s) => s.items);
  return calculateCart(items);
}
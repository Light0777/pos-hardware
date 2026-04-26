import { create } from "zustand";

type CartItem = {
  product_uuid: string;
  name: string;
  price: number;
  gst_percent: number;
  quantity: number;
  discount: number;
};

type CartStore = {
  items: CartItem[];

  addItem: (product: Omit<CartItem, "quantity" | "discount">) => void;
  removeItem: (product_uuid: string) => void;
  increaseQty: (product_uuid: string) => void;
  decreaseQty: (product_uuid: string) => void;
};

export const useCartStore = create<CartStore>((set) => ({
  items: [],

  addItem: (product) =>
    set((state) => {
      const existing = state.items.find(
        (i) => i.product_uuid === product.product_uuid
      );

      if (existing) {
        return {
          items: state.items.map((item) =>
            item.product_uuid === product.product_uuid
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }

      return {
        items: [
          ...state.items,
          { ...product, quantity: 1, discount: 0 },
        ],
      };
    }),

  removeItem: (product_uuid) =>
    set((state) => ({
      items: state.items.filter((i) => i.product_uuid !== product_uuid),
    })),

  increaseQty: (product_uuid) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.product_uuid === product_uuid
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ),
    })),

  decreaseQty: (product_uuid) =>
    set((state) => ({
      items: state.items
        .map((item) =>
          item.product_uuid === product_uuid
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0),
    })),
}));
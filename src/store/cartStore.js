import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [], // { product, name, image, price, quantity, stock, size }

      addItem: (item) => {
        const items = get().items;
        
        // Product ID এবং Size দুটো মিলিয়ে চেক করা হবে
        const existing = items.find(
          (i) => i.product === item.product && i.size === item.size
        );

        if (existing) {
          set({
            items: items.map((i) =>
              i.product === item.product && i.size === item.size
                ? { ...i, quantity: Math.min(i.quantity + item.quantity, i.stock) }
                : i
            ),
          });
        } else {
          set({ items: [...items, item] });
        }
      },

      // Product ID এবং Size দুটি পাস করতে হবে ডিলিটের জন্য
      removeItem: (productId, size) =>
        set({
          items: get().items.filter(
            (i) => !(i.product === productId && i.size === size)
          ),
        }),

      // Quantity আপডেটের জন্যও Product ID এবং Size মিলানো দরকার
      updateQuantity: (productId, quantity, size) =>
        set({
          items: get().items.map((i) =>
            i.product === productId && i.size === size ? { ...i, quantity } : i
          ),
        }),

      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () => get().items.reduce((sum, i) => sum + (i.price || 0) * i.quantity, 0),
    }),
    { name: "cart-storage" }
  )
);
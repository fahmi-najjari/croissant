"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Product } from "@/lib/api";

export type CartItem = {
  productId: number;
  name_fr: string;
  name_ar: string;
  price: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  itemsCount: number;
  subtotal: number;
  addItem: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const storageKey = "23-en-voie-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        setItems(JSON.parse(saved) as CartItem[]);
      }
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      window.localStorage.setItem(storageKey, JSON.stringify(items));
    }
  }, [isLoaded, items]);

  const addItem = useCallback((product: Product, quantity = 1) => {
    setItems((current) => {
      const existing = current.find((item) => item.productId === product.id);
      if (existing) {
        return current.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }

      return [
        ...current,
        {
          productId: product.id,
          name_fr: product.name_fr,
          name_ar: product.name_ar,
          price: product.current_price,
          quantity,
        },
      ];
    });
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    setItems((current) =>
      current
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.max(0, quantity) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const removeItem = useCallback((productId: number) => {
    setItems((current) => current.filter((item) => item.productId !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const value = useMemo(
    () => ({
      items,
      itemsCount: items.reduce((total, item) => total + item.quantity, 0),
      subtotal: items.reduce(
        (total, item) => total + Number(item.price) * item.quantity,
        0,
      ),
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [addItem, clearCart, items, removeItem, updateQuantity],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}

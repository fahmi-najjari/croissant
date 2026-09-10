"use client";

import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import type { Product } from "@/lib/api";

type AddToCartButtonProps = {
  product: Product;
  labels?: {
    add: string;
    added: string;
    unavailable: string;
    decrease: string;
    increase: string;
  };
};

const defaultLabels = {
  add: "Ajouter",
  added: "Ajoute",
  unavailable: "Indisponible",
  decrease: "Reduire la quantite",
  increase: "Augmenter la quantite",
};

export function AddToCartButton({ product, labels = defaultLabels }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  function handleAdd() {
    addItem(product, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  }

  if (!product.in_stock) {
    return (
      <button
        type="button"
        disabled
        className="mt-4 w-full rounded-md border border-[var(--line)] bg-[var(--background-soft)] px-4 py-3 text-sm font-bold text-[var(--muted)]"
      >
        {labels.unavailable}
      </button>
    );
  }

  return (
    <div className="mt-4 grid grid-cols-[112px_1fr] gap-2">
      <div className="grid grid-cols-3 overflow-hidden rounded-md border border-[var(--line)] bg-[var(--cream)]">
        <button
          type="button"
          className="grid place-items-center transition-colors hover:bg-[var(--background-soft)]"
          aria-label={labels.decrease}
          onClick={() => setQuantity((value) => Math.max(1, value - 1))}
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="grid place-items-center text-sm font-bold">{quantity}</span>
        <button
          type="button"
          className="grid place-items-center transition-colors hover:bg-[var(--background-soft)]"
          aria-label={labels.increase}
          onClick={() => setQuantity((value) => value + 1)}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <button
        type="button"
        className="inline-flex items-center justify-center gap-2 rounded-md bg-[var(--button)] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[var(--button-hover)]"
        onClick={handleAdd}
      >
        <ShoppingBag className="h-4 w-4" />
        {added ? labels.added : labels.add}
      </button>
    </div>
  );
}

"use client";

import { useCart } from "@/lib/useCart";
import type { Product } from "@/lib/types";

type Props = {
  product: Product;
};

export default function AddToCartButton({ product }: Props) {
  const { addToCart, isInCart } = useCart();
  const inCart = isInCart(product.id);

  return (
    <section className="flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm">
      <button
        type="button"
        onClick={() => addToCart(product.id)}
        disabled={inCart}
        className={`h-14 w-full rounded-2xl text-lg font-bold shadow-sm transition active:scale-95 disabled:opacity-60 ${
          inCart ? "bg-gray-100 text-gray-400" : "bg-c-green text-white"
        }`}
      >
        {inCart ? "장바구니에 담겨있어요 🛒" : "장바구니에 추가하기"}
      </button>
    </section>
  );
}

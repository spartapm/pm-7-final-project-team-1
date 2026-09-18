"use client";

import { useRouter } from "next/navigation";
import { IconCart, IconSearchSm } from "@/components/icons";
import { useStore } from "@/lib/store";

export function HeadTools() {
  const router = useRouter();
  const { cart } = useStore();
  const cartCount = cart.reduce((n, c) => n + c.qty, 0);
  return (
    <div style={{ display: "flex", gap: 4 }}>
      <button className="cart-head" type="button" aria-label="검색" onClick={() => router.push("/search")}>
        <IconSearchSm />
      </button>
      <button className="cart-head" type="button" aria-label="장바구니" onClick={() => router.push("/cart")}>
        <IconCart />
        {cartCount > 0 ? <span className="cart-badge">{cartCount}</span> : null}
      </button>
    </div>
  );
}

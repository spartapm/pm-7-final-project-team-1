"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Thumb } from "@/components/ui";
import { IconHeart } from "@/components/icons";
import { useStore } from "@/lib/store";
import { formatVolumePrice } from "@/lib/ranking";
import { feelPreview } from "@/lib/badges";
import { setSourceScreen, track } from "@/lib/analytics";
import type { Product } from "@/lib/types";

export function RankRow({
  product,
  rank,
  source,
}: {
  product: Product;
  rank: number;
  source: string;
}) {
  const router = useRouter();
  const { isWished, toggleWish } = useStore();
  const wished = isWished(product.id);
  const [open, setOpen] = useState(false);
  const feel = feelPreview(product);
  const tags = open ? product.feelTags : feel.shown;

  return (
    <div className="rank-card">
      <span className={`rank-no${rank <= 3 ? " top" : ""}`}>{rank}</span>
      <button
        type="button"
        onClick={() => {
          track("select_item", { item_id: product.id, item_list_name: product.category });
          setSourceScreen(source);
          router.push(`/products/${product.id}`);
        }}
      >
        <Thumb src={product.image} alt={product.name} />
      </button>
      <button
        type="button"
        style={{ textAlign: "left" }}
        onClick={() => {
          track("select_item", { item_id: product.id, item_list_name: product.category });
          setSourceScreen(source);
          router.push(`/products/${product.id}`);
        }}
      >
        <h3>{product.name}</h3>
        <p>{formatVolumePrice(product.volume, product.price)}</p>
        <p>
          ★ {product.rating.toFixed(1)} · {product.reviewCount.toLocaleString("ko-KR")}
        </p>
        {product.feelTags.length > 0 ? (
          <div className="feel-row">
            {tags.map((t) => (
              <span className="tag" key={t}>
                {t}
              </span>
            ))}
            {product.feelTags.length > 2 ? (
              <button
                className="caret"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen((v) => !v);
                }}
              >
                {open ? "∧" : "∨"}
              </button>
            ) : null}
          </div>
        ) : null}
      </button>
      <button
        className={`heart${wished ? " on" : ""}`}
        type="button"
        aria-label="찜"
        onClick={() => {
          const on = toggleWish(product.id);
          if (on) track("add_to_wishlist", { item_id: product.id, item_name: product.name, price: product.price });
        }}
      >
        <IconHeart filled={wished} size={20} />
      </button>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Thumb } from "@/components/ui";
import { IconHeart, IconStar, IconUp } from "@/components/icons";
import { useStore } from "@/lib/store";
import { formatPrice, formatVolume, liveRating } from "@/lib/ranking";
import { feelPreview, feelTone } from "@/lib/badges";
import { setSourceScreen, track } from "@/lib/analytics";
import type { Product } from "@/lib/types";

export function RankRow({
  product,
  rank,
  source,
  onOpen,
  onPick,
}: {
  product: Product;
  rank?: number;
  source: string;
  onOpen?: () => void;
  onPick?: () => void;
}) {
  const router = useRouter();
  const { isWished, toggleWish, reviews } = useStore();
  const wished = isWished(product.id);
  const [open, setOpen] = useState(false);
  const feel = feelPreview(product);
  const tags = open ? product.feelTags : feel.shown;
  const mine = reviews.filter((r) => r.productId === product.id);
  const rating = liveRating(mine, product.rating);

  const goProduct = () => {
    onOpen?.();
    if (onPick) {
      onPick();
      return;
    }
    track("select_item", { item_id: product.id, item_list_name: source });
    setSourceScreen(source);
    router.push(`/products/${product.id}`);
  };

  return (
    <div className={`rank-card${rank == null ? " no-rank" : ""}`}>
      {rank != null ? <span className="rank-no">{rank}</span> : null}
      <button className="rank-thumb" type="button" onClick={goProduct} aria-label={product.name}>
        <Thumb src={product.image} alt={product.name} />
      </button>
      <div className="rank-main">
        <button type="button" onClick={goProduct}>
          <h3>{product.name}</h3>
          <p className="brand-name">{product.brand}</p>
          <p className="vol-price">
            {formatVolume(product.volume)} · <strong>{formatPrice(product.price)}</strong>
          </p>
        </button>
        <div className="rank-foot">
          <button className="star-line" type="button" onClick={goProduct}>
            <IconStar filled size={11} />
            {rating.toFixed(1)}
          </button>
          {product.feelTags.length > 0 ? (
            <div className="feel-pills">
              {tags.map((t) => (
                <span className={`feel-pill ${feelTone(t)}`} key={t}>
                  {t}
                </span>
              ))}
              {product.feelTags.length > 2 ? (
                <button
                  className={`caret-btn${open ? " open" : ""}`}
                  type="button"
                  aria-label={open ? "태그 접기" : "태그 더보기"}
                  onClick={() => setOpen((v) => !v)}
                >
                  <IconUp />
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
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

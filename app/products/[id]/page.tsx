"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PhoneShell, SafeImg } from "@/components/ui";
import { ProductFrame } from "@/components/product-frame";
import { IconBack } from "@/components/icons";
import { useStore } from "@/lib/store";
import { productById } from "@/lib/products";
import { consumeSourceScreen, trackViewItem } from "@/lib/analytics";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { hydrated, account, addView } = useStore();
  const product = productById(id);
  const [more, setMore] = useState(false);
  const shots = product?.gallery.length ? product.gallery : product?.image ? [product.image] : [];

  useEffect(() => {
    if (!hydrated) return;
    if (!account) router.replace("/login");
    else if (!account.onboardingDone) router.replace("/home");
  }, [hydrated, account, router]);

  useEffect(() => {
    if (product) addView(product.id);
  }, [product, addView]);

  useEffect(() => {
    if (!product) return;
    trackViewItem({
      item_id: product.id,
      item_name: product.name,
      price: product.price,
      source_screen: consumeSourceScreen("product"),
    });
  }, [product?.id]);

  if (!hydrated || !product) {
    return (
      <PhoneShell>
        <div className="page">
          <div className="close-bar">
            <button className="close-bar-btn" type="button" onClick={() => router.back()} aria-label="뒤로">
              <IconBack />
            </button>
          </div>
        </div>
      </PhoneShell>
    );
  }

  return (
    <ProductFrame product={product} tab="info">
      {shots.length > 0 ? (
        <div className={`detail-gallery${more ? "" : " collapsed"}`}>
          {(more ? shots : shots.slice(0, 1)).map((src) => (
            <SafeImg key={src} className="detail-img" src={src} />
          ))}
        </div>
      ) : (
        <div style={{ padding: 16, fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>
          <p>전성분: {product.ingredients.join(", ")}</p>
          <p>주요 성분: {product.keyIngredients.join(", ")}</p>
        </div>
      )}
      {shots.length > 0 ? (
        <button className="more-btn" type="button" onClick={() => setMore((v) => !v)}>
          {more ? "상세 접기" : "상세 더보기"}
        </button>
      ) : null}
    </ProductFrame>
  );
}

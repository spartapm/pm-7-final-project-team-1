"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PhoneShell, Thumb } from "@/components/ui";
import { IconBack, IconMinus, IconPlus } from "@/components/icons";
import { useStore } from "@/lib/store";
import { productById } from "@/lib/products";
import { formatPrice } from "@/lib/ranking";

export default function CartPage() {
  const router = useRouter();
  const { hydrated, account, cart, setCartQty, removeFromCart, showToast } = useStore();

  useEffect(() => {
    if (!hydrated) return;
    if (!account) router.replace("/login");
    else if (!account.onboardingDone) router.replace("/onboarding");
  }, [hydrated, account, router]);

  const rows = useMemo(
    () =>
      [...cart]
        .sort((a, b) => b.addedAt - a.addedAt)
        .map((c) => {
          const product = productById(c.productId);
          return product ? { ...c, product } : null;
        })
        .filter((x): x is NonNullable<typeof x> => !!x),
    [cart]
  );

  const totalQty = rows.reduce((n, r) => n + r.qty, 0);
  const totalPrice = rows.reduce((n, r) => n + r.product.price * r.qty, 0);

  if (!hydrated || !account?.onboardingDone) return <PhoneShell />;

  return (
    <PhoneShell>
      <div className="page" style={{ position: "relative" }}>
        <div className="topbar">
          <button className="side" type="button" onClick={() => router.back()} aria-label="뒤로">
            <IconBack />
          </button>
          <h1>장바구니</h1>
          <span />
        </div>

        {rows.length === 0 ? (
          <div className="empty">
            <div className="icon-wrap">🛒</div>
            <h2>아직 담긴 제품이 없어요</h2>
            <p>마음에 드는 제품을 담아 모아보세요</p>
            <button className="btn-primary" type="button" onClick={() => router.push("/home")}>
              홈으로 가기
            </button>
          </div>
        ) : (
          <>
            <div className="page-scroll" style={{ padding: "0 0 8px" }}>
              <div className="cart-list">
                {rows.map((row) => (
                  <div key={row.productId} className="cart-row">
                    <button type="button" onClick={() => router.push(`/products/${row.product.id}`)}>
                      <Thumb src={row.product.image} alt={row.product.name} />
                    </button>
                    <div>
                      <button
                        type="button"
                        className="cart-info"
                        onClick={() => router.push(`/products/${row.product.id}`)}
                      >
                        <p className="cart-brand">{row.product.brand}</p>
                        <h3>{row.product.name}</h3>
                        <strong>{formatPrice(row.product.price * row.qty)}</strong>
                      </button>
                      <div className="cart-actions">
                        <div className="qty">
                          <button
                            type="button"
                            aria-label="수량 줄이기"
                            onClick={() => setCartQty(row.productId, row.qty - 1)}
                          >
                            <IconMinus />
                          </button>
                          <span>{row.qty}</span>
                          <button
                            type="button"
                            aria-label="수량 늘리기"
                            onClick={() => {
                              if (row.qty >= 10) {
                                showToast("최대 10개까지 담을 수 있어요");
                                return;
                              }
                              setCartQty(row.productId, row.qty + 1);
                            }}
                          >
                            <IconPlus />
                          </button>
                        </div>
                        <button className="cart-del" type="button" onClick={() => removeFromCart(row.productId)}>
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="cart-bar">
              <div>
                <div className="cart-total-label">총 {totalQty}개</div>
                <div className="cart-total">{formatPrice(totalPrice)}</div>
              </div>
              <div className="cart-order">
                <button className="btn-disabled" type="button" disabled>
                  주문하기
                </button>
                <p>결제는 아직 준비 중이에요</p>
              </div>
            </div>
          </>
        )}
      </div>
    </PhoneShell>
  );
}

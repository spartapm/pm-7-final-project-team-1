"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PhoneShell, Thumb } from "@/components/ui";
import { IconBack, IconCart, IconCircleMinus, IconCirclePlus, IconClose } from "@/components/icons";
import { useStore } from "@/lib/store";
import { productById } from "@/lib/products";
import { formatPrice, formatVolumePrice } from "@/lib/ranking";
import { setSourceScreen, track } from "@/lib/analytics";

export default function CartPage() {
  const router = useRouter();
  const { hydrated, account, cart, setCartQty, removeFromCart, showToast } = useStore();
  const [picked, setPicked] = useState<string[]>([]);
  const [confirm, setConfirm] = useState<string[] | null>(null);
  const seeded = useRef(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!account) router.replace("/login");
    else if (!account.onboardingDone) router.replace("/home");
  }, [hydrated, account, router]);

  useEffect(() => {
    const ids = cart.map((c) => c.productId);
    if (!seeded.current && ids.length) {
      setPicked(ids);
      seeded.current = true;
      return;
    }
    setPicked((p) => p.filter((id) => ids.includes(id)));
  }, [cart]);

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

  const ids = rows.map((r) => r.productId);
  const allOn = ids.length > 0 && ids.every((id) => picked.includes(id));
  const selectedRows = rows.filter((r) => picked.includes(r.productId));
  const selectedPrice = selectedRows.reduce((n, r) => n + r.product.price * r.qty, 0);

  if (!hydrated || !account?.onboardingDone) return <PhoneShell />;

  return (
    <PhoneShell>
      <div className="page" style={{ position: "relative" }}>
        <div className="topbar start">
          <button className="side" type="button" onClick={() => router.back()} aria-label="뒤로">
            <IconBack />
          </button>
          <h1>장바구니</h1>
        </div>

        <div className="page-scroll cart-scroll">
          <div className="list-meta" style={{ paddingTop: 4 }}>
            <button type="button" className="cart-all" onClick={() => setPicked(allOn ? [] : ids)}>
              <span className={`chk${allOn ? " on" : ""}`}>✓</span>
              제품 전체 선택
            </button>
            <button
              className="select-del"
              type="button"
              onClick={() => {
                if (!picked.length) {
                  showToast("삭제할 제품을 선택해 주세요");
                  return;
                }
                setConfirm(picked);
              }}
            >
              선택 삭제
            </button>
          </div>
          <p className="cart-count">총 {rows.length}개</p>
          {rows.length === 0 ? (
            <div className="empty">
              <div className="icon-wrap">
                <IconCart size={29} />
              </div>
              <h2>아직 담은 제품이 없어요</h2>
              <p>제품을 둘러보고 장바구니에 담아보세요</p>
              <button className="btn-primary" type="button" onClick={() => router.push("/home")}>
                홈으로 가기
              </button>
            </div>
          ) : (
            <div className="cart-list">
                {rows.map((row) => (
                  <div key={row.productId} className="cart-block">
                    <div className="cart-main">
                      <button
                        type="button"
                        className={`chk${picked.includes(row.productId) ? " on" : ""}`}
                        onClick={() =>
                          setPicked((p) => (p.includes(row.productId) ? p.filter((id) => id !== row.productId) : [...p, row.productId]))
                        }
                      >
                        ✓
                      </button>
                      <div className="cart-card">
                        <button
                          type="button"
                          onClick={() => {
                            setSourceScreen("cart");
                            router.push(`/products/${row.product.id}`);
                          }}
                        >
                          <Thumb src={row.product.image} alt={row.product.name} />
                        </button>
                        <button
                          type="button"
                          className="cart-info"
                          onClick={() => {
                            setSourceScreen("cart");
                            router.push(`/products/${row.product.id}`);
                          }}
                        >
                          <p className="cart-brand">{row.product.brand}</p>
                          <h3>{row.product.name}</h3>
                          <p className="cart-vol">{formatVolumePrice(row.product.volume, row.product.price)}</p>
                        </button>
                        <button className="cart-del" type="button" onClick={() => setConfirm([row.productId])} aria-label="삭제">
                          <IconClose />
                        </button>
                      </div>
                    </div>
                    <div className="cart-qty-bar">
                      <div className="qty">
                        <button type="button" aria-label="수량 줄이기" disabled={row.qty <= 1} onClick={() => setCartQty(row.productId, row.qty - 1)}>
                          <IconCircleMinus />
                        </button>
                        <span>{row.qty}</span>
                        <button
                          type="button"
                          aria-label="수량 늘리기"
                          disabled={row.qty >= 10}
                          onClick={() => {
                            if (row.qty >= 10) {
                              showToast("최대 10개까지 담을 수 있어요");
                              return;
                            }
                            setCartQty(row.productId, row.qty + 1);
                          }}
                        >
                          <IconCirclePlus />
                        </button>
                      </div>
                      <strong>
                        {formatPrice(row.product.price * row.qty).replace("원", "")}
                        <span>원</span>
                      </strong>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
        {rows.length > 0 ? (
          <div className="cart-bar">
            <button
              className="btn-primary"
              type="button"
              disabled={!picked.length}
              onClick={() => {
                if (!picked.length) return;
                track("begin_checkout", { value: selectedPrice });
                showToast("아직 구현되지 않은 영역입니다");
              }}
            >
              <span className="cart-cta-sum">총 {formatPrice(selectedPrice)}</span>
              {" 주문하기"}
            </button>
          </div>
        ) : null}

        {confirm ? (
          <div className="dim center" onClick={() => setConfirm(null)}>
            <div className="modal cart-del-modal" onClick={(e) => e.stopPropagation()}>
              <h2>선택한 제품을 삭제 하시겠어요?</h2>
              <div className="modal-btns">
                <button className="sub" type="button" onClick={() => setConfirm(null)}>
                  아니요
                </button>
                <button
                  className="main"
                  type="button"
                  onClick={() => {
                    confirm.forEach((id) => removeFromCart(id));
                    setPicked((p) => p.filter((id) => !confirm.includes(id)));
                    setConfirm(null);
                  }}
                >
                  네
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </PhoneShell>
  );
}

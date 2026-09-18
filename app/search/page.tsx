"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PhoneShell, Thumb } from "@/components/ui";
import { IconBack, IconClock, IconClose, IconSearch, IconSearchSm } from "@/components/icons";
import { useStore } from "@/lib/store";
import { PRODUCTS } from "@/lib/products";
import { formatVolumePrice } from "@/lib/ranking";
import { setSourceScreen } from "@/lib/analytics";

const KEY = "vion:recent-search";

function loadRecent() {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

function saveRecent(list: string[]) {
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 3)));
}

function fold(s: string) {
  return s.replace(/\s+/g, "").toLowerCase();
}

function highlight(name: string, q: string) {
  const target = fold(q);
  if (!target) return name;
  const lower = name.toLowerCase();
  let si = 0;
  let start = -1;
  let end = -1;
  for (let i = 0; i < lower.length; i++) {
    if (/\s/.test(lower[i])) continue;
    if (lower[i] === target[si]) {
      if (si === 0) start = i;
      si += 1;
      if (si === target.length) {
        end = i + 1;
        break;
      }
    } else if (lower[i] === target[0]) {
      start = i;
      si = 1;
    } else {
      start = -1;
      si = 0;
    }
  }
  if (start < 0 || end < 0) return name;
  return (
    <>
      {name.slice(0, start)}
      <span className="hl">{name.slice(start, end)}</span>
      {name.slice(end)}
    </>
  );
}

export default function SearchPage() {
  const router = useRouter();
  const { hydrated, account } = useStore();
  const [q, setQ] = useState("");
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    if (!hydrated) return;
    if (!account) router.replace("/login");
    else if (!account.onboardingDone) router.replace("/home");
    setRecent(loadRecent());
  }, [hydrated, account, router]);

  const hits = useMemo(() => {
    const query = fold(q);
    if (!query) return [];
    return PRODUCTS.filter((p) => fold(p.name).includes(query) || fold(p.brand).includes(query));
  }, [q]);

  const remember = (term: string) => {
    const next = [term, ...recent.filter((x) => x !== term)].slice(0, 3);
    setRecent(next);
    saveRecent(next);
  };

  if (!hydrated || !account?.onboardingDone) return <PhoneShell />;

  return (
    <PhoneShell>
      <div className="page">
        <div className="search-top">
          <button className="side" type="button" onClick={() => router.back()} aria-label="뒤로">
            <IconBack />
          </button>
          <div className="search-box" style={{ margin: 0, flex: 1 }}>
            <span className="search-ico">
              <IconSearchSm />
            </span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="정확한 제품명을 입력해 주세요" />
            <button type="button" className="search-clear" onClick={() => setQ("")} aria-label="지우기">
              <IconClose />
            </button>
          </div>
        </div>
        <div className="page-scroll bleed">
          {!q.trim() ? (
            <RecentBlock
              recent={recent}
              showEmpty
              onPick={setQ}
              onClear={() => {
                setRecent([]);
                saveRecent([]);
              }}
              onRemove={(term) => {
                const next = recent.filter((x) => x !== term);
                setRecent(next);
                saveRecent(next);
              }}
            />
          ) : hits.length === 0 ? (
            <>
              <RecentBlock
                recent={recent}
                showEmpty={false}
                onPick={setQ}
                onClear={() => {
                  setRecent([]);
                  saveRecent([]);
                }}
                onRemove={(term) => {
                  const next = recent.filter((x) => x !== term);
                  setRecent(next);
                  saveRecent(next);
                }}
              />
              <div className="empty">
                <div className="icon-wrap">
                  <IconSearch />
                </div>
                <h2>일치하는 제품이 없어요</h2>
                <p>검색어를 바꾸거나 다른 제품을 찾아보세요</p>
              </div>
            </>
          ) : (
            <>
              <div className="rank-list">
                {hits.slice(0, 3).map((p) => (
                  <button
                    key={p.id}
                    className="rank-card"
                    type="button"
                    style={{ gridTemplateColumns: "64px 1fr" }}
                    onClick={() => {
                      remember(q.trim());
                      setSourceScreen("search");
                      router.push(`/products/${p.id}`);
                    }}
                  >
                    <Thumb src={p.image} alt={p.name} />
                    <div>
                      <h3>{highlight(p.name, q.trim())}</h3>
                      <p>{formatVolumePrice(p.volume, p.price)}</p>
                    </div>
                  </button>
                ))}
              </div>
              {hits.length > 0 ? (
                <div style={{ padding: 16 }}>
                  <button className="btn-primary" type="button" onClick={() => router.push("/ranking")}>
                    내 맞춤 랭킹 보러가기
                  </button>
                </div>
              ) : null}
              {q.trim() ? (
                <div style={{ padding: "0 16px 16px" }}>
                  {PRODUCTS.filter((p) => fold(p.name).includes(fold(q))).slice(0, 6).map((p) => (
                    <button key={p.id} type="button" className="menu-row" onClick={() => setQ(p.name)}>
                      {highlight(p.name, q.trim())}
                    </button>
                  ))}
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </PhoneShell>
  );
}

function RecentBlock({
  recent,
  showEmpty,
  onPick,
  onClear,
  onRemove,
}: {
  recent: string[];
  showEmpty: boolean;
  onPick: (term: string) => void;
  onClear: () => void;
  onRemove: (term: string) => void;
}) {
  if (!showEmpty && recent.length === 0) return null;
  return (
    <div className="recent-block">
      <div className="section-label" style={{ display: "flex", justifyContent: "space-between" }}>
        최근 검색어
        {recent.length ? (
          <button className="accent" type="button" onClick={onClear}>
            전체 삭제
          </button>
        ) : null}
      </div>
      {recent.length === 0 ? (
        <p className="search-none">최근 검색어가 없습니다</p>
      ) : (
        recent.map((term) => (
          <div key={term} className="menu-row">
            <button type="button" className="menu-left" onClick={() => onPick(term)}>
              <IconClock />
              {term}
            </button>
            <button type="button" onClick={() => onRemove(term)} aria-label="삭제">
              <IconClose />
            </button>
          </div>
        ))
      )}
    </div>
  );
}

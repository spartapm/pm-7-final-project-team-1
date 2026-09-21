"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PhoneShell } from "@/components/ui";
import { IconBack, IconCircleX, IconClock, IconClose, IconSearchSm, IconSearchX } from "@/components/icons";
import { RankRow } from "@/components/rank-row";
import { useStore } from "@/lib/store";
import { PRODUCTS } from "@/lib/products";

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

  const suggestions = useMemo(() => {
    const query = fold(q);
    if (!query) return [];
    const names: string[] = [];
    for (const p of PRODUCTS) {
      if (fold(p.name).includes(query) && !names.includes(p.name)) names.push(p.name);
      if (names.length >= 8) break;
    }
    return names;
  }, [q]);

  const preview = hits.slice(0, 3);

  const remember = (term: string) => {
    const nextTerm = term.trim();
    if (!nextTerm) return;
    setRecent((prev) => {
      const next = [nextTerm, ...prev.filter((x) => x !== nextTerm)].slice(0, 3);
      saveRecent(next);
      return next;
    });
  };

  useEffect(() => {
    const term = q.trim();
    if (!term || preview.length === 0) return;
    const t = window.setTimeout(() => remember(term), 400);
    return () => window.clearTimeout(t);
  }, [q, preview.length]);

  const searching = Boolean(q.trim());

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
              <IconCircleX />
            </button>
          </div>
        </div>
        <div className="page-scroll bleed">
          <RecentBlock
            recent={recent}
            showEmpty={!searching}
            onPick={(term) => {
              remember(term);
              setQ(term);
            }}
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
          {searching && suggestions.length ? (
            <ul className="search-suggest">
              {suggestions.map((name) => (
                <li key={name}>
                  <button type="button" onClick={() => {
                    remember(name);
                    setQ(name);
                  }}>
                    <Highlight text={name} query={q} />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          {searching ? (
            <>
              {suggestions.length && preview.length ? <hr className="search-split" /> : null}
              {preview.length ? (
                <div className="search-products">
                  <h2>제품</h2>
                  <div className="rank-list">
                    {preview.map((p) => (
                      <RankRow
                        key={p.id}
                        product={p}
                        source="search"
                        onOpen={() => remember(q.trim())}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="search-empty">
                  <div className="icon-wrap">
                    <IconSearchX />
                  </div>
                  <h2>일치하는 제품이 없어요</h2>
                  <p>검색어를 바꾸거나 다른 제품을 찾아보세요</p>
                </div>
              )}
            </>
          ) : null}
        </div>
        {searching && preview.length ? (
          <div className="search-cta">
            <button className="btn-primary" type="button" onClick={() => router.push("/ranking")}>
              내 맞춤 랭킹 보러가기
            </button>
          </div>
        ) : null}
      </div>
    </PhoneShell>
  );
}

function Highlight({ text, query }: { text: string; query: string }) {
  const needle = query.trim();
  if (!needle) return text;
  const idx = text.toLowerCase().indexOf(needle.toLowerCase());
  if (idx < 0) return text;
  return (
    <>
      {text.slice(0, idx)}
      <em>{text.slice(idx, idx + needle.length)}</em>
      {text.slice(idx + needle.length)}
    </>
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
  if (!showEmpty) return null;
  return (
    <div className="recent-block">
      <div className="recent-head">
        <span>최근 검색어</span>
        {recent.length ? (
          <button className="recent-clear-all" type="button" onClick={onClear}>
            전체 삭제
          </button>
        ) : null}
      </div>
      {recent.length === 0 ? (
        <p className="search-none">최근 검색어가 없습니다</p>
      ) : (
        <ul className="recent-list">
          {recent.map((term) => (
            <li key={term} className="recent-row">
              <button type="button" className="recent-term" onClick={() => onPick(term)}>
                <IconClock />
                {term}
              </button>
              <button type="button" className="recent-remove" onClick={() => onRemove(term)} aria-label="삭제">
                <IconClose />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

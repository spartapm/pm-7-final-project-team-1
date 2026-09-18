"use client";

import { useParams, useRouter } from "next/navigation";
import { PhoneShell } from "@/components/ui";
import { IconBack } from "@/components/icons";
import { TERM_PAGES, type TermId } from "@/lib/terms";

export default function TermPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const page = TERM_PAGES[id as TermId];
  if (!page) return <PhoneShell />;

  return (
    <PhoneShell>
      <div className="page">
        <div className="topbar">
          <button className="side" type="button" onClick={() => router.back()} aria-label="뒤로">
            <IconBack />
          </button>
          <h1>{page.title}</h1>
          <span />
        </div>
        <div className="page-scroll">
          {page.blocks.map((b, i) => (
            <div key={i} style={{ marginBottom: 18 }}>
              {b.heading ? <h2 style={{ fontSize: 15, margin: "0 0 8px" }}>{b.heading}</h2> : null}
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: "var(--muted)", whiteSpace: "pre-wrap" }}>{b.body}</p>
            </div>
          ))}
          <button
            className="btn-primary"
            type="button"
            onClick={() => router.replace(`/login?terms=1&checked=${id}`)}
          >
            확인
          </button>
        </div>
      </div>
    </PhoneShell>
  );
}

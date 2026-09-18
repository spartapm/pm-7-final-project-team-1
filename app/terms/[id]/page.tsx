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
        <div className="term-page">
          <button className="term-back" type="button" onClick={() => router.back()} aria-label="뒤로">
            <IconBack />
          </button>
          <h1 className="term-title">{page.title}</h1>
          <div className="term-body">
            {page.blocks.map((b, i) => (
              <div key={i} className="term-block">
                {b.heading ? <h2>{b.heading}</h2> : null}
                <p>{b.body}</p>
              </div>
            ))}
          </div>
          <div className="term-cta">
            <button
              className="btn-primary"
              type="button"
              onClick={() => router.replace(`/login?terms=1&checked=${id}`)}
            >
              확인
            </button>
          </div>
        </div>
      </div>
    </PhoneShell>
  );
}

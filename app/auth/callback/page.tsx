"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PhoneShell } from "@/components/ui";
import { useStore } from "@/lib/store";

function CallbackInner() {
  const router = useRouter();
  const q = useSearchParams();
  const { hydrated, finishOAuth } = useStore();
  const started = useRef(false);

  useEffect(() => {
    if (!hydrated || started.current) return;
    started.current = true;
    const ticket = q.get("ticket") ?? "";
    void finishOAuth(ticket).then((next) => router.replace(next));
  }, [hydrated, finishOAuth, q, router]);

  return (
    <PhoneShell>
      <div className="page" style={{ display: "grid", placeItems: "center" }}>
        <p style={{ color: "var(--muted)", fontSize: 14 }}>로그인하고 있어요</p>
      </div>
    </PhoneShell>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <PhoneShell>
          <div className="page" style={{ display: "grid", placeItems: "center" }}>
            <p style={{ color: "var(--muted)", fontSize: 14 }}>로그인하고 있어요</p>
          </div>
        </PhoneShell>
      }
    >
      <CallbackInner />
    </Suspense>
  );
}

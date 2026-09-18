"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { VionLogo } from "@/components/icons";
import { PhoneShell } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function SplashPage() {
  const router = useRouter();
  const { hydrated, account } = useStore();

  useEffect(() => {
    if (!hydrated) return;
    const t = window.setTimeout(() => {
      router.replace(account ? "/home" : "/login");
    }, 1500);
    return () => window.clearTimeout(t);
  }, [hydrated, account, router]);

  return (
    <PhoneShell splash>
      <div className="splash">
        <VionLogo variant="white" className="logo" />
      </div>
    </PhoneShell>
  );
}

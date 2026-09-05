"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { LogoMark } from "@/components/icons";
import { PhoneShell } from "@/components/ui";

export default function SplashPage() {
  const router = useRouter();
  const { hydrated, account } = useStore();

  useEffect(() => {
    if (!hydrated) return;
    const t = window.setTimeout(() => {
      if (account?.onboardingDone) router.replace("/home");
      else if (account) router.replace("/onboarding");
      else router.replace("/login");
    }, 1500);
    return () => window.clearTimeout(t);
  }, [hydrated, account, router]);

  return (
    <PhoneShell splash>
      <div className="splash">
        <LogoMark className="logo" color="#C85C78" />
        <h1>ONE & BEAUTY</h1>
        <p>ONE & MATCH, YOUR BEAUTY</p>
      </div>
    </PhoneShell>
  );
}

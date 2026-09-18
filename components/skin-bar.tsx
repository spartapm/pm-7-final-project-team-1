"use client";

import { useRouter } from "next/navigation";
import { concernShort } from "@/lib/badges";
import type { SkinConcern, SkinType } from "@/lib/types";

export function SkinBar({
  skinType,
  concerns,
}: {
  skinType: SkinType;
  concerns: SkinConcern[];
}) {
  const router = useRouter();
  return (
    <div className="skin-bar">
      <div>
        <strong>{skinType} 타입</strong>
        <span>{concerns.map(concernShort).join(", ")}</span>
      </div>
      <button className="redo" type="button" onClick={() => router.push("/onboarding?edit=1")}>
        다시 진단 ›
      </button>
    </div>
  );
}

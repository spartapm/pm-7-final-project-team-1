"use client";

import { StoreProvider } from "@/lib/store";
import { ToastHost } from "@/components/ui";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      {children}
      <ToastHost />
    </StoreProvider>
  );
}

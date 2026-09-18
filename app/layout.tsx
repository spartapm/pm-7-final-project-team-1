import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { GaScript } from "@/components/ga";

export const metadata: Metadata = {
  title: "VION",
  description: "피부 타입과 고민에 맞춘 개인화 스킨케어 랭킹",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#f8845f",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css"
        />
        <link rel="icon" href="/favicon.svg" />
      </head>
      <body>
        <GaScript />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

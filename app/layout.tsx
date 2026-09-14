import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { GtmNoscript, GtmScript } from "@/components/gtm";

export const metadata: Metadata = {
  title: "ONE&BEAUTY",
  description: "피부 타입과 고민에 맞춘 개인화 스킨케어 랭킹",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#fdf2f4",
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
        <GtmNoscript />
        <GtmScript />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

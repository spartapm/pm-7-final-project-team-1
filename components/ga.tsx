import Script from "next/script";
import { GA4_MEASUREMENT_ID } from "@/lib/analytics";

export function GaScript() {
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`} strategy="afterInteractive" />
      <Script id="ga4" strategy="afterInteractive">{`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', '${GA4_MEASUREMENT_ID}');
`}</Script>
    </>
  );
}

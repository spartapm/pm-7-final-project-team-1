export const KAKAO_JS_KEY = "5b952668ebf4ed1f28ceea8da6246f73";

declare global {
  interface Window {
    Kakao?: {
      isInitialized: () => boolean;
      init: (key: string) => void;
      Share: { sendDefault: (opts: unknown) => void };
    };
  }
}

export async function shareKakao(opts: { title: string; image: string; url: string }) {
  if (!window.Kakao) {
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js";
      s.onload = () => resolve();
      s.onerror = () => reject();
      document.head.appendChild(s);
    });
  }
  if (!window.Kakao) throw new Error("kakao");
  if (!window.Kakao.isInitialized()) window.Kakao.init(KAKAO_JS_KEY);
  window.Kakao.Share.sendDefault({
    objectType: "feed",
    content: {
      title: opts.title,
      imageUrl: opts.image,
      link: { mobileWebUrl: opts.url, webUrl: opts.url },
    },
  });
}

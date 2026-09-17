# ONE&BEAUTY — 1조

피부 타입·고민 기반 개인화 스킨케어 랭킹. 계정·리뷰·찜·장바구니는 Supabase에 저장됩니다.

## 로컬 실행

`npm install && npm run dev`

브라우저에서 http://localhost:3000  
화면은 390px 폭 + 레터박스입니다. Supabase·GA4·카카오/구글 값은 코드에 들어 있어 `.env.local`이 필요 없습니다.

## 최초 1회: Supabase SQL

대시보드 → **SQL Editor**에 `supabase/schema.sql` 전체를 붙여 실행합니다.

그리고 **Authentication → Providers → Email**에서 **Confirm email**을 끕니다. 켜져 있으면 가입 세션이 안 나옵니다.

## 플로우

앱 진입(1.5초 스플래시) → 카카오/구글 시작 → 약관 동의 → 피부 프로필 → 맞춤 랭킹 → 상세/리뷰/찜/장바구니/마이페이지

- 닉네임은 서버에서 `beautyuser1001`부터 순차 발급됩니다.
- 리뷰·찜·장바구니·최근 본 제품·피부 프로필은 계정에 묶여 서버에 저장됩니다.
- 탈퇴 시 계정은 삭제되고, 리뷰는 “탈퇴한 회원의 리뷰 입니다”로 남습니다.
- 장바구니 주문/결제·바로 구매는 명세상 비활성입니다.
- 카카오/구글 로그인은 실제 OAuth 창을 엽니다.

## Vercel

환경변수는 넣지 않아도 됩니다. **넣지 말 것:** DB password, Direct connection string.

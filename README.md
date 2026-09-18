# VION — 1조

피부 타입·고민·나이 기반 개인화 스킨케어 랭킹. 계정·리뷰·찜·장바구니는 Supabase에 저장됩니다.

## 로컬 실행

Cursor **Terminal → Run Task**에서 `dev: 1조 …`를 고릅니다. (기본 `npm run dev`는 3000 포트가 겹칩니다.)

브라우저에서 http://localhost:3001  
화면은 390px 폭 + 레터박스입니다. Supabase·GA4·카카오/구글 값은 코드에 들어 있어 `.env.local`이 필요 없습니다.

## 최초 1회: Supabase SQL

대시보드 → **SQL Editor**에 `supabase/schema.sql` 전체를 붙여 실행합니다. 2차 컬럼(gender, birth_year, tags)이 포함됩니다.

그리고 **Authentication → Providers → Email**에서 **Confirm email**을 끕니다.

## 플로우

앱 진입(1.5초 스플래시) → 카카오/구글 시작 → 약관 동의 → 닉네임 → 피부 진단 → 홈/맞춤 랭킹 → 상세/리뷰/찜/장바구니/마이페이지

- 닉네임은 `형용사+동물+숫자`로 자동 발급되고, 직접 바꿀 수 있습니다.
- 랭킹은 종합 / 고민 / 타입 / 나이대 규칙서 기준으로 계산합니다.
- 리뷰 사진은 이후 URL이 오면 붙입니다.
- 장바구니 주문/결제·바로 구매는 명세상 비활성입니다.

## Vercel

환경변수는 넣지 않아도 됩니다. **넣지 말 것:** DB password, Direct connection string.

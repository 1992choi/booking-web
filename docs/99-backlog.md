# 99. Backlog

프론트엔드 구조 개선 및 기능 추가 후보 (백엔드 작업과 무관, 우선순위순).

## 1. React Query 전체 페이지 전환

`providers.tsx`에 QueryClientProvider가 이미 세팅되어 있고 일부 페이지(4곳)만 `useQuery`/`useMutation`을 쓰고 있다. 나머지 10개 라우트는 `useState`/`useEffect`로 로딩·에러·페이지네이션을 직접 구현 중 — React Query로 옮기면 캐싱/리페치/무효화를 얻고 중복 보일러플레이트를 제거할 수 있다.

**대상 예시**: `my/reservations`, `my/notifications`, `merchant/[id]/reservations`, `merchant/[id]/stats` 등 `useEffect` 기반 fetch가 남아있는 페이지.

## 2. 라우트별 페이지 타이틀(title) 설정

`layout.tsx`에 `export const metadata`로 "Bookit" 하나만 고정되어 있고, `src/app` 하위 `page.tsx` 17개가 전부 `'use client'`라 Next.js의 `export const metadata`/`generateMetadata`를 라우트별로 쓸 수 없다. 그 결과 로그인, 내 예약, 업체 상세 등 어느 페이지를 열어도 브라우저 탭/북마크에 "Bookit"만 표시되어 여러 탭을 오가며 작업할 때 구분이 안 된다.

**방향**: 클라이언트 컴포넌트에서도 쓸 수 있는 `useDocumentTitle(title)` 훅(`document.title` 설정, `src/lib/hooks/useEscapeKey.ts`와 같은 위치에 배치)을 만들어 각 페이지 최상단에서 호출하는 방식이 서버 컴포넌트로 감싸는 것보다 변경 범위가 작다.

## 3. `axios.ts`의 `require()` 제거

`src/lib/api/axios.ts`의 요청/응답 인터셉터 4곳에서 순환 참조를 피하려고 `require('@/lib/store/auth')` / `require('@/lib/api/auth')`를 쓰고 있다. `next lint` 실행 시 `@typescript-eslint/no-require-imports` 에러가 4건 나는 상태로 이미 고정돼 있어(현재 lint 통과 자체가 안 됨), CI에 lint 게이트를 걸면 바로 걸린다.

**방향**: 토큰 접근 로직을 별도 모듈(예: `lib/auth/token.ts`)로 분리해 `axios.ts`와 `store/auth.ts`가 서로를 직접 참조하지 않게 하거나, 최소한 동적 `import()`로 바꿔 lint 에러부터 없앤다.

## 4. 모달 공용 컴포넌트 추출

`merchant/[id]/page.tsx`와 `owners/[id]/page.tsx`에 `fixed inset-0` 오버레이 + `role="dialog"` + `aria-modal` + ESC 닫기 + 닫기 버튼을 쓰는 모달이 총 6개 있는데, 각 모달마다 동일한 셸(오버레이 배경, 바깥 클릭 닫기, 헤더+닫기 버튼 레이아웃)을 반복 작성하고 있다. 새 모달을 추가할 때마다 이 셸과 접근성 속성을 다시 손으로 맞춰야 해서 하나씩 놓치기 쉽다.

**방향**: `<Modal onClose title>children</Modal>` 형태의 공용 컴포넌트로 셸+접근성 처리를 한 곳에 모으고, 각 모달은 내부 폼/리스트만 채우도록 정리.

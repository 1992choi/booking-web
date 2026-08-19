# 99. Backlog

프론트엔드 구조 개선 및 기능 추가 후보 (백엔드 작업과 무관, 우선순위순).

## 1. next.config.ts API 프록시 호스트 하드코딩 정리

`next.config.ts`의 `rewrites()`에 백엔드 마이크로서비스 8개(8080~8084 포트)의 프록시 대상이 전부 `http://localhost:PORT`로 하드코딩돼 있다. 저장소에 `.env` 파일이 하나도 없어서 이 값을 바꿀 방법이 없고, 로컬 개발 환경을 벗어나는 순간(스테이징·프로덕션 빌드) rewrite가 그대로 잘못된 주소로 요청을 보내게 된다.

**방향**: 서비스별 호스트를 `.env`의 서버 전용 환경변수로 빼서 `next.config.ts`가 `process.env`에서 읽어오게 하고, 필요한 변수 목록을 알 수 있도록 `.env.example`을 추가.

## 2. React Query 전체 페이지 전환

`providers.tsx`에 QueryClientProvider가 이미 세팅되어 있고 일부 페이지(4곳)만 `useQuery`/`useMutation`을 쓰고 있다. 나머지 10개 라우트는 `useState`/`useEffect`로 로딩·에러·페이지네이션을 직접 구현 중 — React Query로 옮기면 캐싱/리페치/무효화를 얻고 중복 보일러플레이트를 제거할 수 있다.

**대상 예시**: `my/reservations`, `my/notifications`, `merchant/[id]/reservations`, `merchant/[id]/stats` 등 `useEffect` 기반 fetch가 남아있는 페이지.

## 3. merchant/[id]/page.tsx 모달 컴포넌트 파일 분리

`merchant/[id]/page.tsx`가 741줄로, 리소스/이용시간 관련 모달 5개(`ResourceFormModal`, `DeleteConfirmModal`, `AvailableTimeFormModal`, `AvailableTimeDeleteModal`, `AvailableTimeManagerModal`)가 전부 한 파일에 인라인으로 정의돼 있다. 공용 `Modal` 셸을 뽑아낸 지금은 각 모달에 폼/리스트 콘텐츠만 남아 있어 분리하기 쉬워졌다.

**방향**: `merchant/[id]/_components/` 아래로 모달들을 파일별로 옮기고, 페이지 컴포넌트는 상태 관리와 조합만 담당하도록 정리.

## 4. 미들웨어에서 JWT 만료(exp) 검증 추가

`middleware.ts`가 쿠키의 JWT를 `atob`로 디코드해 role만 확인하고 `exp` 클레임은 보지 않는다. `access-token` 쿠키는 만료 시각이 없는 세션 쿠키라 액세스 토큰 자체가 만료된 뒤에도 브라우저 탭을 닫기 전까진 남아있고, 그동안 미들웨어는 protected 라우트를 그대로 통과시킨다. 실제 만료 처리는 이후 API 호출에서 axios 인터셉터가 401을 받아야 시작돼, 그 사이 잠깐 만료된 상태로 화면이 그려질 수 있다.

**방향**: 디코드한 payload의 `exp`가 현재 시각보다 지났으면 다른 만료 케이스와 동일하게 `/login`으로 리다이렉트.

## 5. 미사용 변수·lint 경고 정리

`next lint` 실행 시 에러 3건 + 경고 1건이 남아있다: `merchant/[id]/reservations/page.tsx`와 `my/reservations/[id]/page.tsx`에서 쓰지 않는 `router` 변수, `merchant/[id]/page.tsx`의 미사용 `MerchantType` import와 이스케이프하지 않은 `"` 2곳, `AvailableTimeManagerModal`의 `useEffect` 의존성 누락 경고.

**방향**: 각 항목을 개별로 정리해 `next lint`를 에러 0건으로 만들면, 이후 CI에 lint 게이트를 걸어도 바로 걸리지 않는다.

## 6. 홈 카테고리 아이콘 next/image 전환

`src/app/page.tsx`의 카테고리 탭 아이콘이 `eslint-disable-next-line @next/next/no-img-element`로 규칙을 끄고 `<img>` 태그를 직접 쓰고 있다. 고정 크기 아이콘 4개뿐이라 `next/image`로 바꾸면 자동 포맷 변환·lazy loading 같은 최적화를 별다른 비용 없이 얻을 수 있다.

**방향**: `<img>`를 `next/image`의 `<Image width height>`로 교체하고 eslint-disable 주석 제거.

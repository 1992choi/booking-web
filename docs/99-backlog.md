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

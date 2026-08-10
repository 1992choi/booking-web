# 99. Backlog

프론트엔드 구조 개선 및 기능 추가 후보 (백엔드 작업과 무관, 우선순위순).

## 1. React Query 전체 페이지 전환

`providers.tsx`에 QueryClientProvider가 이미 세팅되어 있고 일부 페이지(4곳)만 `useQuery`/`useMutation`을 쓰고 있다. 나머지 10개 라우트는 `useState`/`useEffect`로 로딩·에러·페이지네이션을 직접 구현 중 — React Query로 옮기면 캐싱/리페치/무효화를 얻고 중복 보일러플레이트를 제거할 수 있다.

**대상 예시**: `my/reservations`, `my/notifications`, `merchant/[id]/reservations`, `merchant/[id]/stats` 등 `useEffect` 기반 fetch가 남아있는 페이지.

## 2. 접근성(a11y) 개선

repo 전체에서 `aria-*` 속성 사용이 1건뿐. 폼과 캘린더가 많은 예약 서비스 특성상 스크린 리더/키보드 내비게이션 지원이 거의 없는 상태.

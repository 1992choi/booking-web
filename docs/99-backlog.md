# 99. Backlog

프론트엔드 구조 개선 및 기능 추가 후보 (백엔드 작업과 무관, 우선순위순).

## 1. React Query 전체 페이지 전환

`providers.tsx`에 QueryClientProvider가 이미 세팅되어 있고 일부 페이지(4곳)만 `useQuery`/`useMutation`을 쓰고 있다. 나머지 10개 라우트는 `useState`/`useEffect`로 로딩·에러·페이지네이션을 직접 구현 중 — React Query로 옮기면 캐싱/리페치/무효화를 얻고 중복 보일러플레이트를 제거할 수 있다.

**대상 예시**: `my/reservations`, `my/notifications`, `merchant/[id]/reservations`, `merchant/[id]/stats` 등 `useEffect` 기반 fetch가 남아있는 페이지.

## 2. 모달 공용 컴포넌트 추출

`merchant/[id]/page.tsx`와 `owners/[id]/page.tsx`에 `fixed inset-0` 오버레이 + `role="dialog"` + `aria-modal` + ESC 닫기 + 닫기 버튼을 쓰는 모달이 총 6개 있는데, 각 모달마다 동일한 셸(오버레이 배경, 바깥 클릭 닫기, 헤더+닫기 버튼 레이아웃)을 반복 작성하고 있다. 새 모달을 추가할 때마다 이 셸과 접근성 속성을 다시 손으로 맞춰야 해서 하나씩 놓치기 쉽다.

**방향**: `<Modal onClose title>children</Modal>` 형태의 공용 컴포넌트로 셸+접근성 처리를 한 곳에 모으고, 각 모달은 내부 폼/리스트만 채우도록 정리.

# 99. Backlog

## 테스트코드 도입

### 배경

현재 테스트 코드가 전혀 없다 (테스트 러너 설정도 없음). 프론트 전체를 한 번에 커버하려 하면 난이도가 높으니, 렌더링이 필요 없는 순수 로직부터 단계적으로 넓혀간다.

### 단계별 계획

**1단계 — 순수 함수 유닛테스트**

- 대상: `src/lib/utils/format.ts` (`formatPrice`, `formatTime`, `formatDate`, `today`)
- React/DOM 렌더링 없이 입력 → 출력만 검증. 도구: Vitest.
- `parseDate`는 백엔드가 타임존 없이 내려주는 `LocalDateTime` 문자열을 보정하는 로직이라, 실수로 깨지기 쉬움 → 우선 고정.

**2단계 — zustand store 테스트**

- 대상: `src/lib/store/auth.ts`, `src/lib/store/toast.ts`
- `setAuth`/`clearAuth` 호출 시 상태 전이, 쿠키 세팅/삭제 여부 검증. 컴포넌트 렌더링 없이 store 함수 호출 + 상태 assertion으로 가능 (jsdom 환경 필요 — `document.cookie` 때문).

**3단계 — 단순 UI 컴포넌트 테스트**

- 대상: `src/components/ui/*` (`BackButton`, `Row` 등 로직이 적은 것부터)
- React Testing Library로 렌더링/클릭 등 상호작용 검증.

### 적용 대상 (우선순위)

| 단계 | 대상 | 상태 |
|------|------|------|
| 1 | `src/lib/utils/format.ts` | 완료 (Vitest 도입) |
| 2 | `src/lib/store/auth.ts`, `toast.ts` | 예정 |
| 3 | `src/components/ui/*` | 예정 |

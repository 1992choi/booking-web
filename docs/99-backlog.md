# 99. Backlog

프론트엔드 구조 개선 및 기능 추가 후보 (백엔드 작업과 무관, 우선순위순).

## 기술스택 학습 겸 개선

- React Server Components 전환 — 현재 `src/app`의 페이지 17개가 전부 `'use client'`. Next 16 App Router를 쓰면서 서버 컴포넌트를 하나도 안 씀. 홈 화면처럼 초기 데이터 패칭이 큰 화면 하나를 서버 컴포넌트로 바꾸고 인터랙션만 client leaf로 분리
- Cache Components(`"use cache"`) 적용 검토 — Next 16 신규 캐싱 모델(`node_modules/next/dist/docs/01-app/02-guides/migrating-to-cache-components.md`). RSC 전환과 함께 가면 자연스러움
- Intersection Observer 기반 무한 스크롤 — 홈/대시보드/통계 페이징이 전부 "더 보기" 버튼 수동 클릭(`fetchNextPage`)
- React 19 `useOptimistic` 적용 — 알림 읽음 처리(`src/app/my/notifications/page.tsx`)가 현재 `onSuccess` 캐시 갱신 패턴
- Playwright E2E 테스트 도입 — 현재 테스트는 vitest + RTL 컴포넌트/통합 테스트뿐, 로그인→탐색→예약 흐름을 실제 브라우저로 검증하는 E2E 없음

## 미구현 기능

- 동적 SEO 메타데이터 — 업체 상세(`/owners/[id]`) 등 공개 페이지가 전부 client component라 `generateMetadata` 못 씀(루트 레이아웃 고정 메타데이터뿐). RSC 전환과 묶으면 자연스럽게 해결

---

## AI 챗봇 UI (백엔드 신규 엔드포인트 필요)

백엔드에 챗봇 엔드포인트(`POST /api/v1/assistant/chat`, 백엔드 `docs/99-backlog.md`의 "AI 사용법 안내 챗봇 (LLM Gateway + 로컬/클라우드 모델)" 참고)를 추가하기로 하면서, 프론트에도 대화형 UI가 필요해졌다. 백엔드가 LiteLLM 게이트웨이 뒤에서 Claude(클라우드) 또는 로컬 Ollama 모델 중 하나로 응답하지만, 이 선택은 전부 백엔드/게이트웨이 내부 사정이라 **프론트 입장에서는 API 계약이 동일**하다(`{ message, history? }` → `{ reply }`) — 어느 모델이 응답했는지 프론트가 알 필요는 없음. 1단계(문서 기반 Q&A, stateless, non-streaming)에 맞춘 설계.

### 설계

- **전역 플로팅 위젯** — 알림 SSE 구독(`providers.tsx`)처럼 모든 로그인 화면에서 열어볼 수 있어야 하므로 루트 레이아웃 또는 `providers.tsx`에 마운트. 플로팅 버튼 + 슬라이드-인 패널(메시지 리스트 + 입력창) 형태로 시작 — `Modal.tsx`/`ToastContainer.tsx`의 오버레이·접근성 패턴 재사용
- `src/lib/api/assistant.ts` 신규 — `POST /assistant/chat` 호출 함수
- `src/lib/types/assistant.ts` 신규 — 요청/응답 타입(`{ message, history? }` / `{ reply }`)
- 상태 관리: 1단계는 서버에 대화 기록을 영속화하지 않으므로, 대화 메시지 목록은 위젯 컴포넌트 로컬 state로 충분(새로고침 시 초기화됨이 명확하면 Zustand까지는 불필요) — 매 요청에 현재까지의 턴들을 `history`로 함께 전송
- 응답은 1단계에서 blocking이므로 TanStack Query의 `useMutation`으로 처리, 응답 대기 중 로딩 스피너 표시(기존 패턴과 동일) — 로컬 모델 추론은 Claude보다 느릴 수 있어 타임아웃/로딩 메시지를 여유 있게 잡아둘 것
- 2단계에서 백엔드가 tool-use로 실데이터를 조회하게 되거나 스트리밍 응답으로 바뀌면, 그때 SSE/스트림 기반 UI로 교체 검토(`useNotificationStream.ts`의 `EventSource` 패턴 참고 가능)

### 미정 사항

- 비로그인 사용자에게도 노출할지(문서 기반 Q&A라 로그인 불필요할 수도 있음) — proxy.ts 라우트 보호 전략과 무관하게 전역 위젯이라 별도 판단 필요
- 모바일 레이아웃에서 플로팅 위젯 위치/크기

### 적용 대상

신규: `src/lib/api/assistant.ts`, `src/lib/types/assistant.ts`, `ChatWidget` 컴포넌트(위치 미정, 예: `src/components/ChatWidget.tsx`)

---

## 참고: 백엔드 의존적이라 이 목록에서 제외한 항목

아래는 코드/문서 조사 중 발견했지만 프론트엔드 단독으로는 처리할 수 없어(백엔드 API·스키마 변경 선행 필요) 이 백로그에는 올리지 않은 것들. 백엔드 쪽 백로그에서 다룰 사안:

- 업체(Merchant)에 주소·사진·설명 필드가 없어 홈/업체 상세 화면이 이니셜 아바타로만 표시됨
- 업체 검색/필터링 API 자체가 없음 (백엔드 `docs/99-backlog.md`에 Elasticsearch 검색이 이미 계획 항목으로 등록돼 있음)
- 업체 등록에 승인/심사 절차가 없어 MERCHANT 권한만 있으면 즉시 노출됨
- 알림에 채널별 수신 설정이 없음 (읽음 처리는 `PATCH /api/v1/notifications/{id}/read` 추가로 해결돼 프론트 연동 완료 — 이 항목에서 제외)
- 알림 전체 읽음 처리용 일괄 엔드포인트가 없음 — 현재 단건 `PATCH /notifications/{id}/read`만 있어 "모두 읽음"을 프론트에서 구현하려면 안읽은 개수만큼 반복 호출해야 함. 백엔드에 벌크 엔드포인트(예: `PATCH /notifications/read-all`) 추가 후 진행
- 리뷰에 사진 첨부 기능이 없음
- 리뷰에 별점(rating) 필드가 없어 텍스트만 저장됨 (`Review` 엔티티에 컬럼 추가 + 업체 평균 평점 집계 필요)

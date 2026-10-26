# 99. Backlog

프론트엔드 구조 개선 및 기능 추가 후보 (백엔드 작업과 무관, 우선순위순).

## 기술스택 학습 겸 개선

- React Server Components 전환 — 현재 `src/app`의 페이지 17개가 전부 `'use client'`. Next 16 App Router를 쓰면서 서버 컴포넌트를 하나도 안 씀. 홈 화면처럼 초기 데이터 패칭이 큰 화면 하나를 서버 컴포넌트로 바꾸고 인터랙션만 client leaf로 분리
- Cache Components(`"use cache"`) 적용 검토 — Next 16 신규 캐싱 모델(`node_modules/next/dist/docs/01-app/02-guides/migrating-to-cache-components.md`). RSC 전환과 함께 가면 자연스러움
- `cva` + `clsx` + `tailwind-merge` 실사용 — `package.json`에 설치만 돼 있고 미사용(`docs/01-overview.md`에 명시). `cn()` 유틸 추가 후 `MERCHANT_TYPE_COLORS` 같은 반복 variant 스타일을 `cva`로 정리
- 주요 화면 상태를 URL 쿼리 파라미터로 동기화 — 홈 카테고리 탭(`src/app/page.tsx`의 `selected`), `MonthNav`의 year/month, 예약 상태 필터 등이 `useState`뿐이라 새로고침/뒤로가기 시 유실됨
- Intersection Observer 기반 무한 스크롤 — 홈/대시보드/통계 페이징이 전부 "더 보기" 버튼 수동 클릭(`fetchNextPage`)
- React 19 `useOptimistic` 적용 — 알림 읽음 처리(`src/app/my/notifications/page.tsx`)가 현재 `onSuccess` 캐시 갱신 패턴
- Playwright E2E 테스트 도입 — 현재 테스트는 vitest + RTL 컴포넌트/통합 테스트뿐, 로그인→탐색→예약 흐름을 실제 브라우저로 검증하는 E2E 없음

## 미구현 기능

- 동적 SEO 메타데이터 — 업체 상세(`/owners/[id]`) 등 공개 페이지가 전부 client component라 `generateMetadata` 못 씀(루트 레이아웃 고정 메타데이터뿐). RSC 전환과 묶으면 자연스럽게 해결
- 홈 화면에서 이미 로드된 범위 내 업체 이름 클라이언트 필터링 — 전체 데이터셋 검색(Elasticsearch)은 백엔드 선행 필요하지만, 현재 로드된 페이지 안에서의 필터링은 프론트만으로 가능

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

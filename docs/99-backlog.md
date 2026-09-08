# 99. Backlog

프론트엔드 구조 개선 및 기능 추가 후보 (백엔드 작업과 무관, 우선순위순).

## 1. 업체별 예약 목록 페이지네이션 추가

`/merchant/{id}/reservations`가 `getMerchantReservations`를 페이지 파라미터 없이 호출해 기본값 `size=100`으로만 조회한다(`src/lib/api/merchantReservations.ts`). 예약이 100건을 넘는 업체는 더 보기 버튼이나 안내 없이 최신 100건 이후 데이터가 조용히 화면에서 사라진다. `my/reservations`가 이미 `useInfiniteQuery`로 같은 문제를 해결해 둔 상태라 동일한 패턴을 적용하면 된다.

**방향**: `merchant/[id]/reservations/page.tsx`의 `useQuery`를 `my/reservations/page.tsx`와 동일한 `useInfiniteQuery` + "더 보기" 버튼 패턴으로 교체.

## 2. 에러/빈 상태 메시지 공용 컴포넌트 추출

`text-sm text-red-400 text-center py-*` 형태의 에러 메시지가 22곳, `text-sm text-gray-400 text-center py-*` 형태의 빈 상태 안내가 13곳 페이지 전반에 반복돼 있다. 로딩 스켈레톤을 `Skeleton`/`SkeletonList`로 추출했던 것과 동일한 이유로, 별도 컴포넌트로 뽑아낼 가치가 있다.

**방향**: `src/components/ui/StatusMessage.tsx` 같은 이름으로 `<ErrorText>`/`<EmptyText>` 공용 컴포넌트를 만들고(padding을 prop으로 받아 py-4~py-20 편차 흡수), 각 페이지의 반복 마크업을 교체.

## 3. 월 네비게이션(연/월 상태) 중복 제거

`merchant/calendar/page.tsx`와 `merchant/[id]/stats/page.tsx`가 연/월 `useState` 2개, `prevMonth`/`nextMonth` 함수, "‹ {year}년 {month}월 ›" UI 마크업을 토씨 하나 안 틀리고 각자 구현하고 있다. 게다가 `stats` 페이지 쪽 버튼에는 `aria-label`이 빠져 있어 두 페이지 간 접근성 수준도 어긋나 있다(`calendar` 쪽만 "이전 달"/"다음 달" 라벨 존재).

**방향**: `useMonthNavigation()` 훅(연/월 state + prevMonth/nextMonth)과 `<MonthNav>` UI 컴포넌트로 추출해 두 페이지에서 재사용, 그 김에 `aria-label` 누락도 함께 고정.

## 4. merchant/calendar/page.tsx 컴포넌트 파일 분리

`merchant/calendar/page.tsx`가 260줄로 현재 가장 큰 페이지 파일이다. `EntryCard`가 인라인으로 정의돼 있고, 캘린더 그리드 렌더링도 페이지 컴포넌트 안에 그대로 있다. `merchant/[id]`·`owners/[id]`에 이미 적용한 `_components/` 분리 패턴을 여기에도 적용할 수 있다.

**방향**: `merchant/calendar/_components/`로 `EntryCard`와 캘린더 그리드(`CalendarGrid`)를 분리하고, 페이지 컴포넌트는 데이터 조회·상태·조합만 담당하도록 정리.

## 5. 전화번호 검증 zod 스키마 중복 제거

`src/lib/validation/auth.ts`(`signupSchema`)와 `src/lib/validation/merchant.ts`(`merchantSchema`)가 동일한 전화번호 정규식(`/^01[016-9]-?\d{3,4}-?\d{4}$/`)과 동일한 에러 메시지를 각각 따로 작성하고 있다. 정규식을 수정할 일이 생기면 둘 중 하나를 빠뜨리기 쉽다.

**방향**: `src/lib/validation/`에 공용 `phoneSchema`(또는 `phone()` 헬퍼 함수)를 만들어 두 스키마에서 재사용.

## 6. Tailwind CSS v4 마이그레이션 검토

현재 `tailwindcss@3.4.19`를 쓰고 있는데 v4가 나온 지 한참 됐고(설정을 `tailwind.config.ts`의 JS 객체 대신 CSS `@theme`로 옮기는 구조적 변화, Oxide 엔진으로 빌드 속도 대폭 개선), Next.js 16의 Turbopack 기본 전환과 궁합도 좋다. `flex-shrink-0` 같은 레거시 유틸리티 별칭이 13개 파일에서 쓰이고 있어(v4에서 `shrink-0`로 대체) 공식 codemod가 기계적 변경의 대부분을 처리해줄 것으로 보인다.

**방향**: 공식 업그레이드 codemod 실행 → `tailwind.config.ts` → CSS `@theme` 마이그레이션 → 전체 페이지 스타일 회귀 확인(스크린샷 비교 권장). Next.js 16 업그레이드와 마찬가지로 별도 브랜치에서 진행.

## 7. Zod v4 + @hookform/resolvers v5 업그레이드

`zod@3.25.76` / `@hookform/resolvers@3.10.0`을 쓰고 있는데 Zod v4가 나온 지 오래됐다. `resourceSchema`(`src/lib/validation/merchant.ts`)가 쓰는 `z.coerce.number({ invalid_type_error: '...' })` 같은 에러 커스터마이징 옵션이 v4에서 API가 바뀌었고, resolver도 zod v4 내부 구조에 맞는 v5로 함께 올려야 한다.

**방향**: 두 패키지를 함께 업그레이드하고, `src/lib/validation/*.ts`의 에러 메시지 옵션(`invalid_type_error`, `.email()` 등)을 v4 API로 교체 후 관련 폼 테스트(회원가입/로그인/업체 등록/리소스 등록) 전체 재검증. 항목 5(전화번호 스키마 통합)를 먼저 처리해두면 API 교체 지점이 한 곳으로 줄어든다.

## 8. React Compiler 도입 검토 (낮은 우선순위)

Next.js 16에서 React Compiler 지원이 정식(stable)으로 승격되어 `next.config.ts`에 `reactCompiler: true` 한 줄과 `babel-plugin-react-compiler` 설치만으로 자동 메모이제이션을 켤 수 있다. 다만 이 코드베이스는 현재 `useMemo`/`useCallback` 수동 사용이 전무해서 당장 얻을 이득은 크지 않다. 향후 리스트가 커지거나 렌더 비용이 문제되면 재검토.

**방향**: 빌드 시간 증가분(Babel 기반) 대비 실익이 있는지 작은 스파이크로 먼저 확인 후 도입 여부 결정.

---

## 참고: 백엔드 의존적이라 이 목록에서 제외한 항목

아래는 코드/문서 조사 중 발견했지만 프론트엔드 단독으로는 처리할 수 없어(백엔드 API·스키마 변경 선행 필요) 이 백로그에는 올리지 않은 것들. 백엔드 쪽 백로그에서 다룰 사안:

- 업체(Merchant)에 주소·사진·설명 필드가 없어 홈/업체 상세 화면이 이니셜 아바타로만 표시됨
- 업체 검색/필터링 API 자체가 없음 (백엔드 `docs/99-backlog.md`에 Elasticsearch 검색이 이미 계획 항목으로 등록돼 있음)
- 업체 등록에 승인/심사 절차가 없어 MERCHANT 권한만 있으면 즉시 노출됨
- 알림에 읽음 처리·채널별 수신 설정이 없음
- 리뷰에 사진 첨부 기능이 없음

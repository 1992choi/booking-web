# 99. Backlog

프론트엔드 구조 개선 및 기능 추가 후보 (백엔드 작업과 무관, 우선순위순).

## 1. Tailwind CSS v4 마이그레이션 검토

현재 `tailwindcss@3.4.19`를 쓰고 있는데 v4가 나온 지 한참 됐고(설정을 `tailwind.config.ts`의 JS 객체 대신 CSS `@theme`로 옮기는 구조적 변화, Oxide 엔진으로 빌드 속도 대폭 개선), Next.js 16의 Turbopack 기본 전환과 궁합도 좋다. `flex-shrink-0` 같은 레거시 유틸리티 별칭이 13개 파일에서 쓰이고 있어(v4에서 `shrink-0`로 대체) 공식 codemod가 기계적 변경의 대부분을 처리해줄 것으로 보인다.

**방향**: 공식 업그레이드 codemod 실행 → `tailwind.config.ts` → CSS `@theme` 마이그레이션 → 전체 페이지 스타일 회귀 확인(스크린샷 비교 권장). Next.js 16 업그레이드와 마찬가지로 별도 브랜치에서 진행.

## 2. Zod v4 + @hookform/resolvers v5 업그레이드

`zod@3.25.76` / `@hookform/resolvers@3.10.0`을 쓰고 있는데 Zod v4가 나온 지 오래됐다. `resourceSchema`(`src/lib/validation/merchant.ts`)가 쓰는 `z.coerce.number({ invalid_type_error: '...' })` 같은 에러 커스터마이징 옵션이 v4에서 API가 바뀌었고, resolver도 zod v4 내부 구조에 맞는 v5로 함께 올려야 한다.

**방향**: 두 패키지를 함께 업그레이드하고, `src/lib/validation/*.ts`의 에러 메시지 옵션(`invalid_type_error`, `.email()` 등)을 v4 API로 교체 후 관련 폼 테스트(회원가입/로그인/업체 등록/리소스 등록) 전체 재검증.

## 3. React Compiler 도입 검토 (낮은 우선순위)

Next.js 16에서 React Compiler 지원이 정식(stable)으로 승격되어 `next.config.ts`에 `reactCompiler: true` 한 줄과 `babel-plugin-react-compiler` 설치만으로 자동 메모이제이션을 켤 수 있다. 다만 이 코드베이스는 현재 `useMemo`/`useCallback` 수동 사용이 전무해서 당장 얻을 이득은 크지 않다. 향후 리스트가 커지거나 렌더 비용이 문제되면 재검토.

**방향**: 빌드 시간 증가분(Babel 기반) 대비 실익이 있는지 작은 스파이크로 먼저 확인 후 도입 여부 결정.

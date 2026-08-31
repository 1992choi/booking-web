# 99. Backlog

프론트엔드 구조 개선 및 기능 추가 후보 (백엔드 작업과 무관, 우선순위순).

## 1. CI 파이프라인 구축 (lint/test/build 자동화)

`.github/workflows`가 없어서 lint·테스트·빌드가 로컬 실행에만 의존한다. 예전에 완료한 "미사용 변수·lint 경고 정리" 항목도 "이후 CI에 lint 게이트를 걸어도 바로 걸리지 않는다"는 걸 목표로 했지만, 정작 그 게이트 자체가 아직 없다.

**방향**: PR/push 시 `npm run lint`, `npm test`, `npm run build`를 실행하는 GitHub Actions 워크플로 추가.

## 2. 로딩 스켈레톤 공용 컴포넌트 추출

`animate-pulse` 스켈레톤 블록이 13개 페이지에 24곳 반복돼 있다. 페이지마다 개수·높이만 다를 뿐 구조(`space-y-3` 컨테이너 + 반복되는 `rounded-2xl bg-gray-100 animate-pulse` div)는 동일하다.

**방향**: `<SkeletonList count height className />` 같은 공용 컴포넌트로 추출해 각 페이지의 로딩 블록을 교체.

## 3. middleware.ts 테스트 커버리지 추가

다른 모든 페이지·유틸에는 테스트가 있지만 `src/middleware.ts`(인증 여부, JWT `exp` 만료, role 기반 라우팅 분기)는 테스트가 없다. 로직이 단순하지 않고 보안과 직결되는 부분이라 회귀 위험이 크다.

**방향**: `NextRequest`를 목으로 구성해 미인증/만료 토큰/역할 불일치/정상 통과 케이스를 커버하는 `middleware.test.ts` 추가.

## 4. Next.js 16 메이저 업그레이드 검토

`npm audit fix`로 high severity 취약점 8건은 해결했지만, 남은 1건(postcss, next 내부 번들 의존성)은 `next@16`으로의 메이저 업그레이드가 필요하다. Next 15→16 breaking change 목록 확인 및 영향도 평가가 선행돼야 한다.

**방향**: Next.js 16 마이그레이션 가이드 검토 후 별도 브랜치에서 업그레이드·회귀 테스트, 문제 없으면 반영.

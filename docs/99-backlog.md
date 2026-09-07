# 99. Backlog

프론트엔드 구조 개선 및 기능 추가 후보 (백엔드 작업과 무관, 우선순위순).

## 1. middleware.ts 테스트 커버리지 추가

다른 모든 페이지·유틸에는 테스트가 있지만 `src/middleware.ts`(인증 여부, JWT `exp` 만료, role 기반 라우팅 분기)는 테스트가 없다. 로직이 단순하지 않고 보안과 직결되는 부분이라 회귀 위험이 크다.

**방향**: `NextRequest`를 목으로 구성해 미인증/만료 토큰/역할 불일치/정상 통과 케이스를 커버하는 `middleware.test.ts` 추가.

## 2. Next.js 16 메이저 업그레이드 검토

`npm audit fix`로 high severity 취약점 8건은 해결했지만, 남은 1건(postcss, next 내부 번들 의존성)은 `next@16`으로의 메이저 업그레이드가 필요하다. Next 15→16 breaking change 목록 확인 및 영향도 평가가 선행돼야 한다.

**방향**: Next.js 16 마이그레이션 가이드 검토 후 별도 브랜치에서 업그레이드·회귀 테스트, 문제 없으면 반영.

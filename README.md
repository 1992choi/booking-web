# booking-web

범용 예약 플랫폼 프론트엔드. [`booking`](../booking) 백엔드(MSA, Spring Boot)와 연동.

## 기술 스택

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS** + **shadcn/ui**
- **TanStack Query** (서버 상태), **Zustand** (클라이언트 상태)
- **Axios** (API 클라이언트), **React Hook Form + Zod** (폼)

---

## 프로젝트 설정 가이드

### 사전 준비

| 항목 | 권장 버전 | 확인 명령 |
|------|----------|----------|
| Node.js | 20.x 이상 | `node -v` |
| npm | 10.x 이상 | `npm -v` |

Node.js가 설치되어 있지 않다면 https://nodejs.org 에서 LTS 버전을 설치한다.

### 1. 패키지 설치

```bash
cd booking-web
npm install
```

최초 1회만 실행. 이후 `node_modules/` 폴더가 생성된다.

### 2. 환경 변수 설정 (선택)

백엔드 주소가 기본값(`localhost`)과 다를 경우에만 설정한다.
프로젝트 루트에 `.env.local` 파일을 생성한다.

```bash
# .env.local (기본값과 다를 때만 작성)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3333
```

기본값 그대로 사용한다면 이 파일은 없어도 된다.

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3333 접속.

> **백엔드 서버가 먼저 실행되어 있어야 API 호출이 가능합니다.**
> 백엔드 실행 방법은 [`../booking/README.md`](../booking/README.md) 참고.
>
> | 서비스 | 포트 |
> |--------|------|
> | api | 8080 |
> | reservation | 8081 |
> | payment | 8082 |
> | notification | 8083 |
> | review | 8084 |

### 4. 빌드 (배포용)

```bash
# 프로덕션 빌드
npm run build

# 빌드 결과물 실행
npm run start
```

### 5. 린트 검사

```bash
npm run lint
```

### 6. 테스트 실행

```bash
# 전체 테스트 1회 실행
npm test

# watch 모드 (파일 변경 시 자동 재실행)
npm run test:watch
```

테스트 러너로 [Vitest](https://vitest.dev)를 사용한다. 테스트 파일은 대상 파일과 같은 위치에 `*.test.ts`로 작성한다 (예: `src/lib/utils/format.ts` → `src/lib/utils/format.test.ts`).

---

## shadcn/ui 컴포넌트 추가 방법

개발 중 새로운 UI 컴포넌트가 필요할 때 아래 명령으로 추가한다.
(최초 1회 `npx shadcn@latest init` 초기화 필요)

```bash
# 초기화 (처음 한 번만)
npx shadcn@latest init

# 컴포넌트 개별 추가 예시
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add dialog
npx shadcn@latest add calendar
```

추가된 컴포넌트는 `src/components/ui/` 에 생성된다.

---

## 폴더 구조

```
src/
├── app/          # 페이지 (App Router)
├── components/   # UI 컴포넌트
└── lib/
    ├── api/      # API 호출 함수
    ├── store/    # Zustand 상태
    └── types/    # TypeScript 타입
```

---

## 문서

| 문서 | 내용 |
|------|------|
| [01-overview](docs/01-overview.md) | 프로젝트 개요, 기술 스택, 개발 순서 |
| [02-architecture](docs/02-architecture.md) | 폴더 구조, 라우트 보호, 상태 관리 전략 |
| [03-pages](docs/03-pages.md) | 페이지 목록, API 매핑, 에러 코드 |
| [04-api-client](docs/04-api-client.md) | Axios 설정, API 함수 목록, 타입 정의 |

백엔드 문서: [`../booking/docs/`](../booking/docs/)

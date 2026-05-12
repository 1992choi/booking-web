# 02. 아키텍처 & 폴더 구조

## 전체 구성

```
[브라우저 — localhost:3000]
        ↓
  [Next.js Dev Server]
        ↓ (next.config.ts rewrites 로 프록시)
  ┌─────────────────────────────────────────┐
  │  api        :8080  (인증, 업체, 리소스)  │
  │  reservation:8081  (예약)               │
  │  payment    :8082  (결제)               │
  │  notification:8083 (알림)               │
  └─────────────────────────────────────────┘
```

로컬 개발 시 `next.config.ts`의 rewrites 설정으로 백엔드 4개 서비스에 프록시한다.
CORS 문제 없이 모두 `localhost:3000/api/v1/...`로 호출 가능.

---

## 폴더 구조

```
booking-web/
├── src/
│   ├── app/                         # Next.js App Router (폴더 = 라우트)
│   │   ├── layout.tsx               # 루트 레이아웃 (공통 Provider 포함)
│   │   ├── page.tsx                 # 홈 (/)
│   │   ├── globals.css
│   │   │
│   │   ├── (auth)/                  # 인증 라우트 그룹 (헤더 없음)
│   │   │   ├── login/page.tsx       # /login
│   │   │   └── signup/page.tsx      # /signup
│   │   │
│   │   ├── (user)/                  # 일반 사용자 라우트 그룹
│   │   │   ├── layout.tsx           # 공통 헤더/푸터
│   │   │   ├── owners/
│   │   │   │   ├── page.tsx         # /owners (업체 목록)
│   │   │   │   └── [id]/page.tsx    # /owners/{id} (업체 상세)
│   │   │   ├── reservations/
│   │   │   │   ├── page.tsx         # /reservations (내 예약 목록)
│   │   │   │   └── [id]/page.tsx    # /reservations/{id} (예약 상세)
│   │   │   └── notifications/
│   │   │       └── page.tsx         # /notifications (내 알림)
│   │   │
│   │   ├── (owner)/                 # 업체 운영자 라우트 그룹 (role=OWNER)
│   │   │   ├── layout.tsx
│   │   │   └── owner/
│   │   │       ├── dashboard/page.tsx
│   │   │       └── resources/page.tsx
│   │   │
│   │   └── (admin)/                 # 관리자 라우트 그룹 (role=ADMIN)
│   │       ├── layout.tsx
│   │       └── admin/
│   │           ├── reservations/page.tsx
│   │           └── calendar/page.tsx
│   │
│   ├── components/
│   │   ├── ui/                      # shadcn/ui 기본 컴포넌트
│   │   ├── common/                  # 헤더, 푸터, 에러바운더리, 스켈레톤
│   │   ├── reservation/             # 예약 관련 컴포넌트
│   │   ├── owner/                   # 업체·리소스 관련 컴포넌트
│   │   └── admin/                   # 관리자 캘린더 등
│   │
│   ├── lib/
│   │   ├── api/                     # API 호출 함수 (서비스별 분리)
│   │   │   ├── axios.ts             # Axios 인스턴스 + JWT 인터셉터
│   │   │   ├── auth.ts              # 회원가입, 로그인
│   │   │   ├── owners.ts            # 업체 CRUD
│   │   │   ├── resources.ts         # 예약 대상, 가능시간
│   │   │   ├── reservations.ts      # 예약 CRUD
│   │   │   ├── payments.ts          # 결제 조회, 환불
│   │   │   └── notifications.ts     # 알림 조회
│   │   │
│   │   ├── store/
│   │   │   └── auth.ts              # Zustand: accessToken, user 정보
│   │   │
│   │   └── types/                   # 백엔드 DTO 기반 TypeScript 타입
│   │       ├── auth.ts
│   │       ├── owner.ts
│   │       ├── reservation.ts
│   │       ├── payment.ts
│   │       └── notification.ts
│   │
│   └── middleware.ts                 # 라우트 보호 (미인증 → /login 리디렉션)
│
├── docs/                             # 프론트엔드 문서
├── public/                           # 정적 파일
├── next.config.ts                    # Next.js 설정 (백엔드 프록시 포함)
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 라우트 보호 전략

`middleware.ts`에서 JWT 토큰 유무를 확인해 미인증 사용자를 `/login`으로 리디렉션한다.
role 기반 접근 제어는 각 페이지 컴포넌트 또는 layout.tsx에서 처리한다.

```
/login, /signup          → 누구나 접근 가능 (로그인 시 / 로 리디렉션)
/owners, /reservations   → 로그인 필수 (role=USER 이상)
/owner/**                → role=OWNER 필수
/admin/**                → role=ADMIN 필수
```

---

## 상태 관리 전략

| 상태 종류 | 도구 | 설명 |
|----------|------|------|
| 서버 데이터 (API 응답) | TanStack Query | 자동 캐싱, 로딩/에러 상태, 백그라운드 리페치 |
| 인증 상태 (토큰, 유저 정보) | Zustand | 페이지 간 공유, localStorage 동기화 |
| 폼 상태 | React Hook Form | 로컬 컴포넌트 내부 |
| UI 상태 (모달 열림 등) | React useState | 로컬 컴포넌트 내부 |

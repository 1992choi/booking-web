# 02. 아키텍처 & 폴더 구조

## 전체 구성

```
[브라우저 — localhost:3333]
        ↓
  [Next.js Dev Server]
        ↓ (next.config.ts rewrites 로 프록시)
  ┌───────────────────────────────────────────────────┐
  │  api        :8080  (인증, 회원, 관리자-회원)       │
  │  reservation:8081  (예약, 업체, 리소스, 관리자-예약)│
  │  payment    :8082  (결제)                          │
  │  notification:8083 (알림)                          │
  │  review     :8084  (리뷰)                          │
  └───────────────────────────────────────────────────┘
```

로컬 개발 시 `next.config.ts`의 rewrites 설정으로 백엔드 5개 서비스에 프록시한다.
CORS 문제 없이 모두 `localhost:3333/api/v1/...`로 호출 가능.

---

## 폴더 구조

```
booking-web/
├── src/
│   ├── app/                          # Next.js App Router (폴더 = 라우트)
│   │   ├── layout.tsx                # 루트 레이아웃 (공통 Provider 포함)
│   │   ├── page.tsx                  # 홈 (/)
│   │   ├── providers.tsx             # TanStack Query Provider
│   │   │
│   │   ├── (auth)/                   # 인증 라우트 그룹 (헤더 없음)
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx        # /login
│   │   │   └── signup/page.tsx       # /signup
│   │   │
│   │   ├── owners/
│   │   │   └── [id]/page.tsx         # /owners/{id} (업체 상세 + 예약)
│   │   │
│   │   ├── my/                       # 일반 사용자 마이페이지 (로그인 필수)
│   │   │   ├── page.tsx              # /my (내 정보)
│   │   │   ├── reservations/
│   │   │   │   ├── page.tsx          # /my/reservations (내 예약 목록)
│   │   │   │   └── [id]/page.tsx     # /my/reservations/{id} (예약 상세 + 결제)
│   │   │   └── notifications/
│   │   │       └── page.tsx          # /my/notifications (내 알림)
│   │   │
│   │   ├── merchant/                 # 업체 운영자 (role=MERCHANT 이상)
│   │   │   ├── register/page.tsx     # /merchant/register (업체 등록)
│   │   │   ├── dashboard/page.tsx    # /merchant/dashboard (내 업체 목록)
│   │   │   ├── calendar/page.tsx     # /merchant/calendar (예약 현황 캘린더)
│   │   │   └── [id]/
│   │   │       ├── page.tsx          # /merchant/{id} (업체 상세 관리)
│   │   │       ├── edit/page.tsx     # /merchant/{id}/edit (업체·리소스 수정)
│   │   │       ├── stats/page.tsx    # /merchant/{id}/stats (일별 매출 통계)
│   │   │       └── reservations/
│   │   │           └── page.tsx      # /merchant/{id}/reservations (업체별 예약 목록)
│   │   │
│   │   └── admin/                    # 관리자 (role=ADMIN)
│   │       └── users/
│   │           ├── page.tsx          # /admin/users (회원 목록/역할 필터)
│   │           └── [id]/
│   │               └── message/page.tsx # /admin/users/{id}/message (회원에게 메시지 발송)
│   │
│   ├── components/
│   │   ├── Header.tsx
│   │   └── ui/
│   │       ├── BackButton.tsx
│   │       ├── Row.tsx
│   │       └── ToastContainer.tsx
│   │
│   ├── lib/
│   │   ├── api/                      # API 호출 함수 (서비스별 분리)
│   │   │   ├── axios.ts              # Axios 인스턴스 + JWT 인터셉터
│   │   │   ├── auth.ts               # 회원가입, 로그인, 내 정보 조회, 회원 목록(ADMIN)
│   │   │   ├── merchants.ts          # 업체 CRUD, 예약 생성, 일별 매출 통계
│   │   │   ├── resources.ts          # 예약 대상 CRUD, 가능시간 CRUD
│   │   │   ├── reservations.ts       # 내 예약 조회/취소
│   │   │   ├── merchantReservations.ts # 업체별 예약 조회, 확정/취소
│   │   │   ├── adminReservations.ts  # 관리자 캘린더 조회
│   │   │   ├── payments.ts           # 결제 조회, 환불
│   │   │   ├── notifications.ts      # 알림 조회, 회원에게 메시지 발송(ADMIN)
│   │   │   └── reviews.ts            # 리뷰 조회/작성/수정/삭제
│   │   │
│   │   ├── store/
│   │   │   └── auth.ts               # Zustand: accessToken, user 정보
│   │   │
│   │   ├── utils/
│   │   │   └── format.ts             # 날짜/가격 포맷 헬퍼
│   │   │
│   │   └── types/                    # 백엔드 DTO 기반 TypeScript 타입
│   │       ├── auth.ts
│   │       ├── merchant.ts
│   │       ├── reservation.ts
│   │       ├── payment.ts
│   │       ├── notification.ts
│   │       ├── admin.ts
│   │       ├── review.ts
│   │       └── common.ts
│   │
│   └── middleware.ts                  # 라우트 보호 (미인증 → /login 리디렉션)
│
├── docs/                              # 프론트엔드 문서
├── public/                            # 정적 파일
├── next.config.ts                     # Next.js 설정 (백엔드 프록시 포함)
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 라우트 보호 전략

`middleware.ts`에서 JWT 토큰 유무 및 role을 확인한다.

```
/login, /signup          → 누구나 접근 가능
/owners/{id}             → 누구나 접근 가능
/my/**                   → 로그인 필수
/merchant/**             → role=MERCHANT 또는 ADMIN 필수
/admin/**                → role=ADMIN 필수
```

미인증 접근 시 `/login?redirect={pathname}`으로 리디렉션.
role 불충족 시 `/`로 리디렉션.

---

## 상태 관리 전략

| 상태 종류 | 도구 | 설명 |
|----------|------|------|
| 서버 데이터 (API 응답) | TanStack Query | 자동 캐싱, 로딩/에러 상태, 백그라운드 리페치 |
| 인증 상태 (토큰, 유저 정보) | Zustand | 페이지 간 공유, localStorage 동기화 |
| 폼 상태 | React Hook Form | 로컬 컴포넌트 내부 |
| UI 상태 (모달 열림 등) | React useState | 로컬 컴포넌트 내부 |
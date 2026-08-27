# 01. 프로젝트 개요

## 프로젝트 개요

`booking` 백엔드(MSA, Spring Boot)와 연동하는 범용 예약 플랫폼 프론트엔드.
Next.js App Router 기반. 테마/레이아웃만 교체해 숙박·강의·시설·상담 등 다양한 도메인에 적용 가능한 구조를 목표로 한다.

---

## 연동 백엔드

| 서비스 | 포트 | 역할 |
|--------|------|------|
| api | 8080 | 인증, 회원, 관리자(회원 조회·메시지 발송) |
| reservation | 8081 | 예약 생성/조회/취소, 업체(Merchant), 예약 대상(Resource), 관리자 예약 캘린더 |
| payment | 8082 | 결제 내역 조회, 환불 |
| notification | 8083 | 알림 이력 조회 |
| review | 8084 | 리뷰 조회/작성/수정/삭제 |

업체(Merchant)·예약 대상(Resource)·관리자 예약 도메인은 백엔드 아키텍처 재구성으로 `api` 서비스에서 `reservation` 서비스로 이관되었다.

---

## 기술 스택

| 분류 | 기술 | 버전 |
|------|------|------|
| 프레임워크 | Next.js (App Router) | 15.x |
| 언어 | TypeScript | 5.x |
| 스타일 | Tailwind CSS | 3.x |
| 서버 상태 | TanStack Query (React Query) | 5.x |
| 클라이언트 상태 | Zustand | 5.x |
| API 클라이언트 | Axios | 1.x |
| 폼 | React Hook Form + Zod | - |

> `shadcn/ui`, `date-fns`, `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`는 `package.json`에 설치는 돼 있지만 아직 실제 코드에서 사용되지 않는다 (`shadcn/ui`는 `components.json` 초기화도 아직 안 된 상태). 커스텀 UI 컴포넌트(`src/components/ui/`)와 `src/lib/utils/format.ts`로 각각의 역할을 대신하고 있다.

---

## 사용자 역할

백엔드 JWT 클레임의 `role` 필드 기준.

| role | 설명 | 접근 가능 화면 |
|------|------|---------------|
| USER | 일반 예약자 | 업체 탐색, 예약, 내 예약/결제/알림 |
| MERCHANT | 업체 운영자 | USER 화면 + 업체·리소스 등록/관리, 예약 현황 캘린더 |
| ADMIN | 관리자 | 전체 화면 접근 가능 |

---

## 참고: 예약 처리 흐름

예약 생성(`POST /reservations`) 시 결제까지 Kafka 이벤트(`reservation.created` → `payment.completed`)로 비동기 처리되며, 정상 처리 시 PENDING 상태가 잠시 후 자동으로 CONFIRMED로 전환된다. `/merchant/calendar`, `/merchant/{id}/reservations`의 수동 확정/취소 버튼은 이 자동 처리와 별개로 업체 운영자가 개입해야 하는 예외 상황(장애 재현 시나리오 등)을 위한 보조 수단이다.

동시성 처리는 Redis 분산락(Redisson) + DB 비관적 락으로 방어하고 있다. 그럼에도 발생하는 409(RSV_002)는 락 획득 대기 중 타임아웃된 정상적인 재시도 유도 응답이다.

장애 재현 시나리오(Kafka consumer lag, 서킷브레이커, 레이스 컨디션)는 백엔드 `docs/99-simulations.md` 참고.
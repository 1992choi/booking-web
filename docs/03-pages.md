# 03. 페이지 목록

> 마지막 업데이트: 백엔드 코드 재검토 반영

---

## 전체 엔드포인트 현황 (코드 기준)

### api 서비스 (8080)

| 메서드 | 경로 | 설명 | 이전 대비 |
|--------|------|------|----------|
| POST | `/api/v1/auth/signup` | 회원가입 | 동일 |
| POST | `/api/v1/auth/login` | 로그인 | 동일 |
| ~~POST~~ | ~~`/api/v1/auth/refresh`~~ | ~~토큰 갱신~~ | **여전히 미구현** |
| GET | `/api/v1/users/me` | 내 정보 조회 | **신규** |
| POST | `/api/v1/owners` | 업체 등록 | 동일 |
| GET | `/api/v1/owners` | 업체 목록 | 동일 |
| GET | `/api/v1/owners/{id}` | 업체 상세 | 동일 |
| GET | `/api/v1/owners/me` | 내 업체 조회 | **신규** |
| PUT | `/api/v1/owners/me` | 내 업체 수정 | **신규** |
| POST | `/api/v1/owners/{id}/resources` | 예약 대상 등록 | 동일 |
| PUT | `/api/v1/resources/{id}` | 예약 대상 수정 | **신규** |
| DELETE | `/api/v1/resources/{id}` | 예약 대상 삭제 | **신규** |
| POST | `/api/v1/resources/{id}/available-times` | 가능 시간 등록 | 동일 |
| GET | `/api/v1/resources/{id}/available-times?date=` | 가능 시간 조회 | 동일 |
| GET | `/api/v1/admin/reservations?date=&status=&page=&size=` | 전체 예약 조회 | **신규 (구현됨)** |
| GET | `/api/v1/admin/reservations/calendar?year=&month=` | 캘린더 뷰 | **신규 (구현됨)** |
| PUT | `/api/v1/admin/reservations/{id}/confirm` | 예약 수동 확정 | **신규 (구현됨)** |
| PUT | `/api/v1/admin/reservations/{id}/cancel` | 예약 수동 취소 | **신규 (구현됨)** |

### reservation 서비스 (8081)

| 메서드 | 경로 | 설명 | 비고 |
|--------|------|------|------|
| POST | `/api/v1/reservations` | 예약 생성 | 동일 |
| GET | `/api/v1/reservations/{id}` | 예약 상세 | 동일 |
| GET | `/api/v1/reservations/me?status=&page=&size=` | 내 예약 목록 | status 기본값 = PENDING |
| PUT | `/api/v1/reservations/{id}/cancel` | 예약 취소 | 동일 |

### payment 서비스 (8082)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/v1/payments/{reservationId}` | 결제 조회 |
| POST | `/api/v1/payments/{reservationId}/refund` | 환불 요청 |

### notification 서비스 (8083)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/v1/notifications/me` | 내 알림 목록 |

---

## 페이지 목록 및 개발 우선순위

### Phase 1 — 인증

| 페이지 | URL | 사용 API | 상태 |
|--------|-----|---------|------|
| 로그인 | `/login` | `POST /auth/login` | 🔲 |
| 회원가입 | `/signup` | `POST /auth/signup` | 🔲 |

### Phase 2 — 업체 탐색 → 예약 (핵심 사용자 흐름)

| 페이지 | URL | 사용 API | 상태 |
|--------|-----|---------|------|
| 업체 목록 | `/owners` | `GET /owners` | 🔲 |
| 업체 상세 + 예약 가능 시간 | `/owners/{id}` | `GET /owners/{id}`, `GET /resources/{id}/available-times?date=` | 🔲 |
| 예약 요청 (모달) | `/owners/{id}` 내부 | `POST /reservations` | 🔲 |

### Phase 3 — 마이페이지

| 페이지 | URL | 사용 API | 상태 |
|--------|-----|---------|------|
| 내 정보 | `/my` | `GET /users/me` | 🔲 |
| 내 예약 목록 | `/my/reservations` | `GET /reservations/me?status=` | 🔲 |
| 예약 상세 + 결제 | `/my/reservations/{id}` | `GET /reservations/{id}`, `GET /payments/{reservationId}` | 🔲 |
| 예약 취소 | (상세 화면 내) | `PUT /reservations/{id}/cancel` | 🔲 |
| 환불 요청 | (상세 화면 내) | `POST /payments/{reservationId}/refund` | 🔲 |
| 내 알림 | `/my/notifications` | `GET /notifications/me` | 🔲 |

### Phase 4 — 업체 운영자 (role=OWNER)

| 페이지 | URL | 사용 API | 상태 |
|--------|-----|---------|------|
| 업체 등록 | `/owner/register` | `POST /owners` | 🔲 |
| 내 업체 관리 | `/owner/dashboard` | `GET /owners/me`, `PUT /owners/me` | 🔲 |
| 예약 대상 등록 | `/owner/resources/new` | `POST /owners/{id}/resources` | 🔲 |
| 예약 대상 수정/삭제 | `/owner/resources/{id}` | `PUT /resources/{id}`, `DELETE /resources/{id}` | 🔲 |
| 가능 시간 등록 | `/owner/resources/{id}/times` | `POST /resources/{id}/available-times` | 🔲 |

### Phase 5 — 관리자 (role=ADMIN) — 백엔드 구현 완료 ✅

| 페이지 | URL | 사용 API | 상태 |
|--------|-----|---------|------|
| 전체 예약 현황 | `/admin/reservations` | `GET /admin/reservations?date=&status=` | 🔲 |
| 캘린더 뷰 | `/admin/calendar` | `GET /admin/reservations/calendar?year=&month=` | 🔲 |
| 예약 수동 확정/취소 | (캘린더 내 모달) | `PUT /admin/reservations/{id}/confirm`, `PUT /admin/reservations/{id}/cancel` | 🔲 |

---

## 에러 코드 → UI 메시지

| 코드 | HTTP | 메시지 |
|------|------|--------|
| RSV_001 | 409 | 이미 예약된 시간대입니다. 다른 시간을 선택해 주세요. |
| RSV_002 | 409 | 동시 요청이 많습니다. 잠시 후 다시 시도해 주세요. |
| RSV_003 | 422 | 최대 인원을 초과했습니다. |
| API_001 | 409 | 이미 사용 중인 이메일입니다. |
| API_002 | 401 | 이메일 또는 비밀번호가 올바르지 않습니다. |
| PAY_001 | 422 | 결제가 실패했습니다. 다시 시도해 주세요. |
| PAY_002 | 409 | 환불 가능한 상태가 아닙니다. |
| AUTH_001 | 401 | 로그인이 필요합니다. → /login 리디렉션 |
| AUTH_002 | 403 | 접근 권한이 없습니다. |

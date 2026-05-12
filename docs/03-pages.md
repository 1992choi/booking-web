# 03. 페이지 목록

## 인증

| 페이지 | URL | 백엔드 API | 상태 |
|--------|-----|-----------|------|
| 로그인 | `/login` | `POST /auth/login` | 🔲 |
| 회원가입 | `/signup` | `POST /auth/signup` | 🔲 |

---

## 일반 사용자

| 페이지 | URL | 백엔드 API | 상태 |
|--------|-----|-----------|------|
| 홈 | `/` | - | ✅ (껍데기) |
| 업체 목록 | `/owners` | `GET /owners` | 🔲 |
| 업체 상세 + 예약 가능 시간 | `/owners/{id}` | `GET /owners/{id}`, `GET /resources/{id}/available-times` | 🔲 |
| 예약 요청 (모달/폼) | `/owners/{id}` 내부 | `POST /reservations` | 🔲 |
| 내 예약 목록 | `/reservations` | `GET /reservations/me` | 🔲 |
| 예약 상세 + 결제 정보 | `/reservations/{id}` | `GET /reservations/{id}`, `GET /payments/{reservationId}` | 🔲 |
| 예약 취소 | `/reservations/{id}` 내부 | `PUT /reservations/{id}/cancel` | 🔲 |
| 환불 요청 | `/reservations/{id}` 내부 | `POST /payments/{reservationId}/refund` | 🔲 |
| 내 알림 목록 | `/notifications` | `GET /notifications/me` | 🔲 |

---

## 업체 운영자 (role=OWNER)

| 페이지 | URL | 백엔드 API | 상태 |
|--------|-----|-----------|------|
| 업체 등록 | `/owner/register` | `POST /owners` | 🔲 |
| 예약 대상 등록 | `/owner/resources/new` | `POST /owners/{id}/resources` | 🔲 |
| 가능 시간 등록 | `/owner/resources/{id}/times` | `POST /resources/{id}/available-times` | 🔲 |

---

## 관리자 (role=ADMIN) — 백엔드 미구현

| 페이지 | URL | 백엔드 API | 상태 |
|--------|-----|-----------|------|
| 전체 예약 현황 | `/admin/reservations` | `GET /admin/reservations` (미구현) | 🔲 |
| 캘린더 뷰 | `/admin/calendar` | `GET /admin/reservations/calendar` (미구현) | 🔲 |
| 예약 수동 확정 | `/admin/reservations/{id}` 내부 | `PUT /admin/reservations/{id}/confirm` (미구현) | 🔲 |
| 예약 수동 취소 | `/admin/reservations/{id}` 내부 | `PUT /admin/reservations/{id}/cancel` (미구현) | 🔲 |

---

## 주요 에러 코드 → UI 메시지

| 에러 코드 | HTTP | 화면 표시 메시지 |
|----------|------|----------------|
| RSV_001 | 409 | 이미 예약된 시간대입니다. 다른 시간을 선택해 주세요. |
| RSV_002 | 409 | 동시 요청이 많습니다. 잠시 후 다시 시도해 주세요. |
| RSV_003 | 422 | 최대 인원을 초과했습니다. |
| API_001 | 409 | 이미 사용 중인 이메일입니다. |
| API_002 | 401 | 이메일 또는 비밀번호가 올바르지 않습니다. |
| PAY_001 | 422 | 결제가 실패했습니다. 다시 시도해 주세요. |
| PAY_002 | 409 | 환불 가능한 상태가 아닙니다. |
| AUTH_001 | 401 | 로그인이 필요합니다. → /login 리디렉션 |
| AUTH_002 | 403 | 접근 권한이 없습니다. |

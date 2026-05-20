# 03. 페이지 목록

## API 엔드포인트 현황

### api 서비스 (8080)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/v1/auth/signup` | 회원가입 |
| POST | `/api/v1/auth/login` | 로그인 |
| GET | `/api/v1/users/me` | 내 정보 조회 |
| POST | `/api/v1/merchants` | 업체 등록 |
| GET | `/api/v1/merchants` | 전체 업체 목록 |
| GET | `/api/v1/merchants/me` | 내 업체 목록 |
| GET | `/api/v1/merchants/{id}` | 업체 상세 |
| PUT | `/api/v1/merchants/{id}` | 업체 수정 |
| GET | `/api/v1/merchants/{id}/reservations` | 업체별 예약 목록 |
| POST | `/api/v1/merchants/{id}/resources` | 예약 대상 등록 |
| PUT | `/api/v1/resources/{id}` | 예약 대상 수정 |
| DELETE | `/api/v1/resources/{id}` | 예약 대상 삭제 |
| GET | `/api/v1/resources/{id}/available-times?date=` | 가능 시간 조회 |
| POST | `/api/v1/resources/{id}/available-times` | 가능 시간 등록 |
| PUT | `/api/v1/available-times/{id}` | 가능 시간 수정 |
| DELETE | `/api/v1/available-times/{id}` | 가능 시간 삭제 |
| GET | `/api/v1/admin/reservations/calendar?year=&month=` | 예약 현황 캘린더 |
| PUT | `/api/v1/admin/reservations/{id}/confirm` | 예약 수동 확정 |
| PUT | `/api/v1/admin/reservations/{id}/cancel` | 예약 수동 취소 |

### reservation 서비스 (8081)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/v1/reservations` | 예약 생성 |
| GET | `/api/v1/reservations/{id}` | 예약 상세 |
| GET | `/api/v1/reservations/me?status=&page=&size=` | 내 예약 목록 |
| PUT | `/api/v1/reservations/{id}/cancel` | 예약 취소 |

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

## 페이지 목록

### 인증

| 페이지 | URL | 사용 API |
|--------|-----|---------|
| 로그인 | `/login` | `POST /auth/login`, `GET /users/me` |
| 회원가입 | `/signup` | `POST /auth/signup` |

### 업체 탐색 · 예약

| 페이지 | URL | 사용 API |
|--------|-----|---------|
| 업체 상세 + 예약 | `/owners/{id}` | `GET /merchants/{id}`, `GET /resources/{id}/available-times`, `POST /reservations` |

### 마이페이지

| 페이지 | URL | 사용 API |
|--------|-----|---------|
| 내 정보 | `/my` | `GET /users/me` |
| 내 예약 목록 | `/my/reservations` | `GET /reservations/me` |
| 예약 상세 + 결제 + 취소/환불 | `/my/reservations/{id}` | `GET /reservations/{id}`, `GET /payments/{id}`, `PUT /reservations/{id}/cancel`, `POST /payments/{id}/refund` |
| 내 알림 | `/my/notifications` | `GET /notifications/me` |

### 업체 운영자 (role=MERCHANT 이상)

| 페이지 | URL | 사용 API |
|--------|-----|---------|
| 업체 등록 | `/merchant/register` | `POST /merchants` |
| 내 업체 목록 | `/merchant/dashboard` | `GET /merchants/me` |
| 업체 상세 관리 | `/merchant/{id}` | `GET /merchants/{id}` |
| 업체·리소스 수정 | `/merchant/{id}/edit` | `PUT /merchants/{id}`, `POST /merchants/{id}/resources`, `PUT /resources/{id}`, `DELETE /resources/{id}`, `GET /resources/{id}/available-times`, `POST /resources/{id}/available-times`, `PUT /available-times/{id}`, `DELETE /available-times/{id}` |
| 업체별 예약 목록 | `/merchant/{id}/reservations` | `GET /merchants/{id}/reservations` |
| 예약 현황 캘린더 | `/merchant/calendar` | `GET /admin/reservations/calendar`, `PUT /admin/reservations/{id}/confirm`, `PUT /admin/reservations/{id}/cancel` |

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
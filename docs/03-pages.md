# 03. 페이지 목록

## API 엔드포인트 현황

### api 서비스 (8080)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/v1/auth/signup` | 회원가입 |
| POST | `/api/v1/auth/login` | 로그인 |
| POST | `/api/v1/auth/logout` | 로그아웃 (서버 토큰 무효화) |
| POST | `/api/v1/auth/refresh` | 토큰 갱신 |
| GET | `/api/v1/users/me` | 내 정보 조회 |
| PUT | `/api/v1/users/me` | 내 정보 수정 (name, phone) |
| DELETE | `/api/v1/users/me` | 회원 탈퇴 |
| GET | `/api/v1/admin/users?role=` | 회원 목록 조회 (ADMIN) |
| POST | `/api/v1/admin/users/{id}/message` | 회원에게 메시지 발송 (ADMIN) |
| POST | `/api/v1/assistant/chat` | AI 어시스턴트 챗봇 질의 (로그인 필요, 전역 플로팅 위젯) |

### reservation 서비스 (8081)

업체(Merchant)·예약 대상(Resource)·관리자 예약 도메인이 이관되어 함께 서비스된다.

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/v1/reservations` | 예약 생성 |
| GET | `/api/v1/reservations/{id}` | 예약 상세 |
| GET | `/api/v1/reservations/me?status=&page=&size=` | 내 예약 목록 |
| PUT | `/api/v1/reservations/{id}/cancel` | 예약 취소 |
| POST | `/api/v1/merchants` | 업체 등록 |
| GET | `/api/v1/merchants?type=&page=&size=` | 업체 목록 (타입 필터 + 페이징) |
| GET | `/api/v1/merchants/me` | 내 업체 목록 |
| GET | `/api/v1/merchants/{id}` | 업체 상세 |
| PUT | `/api/v1/merchants/{id}` | 업체 수정 |
| GET | `/api/v1/merchants/{id}/reservations` | 업체별 예약 목록 |
| GET | `/api/v1/merchants/{id}/stats/daily?year=&month=` | 업체 일별 매출 통계 |
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

### payment 서비스 (8082)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/v1/payments/{reservationId}` | 결제 조회 |
| POST | `/api/v1/payments/{reservationId}/refund` | 환불 요청 |

### notification 서비스 (8083)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/v1/notifications/me` | 내 알림 목록 |
| PATCH | `/api/v1/notifications/{id}/read` | 알림 읽음 처리 |
| GET | `/api/v1/notifications/stream?token=` | 실시간 알림 구독 (SSE, `EventSource`) |

### review 서비스 (8084)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/v1/reviews` | 리뷰 작성 (본인의 CONFIRMED 예약 1건당 1개) |
| GET | `/api/v1/reviews?merchantId=` | 업체별 리뷰 목록 (인증 불필요) |
| PATCH | `/api/v1/reviews/{reviewId}` | 리뷰 수정 (작성자 본인만) |
| DELETE | `/api/v1/reviews/{reviewId}` | 리뷰 삭제 (작성자 본인만) |

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
| 홈 (업체 목록 + 카테고리 필터 + 이름 검색) | `/` | `GET /merchants?type=&page=&size=` (카테고리는 `?category=` URL 쿼리와 동기화, 이름 검색은 이미 불러온 페이지 범위 내 클라이언트 필터링) |
| 업체 상세 + 예약 + 리뷰 | `/owners/{id}` | `GET /merchants/{id}`, `GET /resources/{id}/available-times`, `POST /reservations`, `GET /reviews?merchantId=`, `PATCH /reviews/{id}`, `DELETE /reviews/{id}` |

### 마이페이지

| 페이지 | URL | 사용 API |
|--------|-----|---------|
| 내 정보 | `/my` | `GET /users/me`, `PUT /users/me`, `DELETE /users/me` |
| 내 예약 목록 (상태 필터) | `/my/reservations` | `GET /reservations/me` (상태 필터는 `?status=` URL 쿼리와 동기화) |
| 예약 상세 + 결제 + 취소/환불 + 리뷰 작성 | `/my/reservations/{id}` | `GET /reservations/{id}`, `GET /payments/{id}`, `PUT /reservations/{id}/cancel`, `POST /payments/{id}/refund`, `POST /reviews` |
| 내 알림 | `/my/notifications` | `GET /notifications/me`, `PATCH /notifications/{id}/read`, `GET /notifications/stream` (SSE, 전역 구독) |

### 업체 운영자 (role=MERCHANT 이상)

| 페이지 | URL | 사용 API |
|--------|-----|---------|
| 업체 등록 | `/merchant/register` | `POST /merchants` |
| 내 업체 목록 | `/merchant/dashboard` | `GET /merchants/me` (MERCHANT), `GET /merchants` (ADMIN) |
| 업체 상세 관리 (리소스·이용시간 CRUD) | `/merchant/{id}` | `GET /merchants/{id}`, `POST /merchants/{id}/resources`, `PUT /resources/{id}`, `DELETE /resources/{id}`, `GET /resources/{id}/available-times`, `POST /resources/{id}/available-times`, `PUT /available-times/{id}`, `DELETE /available-times/{id}` |
| 업체 정보 수정 | `/merchant/{id}/edit` | `GET /merchants/{id}`, `PUT /merchants/{id}` |
| 업체별 예약 목록 (상태 필터) | `/merchant/{id}/reservations` | `GET /merchants/{id}/reservations`, `PUT /admin/reservations/{id}/confirm`, `PUT /admin/reservations/{id}/cancel` (상태 필터는 `?status=` URL 쿼리와 동기화) |
| 일별 매출 통계 | `/merchant/{id}/stats` | `GET /merchants/{id}/stats/daily` (연/월은 `?year=&month=` URL 쿼리와 동기화) |
| 예약 현황 캘린더 | `/merchant/calendar` | `GET /admin/reservations/calendar`, `PUT /admin/reservations/{id}/confirm`, `PUT /admin/reservations/{id}/cancel` (연/월은 `?year=&month=` URL 쿼리와 동기화) |

### 관리자 (role=ADMIN)

| 페이지 | URL | 사용 API |
|--------|-----|---------|
| 회원 관리 (역할 필터) | `/admin/users` | `GET /admin/users?role=` (역할 필터는 `?role=` URL 쿼리와 동기화) |
| 메시지 보내기 | `/admin/users/{id}/message` | `GET /admin/users?role=`, `POST /admin/users/{id}/message` |

### 공용 UI (라우트 없음)

| 컴포넌트 | 노출 조건 | 사용 API |
|---------|----------|---------|
| AI 어시스턴트 플로팅 위젯 (`ChatWidget`) | 로그인 상태일 때 모든 화면 우하단에 노출 (`src/app/providers.tsx`에서 전역 마운트) | `POST /assistant/chat` |

### 메타데이터 라우트 (페이지 아님)

| 경로 | 파일 | 설명 |
|------|------|------|
| `/robots.txt` | `src/app/robots.ts` | 크롤러 규칙 — `/my/`, `/merchant/`, `/admin/`은 비공개라 크롤링 제외 |
| `/sitemap.xml` | `src/app/sitemap.ts` | 정적 공개 경로(`/`, `/login`, `/signup`)만 등록 — 업체 상세 등 동적 경로는 미포함 (이유는 파일 내 주석 참고) |
| `/manifest.webmanifest` | `src/app/manifest.ts` | PWA 매니페스트 (앱 이름, 테마 색상 등) |

---

## 에러 코드 → UI 메시지

| 코드 | HTTP | 메시지 |
|------|------|--------|
| RSV_001 | 409 | 이미 예약된 시간대입니다. 다른 시간을 선택해 주세요. |
| RSV_002 | 409 | 동시 요청이 많습니다. 잠시 후 다시 시도해 주세요. |
| RSV_003 | 422 | 최대 인원을 초과했습니다. |
| RSV_004 | 404 | 예약을 찾을 수 없습니다. |
| RSV_005 | 403 | 본인 예약만 취소할 수 있습니다. |
| RSV_006 | 404 | 업체를 찾을 수 없습니다. |
| RSV_007 | 404 | 예약 대상을 찾을 수 없습니다. |
| RSV_008 | 404 | 이용 가능 시간을 찾을 수 없습니다. |
| API_001 | 409 | 이미 사용 중인 이메일입니다. |
| API_002 | 401 | 이메일 또는 비밀번호가 올바르지 않습니다. |
| API_003 | 429 | 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요. |
| API_004 | 503 | 알림 서비스를 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해 주세요. (서킷브레이커 OPEN) |
| API_005 | 503 | AI 어시스턴트를 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해 주세요. |
| PAY_001 | 422 | 결제가 실패했습니다. 다시 시도해 주세요. |
| PAY_002 | 409 | 환불 가능한 상태가 아닙니다. |
| PAY_003 | 404 | 결제 내역을 찾을 수 없습니다. |
| PAY_004 | 422 | 환불 처리에 실패했습니다. 다시 시도해 주세요. |
| AUTH_001 | 401 | 로그인이 필요합니다. |
| AUTH_002 | 403 | 접근 권한이 없습니다. |
| REVIEW_001 | 404 | 리뷰를 찾을 수 없습니다. |
| REVIEW_002 | 403 | 본인 리뷰만 수정·삭제할 수 있습니다. |
| REVIEW_003 | 409 | 이미 리뷰를 작성한 예약입니다. |
| REVIEW_004 | 422 | 예약이 확정된 이후에 리뷰를 작성할 수 있습니다. |
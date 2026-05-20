# 04. API 클라이언트

## 백엔드 연결 구조

로컬 개발 시 `next.config.ts`의 rewrites로 모든 API 요청을 `localhost:3000/api/v1/...`로 통일.
CORS 문제 없이 백엔드 4개 서비스로 자동 프록시된다.

| 요청 경로 | 프록시 대상 |
|----------|-----------|
| `/api/v1/reservations/**` | `localhost:8081` (reservation) |
| `/api/v1/payments/**` | `localhost:8082` (payment) |
| `/api/v1/notifications/**` | `localhost:8083` (notification) |
| `/api/v1/**` (나머지) | `localhost:8080` (api) |

---

## Axios 인스턴스 (`src/lib/api/axios.ts`)

- baseURL: `/api/v1`
- 요청 인터셉터: Zustand 스토어에서 accessToken을 읽어 `Authorization: Bearer {token}` 헤더 자동 주입
- 응답 인터셉터: 401 응답 시 토큰 삭제 후 `/login` 리디렉션 (refresh 미구현이므로 재로그인 처리)
- 에러 인터셉터: 백엔드 `problem+json` 응답의 `code` 필드 기반으로 사용자 메시지 변환

---

## API 함수 목록

### auth.ts
```
getMe() → UserResponse
signup(data: SignupRequest) → void
login(data: LoginRequest) → { token: TokenResponse; user: UserResponse }
```

### merchants.ts
```
getMerchants() → MerchantSummary[]
getMyMerchants() → MerchantSummary[]
createMerchant(params: MerchantRequest) → MerchantDetail
getMerchant(id) → MerchantDetail
updateMerchant(id, params: MerchantRequest) → MerchantDetail
getAvailableTimes(resourceId, date) → AvailableTime[]
createReservation(params: CreateReservationRequest) → void
```

### resources.ts
```
createResource(merchantId, params: ResourceRequest) → Resource
updateResource(resourceId, params: ResourceRequest) → Resource
deleteResource(resourceId) → void
getAvailableTimes(resourceId, date) → AvailableTime[]
createAvailableTime(resourceId, startTime, endTime) → AvailableTime
updateAvailableTime(id, startTime, endTime) → AvailableTime
deleteAvailableTime(id) → void
```

### reservations.ts
```
getReservation(id) → Reservation
cancelReservation(id) → void
getMyReservations(status?, page?, size?) → PageResponse<Reservation>
```

### merchantReservations.ts
```
getMerchantReservations(merchantId, status?, page?, size?) → PageResponse<MerchantReservation>
confirmReservation(reservationId) → void
cancelReservation(reservationId) → void
```

### adminReservations.ts
```
getAdminCalendar(year, month) → AdminCalendarData
confirmReservation(reservationId) → void
cancelReservation(reservationId) → void
```

### payments.ts
```
getPayment(reservationId) → Payment
refund(reservationId) → void
```

### notifications.ts
```
getMyNotifications() → Notification[]
```

---

## 응답 타입 (백엔드 DTO 기반)

백엔드 DTO와 1:1 매핑. `src/lib/types/` 에 정의.

### 예약 상태
```
PENDING   → 결제 대기 중
CONFIRMED → 예약 확정
CANCELLED → 취소됨
```

### 결제 상태
```
PENDING   → 결제 처리 중
COMPLETED → 결제 완료
FAILED    → 결제 실패
REFUNDED  → 환불 완료
```

### 업체 타입
```
PENSION    → 펜션
CLASS      → 수업
FACILITY   → 시설
CONSULTING → 상담
```
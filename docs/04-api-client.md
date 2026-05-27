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
- 요청 인터셉터: Zustand 스토어에서 `accessToken`을 읽어 `Authorization: Bearer {token}` 헤더 자동 주입
- 응답 인터셉터 (401): `refreshToken`으로 토큰 갱신 후 실패한 요청 재시도. 갱신 중 추가 요청은 큐에서 대기. refresh 자체가 401이거나 refreshToken이 없으면 로그아웃 후 `/login` 리디렉션
- 에러 변환: 백엔드 `problem+json` 응답의 `code` 필드 기반으로 한국어 메시지 변환 (`getErrorMessage()`)

---

## API 함수 목록

### auth.ts
```
getMe() → UserResponse
updateMe(body: UserUpdateRequest) → UserResponse
deleteMe() → void
signup(data: SignupRequest) → void
login(data: LoginRequest) → { token: TokenResponse; user: UserResponse }
refresh(refreshToken: string) → RefreshResponse
```

### merchants.ts
```
getMerchants() → MerchantSummary[]
getMyMerchants() → MerchantResponse[]
createMerchant(params: MerchantRequest) → MerchantResponse
getMerchant(id) → MerchantDetail
updateMerchant(id, params: MerchantRequest) → MerchantResponse
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

## 인증 상태 (`src/lib/store/auth.ts`)

Zustand + `persist` 미들웨어로 `localStorage` 동기화. 페이지 로드 시 `localStorage → cookie` 동기화도 수행.

| 상태 | 설명 |
|------|------|
| `accessToken` | API 요청에 사용하는 JWT |
| `refreshToken` | 토큰 갱신에 사용 |
| `user` | `UserResponse` (name, email, phone, role 등) |
| `role` | `user.role`의 단축 참조 |
| `isAuthenticated` | 인증 여부 |

| 액션 | 설명 |
|------|------|
| `setAuth(accessToken, refreshToken, user)` | 로그인 완료 시 전체 상태 설정 + cookie 저장 |
| `setAccessToken(accessToken)` | 토큰 갱신 시 accessToken만 교체 |
| `updateUser(user)` | 내 정보 수정 후 스토어 동기화 |
| `clearAuth()` | 로그아웃/탈퇴 시 전체 초기화 + cookie 삭제 |

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
PENSION  → 펜션
CLASS    → 수업
FACILITY → 시설
```
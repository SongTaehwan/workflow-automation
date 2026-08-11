# shared/ 레이어

도메인에 **무관한** 범용 재사용 코드. 어떤 레이어에서도 import할 수 있다.
슬라이스 없이 세그먼트로 직접 구성된다 (`shared/ui/`, `shared/lib/` …).

> 백엔드 비유: 공통 유틸 패키지 (`common`, `util`, `infrastructure`).
> `Order`, `Driver` 같은 도메인 개념을 전혀 모른다.

## 세그먼트 구조

```
src/shared/
├── api/
│   ├── contract/        # envelope 스키마, DataSourceError 계층
│   ├── client/          # axios 팩토리, interceptor, toDataSourceError
│   ├── token/           # tokenStorage, tokenRefreshManager
│   ├── upload/          # 파일 업로드 (presigned + S3 PUT)
│   └── index.ts         # 배럴 — 외부는 여기서만 import
├── config/
│   └── env.ts           # zod 로 import.meta.env 런타임 검증 (전 레이어 공용)
├── ui/                  # shadcn 컴포넌트 (Button, Input, Badge, Dialog 등)
│   ├── button.tsx
│   └── input.tsx
├── lib/
│   └── utils.ts         # cn(), formatDate(), formatCurrency() 등
└── types/
    └── common.ts        # Pagination, ApiResponse 등 도메인 무관 공통 타입
```

## Import 규칙

`shared`는 최하위 레이어다. 다른 레이어를 import하면 안 된다.

```
shared → (없음)                              ✅
shared → entities, features, widgets, pages ❌
```

`shared/` 내부 세그먼트 간 import는 자유롭다.

## 실전 배치 예시

| 코드                              | 위치                     | 이유                          |
| --------------------------------- | ------------------------ | ----------------------------- |
| `cn()`, `formatDate()`            | `shared/lib/utils.ts`    | 도메인 무관                   |
| `Button`, `Input` (shadcn)        | `shared/ui/`             | 도메인 무관 UI 원자           |
| axios 인스턴스, 401 interceptor   | `shared/api/client/`     | 도메인 무관 HTTP 설정         |
| `Pagination<T>`, `ApiResponse<T>` | `shared/types/common.ts` | 도메인 무관 공통 타입         |
| `OrderStatusBadge`                | `entities/order/ui/`     | Order 도메인 앎 → shared 불가 |
| `useCurrentUser()`                | `entities/user/`         | User 도메인 앎 → shared 불가  |

## 서드파티 SDK · 플러그인 배치 기준

"여러 곳에서 호출하는 함수인가" vs "앱 시작 시 한 번만 실행하는가"로 나뉜다.

| 성격                           | 예시                                      | 위치                       |
| ------------------------------ | ----------------------------------------- | -------------------------- |
| SDK 래퍼·어댑터 함수           | `analytics.track()` 래핑, dayjs 확장 설정 | `shared/lib/<sdk-name>.ts` |
| HTTP 인프라                    | axios 인스턴스, interceptor               | `shared/api/client/`       |
| UI 컴포넌트 래퍼               | shadcn 컴포넌트                           | `shared/ui/`               |
| 앱 전역 초기화 (한 번만 실행)  | `Sentry.init()`, `i18next.init()`         | `app/config/`              |
| UI Provider (앱 최상단 마운트) | ToastProvider, ThemeProvider              | `app/providers/`           |

```ts
// ✅ shared/lib/analytics.ts — 래퍼 함수, 여러 곳에서 호출
export const track = (event: string, props?: object) =>
  window.analytics?.track(event, props);

// ✅ app/config/sentry.ts — 앱 시작 시 한 번만 실행 → shared 아님
Sentry.init({ dsn: env.VITE_SENTRY_DSN });
```

## 에러 매핑 규칙 (Data Source ↔ Domain)

에러는 두 계층으로 나눠 변환한다. **`shared/api`는 사용자 노출 문구를 담지 않는다.**

```
shared/api (transport)              → DataSourceError 3종 (shared/api/contract/errors.ts)
entities/<slice>, features/<slice>  → 슬라이스 자체 도메인 에러 클래스
ui/ 컴포넌트 / page                  → toast(err.message)
```

같은 envelope code 라도 컨텍스트(로그인 화면 vs 다른 페이지)에 따라 메시지가 달라야 하므로 UI 문구 결정은 슬라이스 소유다.

### DataSourceError 3종 (`shared/api/contract/errors.ts`)

| 클래스             | 의미                                   | 보존 정보                                         |
| ------------------ | -------------------------------------- | ------------------------------------------------- |
| `ApiResponseError` | 서버 envelope `{success:false, error}` | code, originalMessage, details, timestamp, status |
| `NetworkError`     | 응답이 도착하지 않음 (네트워크/CORS)   | (없음)                                            |
| `SchemaError`      | envelope 형식 위반 / zod 파싱 실패     | (메시지에 원인 표기)                              |

### 정규화 진입점 — `toDataSourceError` 호출 규칙

- **`httpClient()`** 인스턴스: 인터셉터가 axios 에러 → DataSourceError 로 자동 변환. **슬라이스는 추가로 `toDataSourceError` 호출하지 않는다.**
- **bare `axios.create(...)`** (인터셉터 우회한 public endpoint — 현재 `features/auth/api/loginWithGoogle.ts`의 `/auth/google`): 슬라이스가 `toDataSourceError(err)` 를 직접 호출해 정규화한다.

→ `toDataSourceError` 의 정당한 호출처는 (1) `shared/api/interceptors.ts` 내부 (2) bare axios 슬라이스 두 곳뿐. 일반 슬라이스에서 호출하면 인터셉터가 이미 한 일을 중복 수행한다.

### 슬라이스의 도메인 에러 번역 — `mapErrorByCode`

각 슬라이스는 자기 도메인 에러 클래스 한 개를 `model/errors.ts` 에 두고, `api/` 함수가 `mapErrorByCode` 로 DataSourceError → 도메인 에러로 변환한다.

```ts
// features/auth/api/loginWithGoogle.ts
function toLoginError(err: unknown): LoginError {
  return mapErrorByCode<LoginError>(err, {
    byCode: {
      // 슬라이스가 신경 쓰는 envelope code 만 등록
      STAFF_DOMAIN_NOT_ALLOWED: () =>
        new LoginError(
          'STAFF_DOMAIN_NOT_ALLOWED',
          '접근 권한이 없는 계정입니다. 관리자에게 문의해 주세요.'
        ),
    },
    // ApiResponseError 인데 byCode 미매칭
    apiFallback: (e) =>
      new LoginError(
        e.code,
        '로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'
      ),
    // ApiResponseError 아님 (Network / Schema / 기타)
    fallback: () =>
      new LoginError(
        'UNKNOWN',
        '로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'
      ),
  });
}
```

### 흔한 실수

```ts
// ❌ shared/api 가 사용자 노출 문구나 도메인 코드를 알고 있음
case 'STAFF_DOMAIN_NOT_ALLOWED':
  return new AppError(code, '접근 권한이 없는 계정입니다...'); // 도메인 침투

// ❌ httpClient() 사용 슬라이스가 toDataSourceError 를 또 호출
.catch((err) => { throw toDataSourceError(err); }); // 인터셉터가 이미 정규화함

// ❌ raw AxiosError 의 message 가 UI 까지 새어나옴
catch (err) { toast.error(err.message); } // "Request failed with status code 403"

// ✅ 슬라이스가 도메인 에러로 번역 → UI 는 err.message 를 그대로 노출
catch (err) {
  toast.error(err instanceof Error ? err.message : '오류가 발생했습니다.');
}
```

## shadcn 컴포넌트

shadcn CLI로 추가된 컴포넌트는 `src/shared/ui/`에 위치한다.

```ts
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
```

## 상태관리 (Zustand) 배치 기준

**서버 상태는 TanStack Query, 클라이언트 상태만 Zustand가 담당한다.**

```
서버 데이터 (API 응답, 캐시)     → TanStack Query  (entities/api/)
클라이언트 상태 (UI, 세션 토큰)  → Zustand
```

Zustand store는 상태를 소유하는 레이어에 둔다.

| 상태 성격                     | 예시                                  | 위치                              |
| ----------------------------- | ------------------------------------- | --------------------------------- |
| 앱 전역 UI 상태 (도메인 무관) | 사이드바 열림/닫힘, 테마              | `shared/lib/<name>-store.ts`      |
| 도메인 세션 상태              | 로그인 유저 토큰, 현재 사용자         | `entities/<slice>/model/store.ts` |
| Feature 전용 클라이언트 상태  | 멀티스텝 폼 진행 상태, 선택된 항목 ID | `features/<slice>/model/store.ts` |

```ts
// ✅ shared/lib/sidebar-store.ts — 도메인 무관 UI 상태
export const useSidebarStore = create<SidebarState>()(...);

// ✅ entities/user/model/session-store.ts — 도메인 관련 세션 상태
export const useSessionStore = create<SessionState>()(...);

// ✅ features/bulk-cancel/model/store.ts — feature 전용 상태
export const useBulkCancelStore = create<BulkCancelState>()(...);

// ❌ 서버 데이터를 Zustand로 직접 관리 — TanStack Query로
const useOrderStore = create(() => ({ orders: [] }));
useEffect(() => {
  fetch('/orders').then(data => set({ orders: data }));
}, []);
```

## 체크리스트 — shared에 넣기 전

- [ ] 어떤 비즈니스 도메인 개념도 포함하지 않는가? (`Order`, `Driver`, `User` 타입 모름)
- [ ] 어떤 레이어에서 가져다 써도 자연스러운가?

NO라면 도메인 타입 알고 있으면 `entities/`, 사용자 액션과 연관되면 `features/`에 배치한다.

## 흔한 실수

```ts
// ❌ shared에서 도메인 타입 참조
// shared/lib/formatter.ts
import { OrderStatus } from '@/entities/order'; // shared는 entities를 모름

// ✅ 도메인 무관하게 string 파라미터로
export function formatStatus(status: string): string { ... }

// ❌ shared/api에 도메인 엔드포인트 정의
export const getOrders = () => client.get('/orders'); // → entities/order/api/ 로

// ✅ shared/api는 인스턴스와 interceptor만
export const client = axios.create({ baseURL: env.VITE_API_BASE_URL });
```

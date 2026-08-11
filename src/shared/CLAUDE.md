# shared/ 레이어

도메인에 무관한 범용 재사용 코드. 슬라이스 없이 세그먼트로 직접 구성된다.

아래 경로 중 일부는 아직 존재하지 않는다. 목표 구조를 전제로 작성됐다.

## 세그먼트 규약

| 세그먼트  | 담는 것                                                               |
| --------- | --------------------------------------------------------------------- |
| `api/`    | axios 팩토리·interceptor, envelope 스키마, DataSourceError, 토큰 저장 |
| `config/` | `env.ts` — zod 로 `import.meta.env` 런타임 검증                       |
| `ui/`     | shadcn 컴포넌트, 도메인 무관 Provider                                 |
| `lib/`    | `cn()`, 포매터, SDK 래퍼, 도메인 무관 store                           |
| `types/`  | `Pagination<T>` 등 도메인 무관 공통 타입                              |

- MUST: `shared/api` 외부 노출은 `shared/api/index.ts` 배럴로만 한다.
- MUST: 도메인 엔드포인트는 `entities/<slice>/api/` 에 정의한다. `shared/api` 는 인스턴스와 interceptor 만 담는다.
- MUST: 사용자 노출 문구는 슬라이스가 결정한다.

## 판단 기준

`shared/` 에 두기 전에 두 질문에 모두 YES 여야 한다.

- 어떤 비즈니스 도메인 개념도 포함하지 않는가? (`Order`·`Driver`·`User` 타입을 모르는가)
- 어떤 레이어에서 가져다 써도 자연스러운가?

도메인 타입을 알면 `entities/`, 사용자 액션과 연관되면 `features/` 에 배치한다.

| 코드                              | 위치                     | 근거                  |
| --------------------------------- | ------------------------ | --------------------- |
| `cn()`, `formatDate()`            | `shared/lib/utils.ts`    | 도메인 무관           |
| `Button`, `Input`                 | `shared/ui/`             | 도메인 무관 UI 원자   |
| axios 인스턴스, 401 interceptor   | `shared/api/client/`     | 도메인 무관 HTTP 설정 |
| `Pagination<T>`, `ApiResponse<T>` | `shared/types/common.ts` | 도메인 무관 공통 타입 |
| `OrderStatusBadge`                | `entities/order/ui/`     | Order 도메인을 앎     |
| `useCurrentUser()`                | `entities/user/`         | User 도메인을 앎      |

### 서드파티 SDK·Provider

판별식: **여러 곳에서 호출하는 함수인가, 앱 시작 시 한 번만 실행하는가.**

| 성격                          | 예시                              | 위치                       |
| ----------------------------- | --------------------------------- | -------------------------- |
| SDK 래퍼·어댑터 함수          | `analytics.track()` 래핑          | `shared/lib/<sdk-name>.ts` |
| HTTP 인프라                   | axios 인스턴스, interceptor       | `shared/api/client/`       |
| UI 컴포넌트 래퍼              | shadcn 컴포넌트                   | `shared/ui/`               |
| 도메인 무관 Provider          | ThemeProvider                     | `shared/ui/`               |
| 앱 전역 초기화 (한 번만 실행) | `Sentry.init()`, `i18next.init()` | `app/config/`              |
| 도메인 의존 Provider          | 세션 기반 Provider                | `app/providers/`           |

도메인 무관 Provider 를 `shared/ui/` 에 두는 이유: `app` 은 최상위라 하위 레이어가 그 훅(`useTheme` 등)을 import 할 수 없다. `app/` 은 조합만 담당한다.

## 상태관리 배치

판별식: **서버가 소유한 데이터인가, 클라이언트가 소유한 상태인가.**

- MUST: 서버 데이터는 TanStack Query 로만 다룬다. Zustand store 에 직접 담지 않는다.
- MUST: Zustand store 는 상태를 소유하는 레이어에 둔다.

| 상태 성격                     | 예시                            | 위치                              |
| ----------------------------- | ------------------------------- | --------------------------------- |
| 앱 전역 UI 상태 (도메인 무관) | 사이드바 열림/닫힘, 테마        | `shared/lib/<name>-store.ts`      |
| 도메인 세션 상태              | 로그인 유저 토큰, 현재 사용자   | `entities/<slice>/model/store.ts` |
| Feature 전용 클라이언트 상태  | 멀티스텝 폼 진행, 선택된 항목ID | `features/<slice>/model/store.ts` |

## 에러 매핑 규칙

에러는 두 계층으로 나눠 변환한다.

```
shared/api (transport)              -> DataSourceError 3종
entities/<slice>, features/<slice>  -> 슬라이스 도메인 에러 클래스
ui/ 컴포넌트, page                   -> toast(err.message)
```

판별 근거: 같은 envelope code 라도 컨텍스트(로그인 화면인가 다른 페이지인가)에 따라 사용자 문구가 달라야 한다. 문구 결정 권한은 슬라이스가 갖는다.

### DataSourceError 3종

| 클래스             | 의미                                   | 보존 정보                                         |
| ------------------ | -------------------------------------- | ------------------------------------------------- |
| `ApiResponseError` | 서버 envelope `{success:false, error}` | code, originalMessage, details, timestamp, status |
| `NetworkError`     | 응답이 도착하지 않음 (네트워크/CORS)   | 없음                                              |
| `SchemaError`      | envelope 형식 위반 / zod 파싱 실패     | 메시지에 원인 표기                                |

### `toDataSourceError` 호출 규칙

- MUST: `httpClient()` 슬라이스는 인터셉터가 정규화한 값을 그대로 쓴다. `toDataSourceError` 를 다시 호출하지 않는다.
- MUST: bare `axios.create(...)` 로 인터셉터를 우회한 슬라이스에서만 직접 호출한다.

정당한 호출처는 `shared/api/interceptors.ts` 내부와 bare axios 슬라이스 두 곳뿐이다.

### `mapErrorByCode` — 슬라이스 도메인 에러 번역

각 슬라이스는 도메인 에러 클래스 한 개를 `model/errors.ts` 에 두고, `api/` 함수가 `mapErrorByCode` 로 번역한다.

```ts
function toLoginError(err: unknown): LoginError {
  return mapErrorByCode<LoginError>(err, {
    // 슬라이스가 신경 쓰는 envelope code 만 등록
    byCode: {
      STAFF_DOMAIN_NOT_ALLOWED: () =>
        new LoginError(
          'STAFF_DOMAIN_NOT_ALLOWED',
          '접근 권한이 없는 계정입니다.'
        ),
    },
    // ApiResponseError 인데 byCode 미매칭
    apiFallback: (e) =>
      new LoginError(e.code, '로그인 중 오류가 발생했습니다.'),
    // ApiResponseError 아님 (Network / Schema / 기타)
    fallback: () => new LoginError('UNKNOWN', '로그인 중 오류가 발생했습니다.'),
  });
}
```

### 코드 예시

```ts
// 위반: shared/api 가 사용자 문구와 도메인 코드를 앎
case 'STAFF_DOMAIN_NOT_ALLOWED':
  return new AppError(code, '접근 권한이 없는 계정입니다.');

// 위반: httpClient 슬라이스가 toDataSourceError 를 중복 호출
.catch((err) => { throw toDataSourceError(err); });

// 위반: raw AxiosError 메시지가 UI 로 샘
catch (err) { toast.error(err.message); } // "Request failed with status code 403"

// 정상: 슬라이스가 번역한 도메인 에러를 UI 가 그대로 노출
catch (err) {
  toast.error(err instanceof Error ? err.message : '오류가 발생했습니다.');
}

// 위반: shared 가 도메인 타입을 참조
import { OrderStatus } from '@/entities/order';

// 정상: 도메인 무관하게 string 으로 받는다
export function formatStatus(status: string): string { ... }
```

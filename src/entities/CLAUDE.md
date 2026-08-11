# entities/ 레이어

시스템이 다루는 **비즈니스 객체(명사)** 단위.
도메인 개념의 정의, 조회, 표시를 담당하며 **사용자가 의도적으로 발생시키는 액션은 담지 않는다.**

> 백엔드 비유: JPA `@Entity` + Repository(read-only) + DTO + 도메인 규칙 메서드.
> 데이터 정의, 조회, 도메인 판단 로직을 담는다. 상태를 변경하는 유스케이스 로직은 없다.

## 이 레이어에 두는 것

| 세그먼트   | 내용                                                                                            |
| ---------- | ----------------------------------------------------------------------------------------------- |
| `model/`   | 타입 정의, zod 스키마, enum, 상수, 도메인 규칙 함수, 에러 상수, Zustand store (클라이언트 상태) |
| `api/`     | 서버 데이터를 가져오는 함수 + useQuery 훅 (서버 상태)                                           |
| `ui/`      | 데이터를 props로 받아 **표시만** 하는 컴포넌트                                                  |
| `index.ts` | public API만 re-export                                                                          |

## 구조

```
src/entities/
└── order/
    ├── api/
    │   └── orderApi.ts             # GET /orders, GET /orders/:id + useQuery 훅
    ├── model/
    │   ├── types.ts                # Order 타입, OrderStatus enum, zod 스키마
    │   ├── permissions.ts          # canModifyOrder() 등 도메인 규칙 함수
    │   ├── errors.ts               # ORDER_ERROR_MESSAGES 등 에러 상수
    │   └── store.ts                # Zustand store — 클라이언트 상태가 필요한 경우에만
    ├── ui/
    │   └── OrderStatusBadge.tsx    # 상태를 색상 뱃지로 표시 (클릭 없음)
    └── index.ts
```

## `api/` vs `model/` 개념

| 세그먼트 | 정체성               | 담는 것                                                                                    |
| -------- | -------------------- | ------------------------------------------------------------------------------------------ |
| `api/`   | **서버 상태**        | request 함수 + 그 요청을 감싼 **TanStack Query 훅(useQuery)**. "서버와 어떻게 대화하는가". |
| `model/` | **클라 상태·도메인** | Zustand store, 도메인 타입·zod 스키마·enum·상수, 도메인 규칙 함수, 에러 클래스.            |

> **TanStack 호출(useQuery/useMutation) 그 자체는 `api/`** 에 둔다 — 백엔드 상호작용 + 캐시이기 때문. `model/` 에는 서버 상태 훅을 두지 않는다(클라 상태·도메인 정의만).
> request 함수와 그 훅은 같은 `api/` 파일(또는 `api/useX.ts`)에 co-locate 한다 (`orderApi.ts` 가 `getOrder` + `useOrder` 둘 다 보유).

entities 는 읽기 전용이므로 `api/` 에는 useQuery 만 온다(쓰기=useMutation 은 features).

> **useQuery 는 v5 에서 `onSuccess`/`onError` 가 제거됨.** 파생은 `select`(순수 변환)로, 데이터에 대한 도메인 반응은 렌더 시점 호출자가 `data` 를 보고 결정한다. `api/` 훅은 `toast`·명령형 `navigate` 같은 UI/UX 부수효과를 소유하지 않는다 — 호출자(ui/)가 소유. data-source 훅 vs use-case 훅 구분, mutate call-site 콜백 패턴, 차단 룰은 [`features/CLAUDE.md` — 훅의 두 정체성 / UI/UX 부수효과](../features/CLAUDE.md#훅의-두-정체성--data-source-훅-vs-use-case-훅) 참조.

## 핵심 판단 기준 — "사용자 의도" 유무

HTTP 메서드(GET/POST)는 참고용 휴리스틱이다. 진짜 기준은 **사용자가 의도적으로 발생시킨 요청인가** 다.

```
사용자 버튼 클릭·폼 제출로 인해 발생하는가?
  YES → features/
  NO  → entities/
```

### 예외 케이스

| 요청                                           | HTTP  | 위치          | 이유                                                   |
| ---------------------------------------------- | ----- | ------------- | ------------------------------------------------------ |
| `GET /orders`                                  | GET   | `entities/`   | 자동 조회                                              |
| `GET /orders/export`                           | GET   | `features/`   | 사용자가 내보내기 버튼 클릭                            |
| `PATCH /orders/:id/cancel`                     | PATCH | `features/`   | 사용자 액션                                            |
| `POST /auth/refresh`                           | POST  | `shared/api/` | 자동 토큰 갱신, 도메인 무관                            |
| `POST /orders/search` (페이지네이션·필터 조회) | POST  | `entities/`   | 사용자가 버튼을 누른 게 아니라 조건에 따른 자동 재조회 |

> `POST`여도 "자동으로 발생하는 조회"면 entities. `GET`이어도 "사용자가 버튼을 눌러야만 발생"하면 features.

## entities vs features 구분 기준

|           | entities                          | features                              |
| --------- | --------------------------------- | ------------------------------------- |
| 비유      | 명사 (Order, Driver)              | 동사 (cancelOrder, assignDriver)      |
| 트리거    | 자동·렌더링·조건 변화             | 사용자 클릭·폼 제출                   |
| HTTP 경향 | GET, 자동 POST                    | POST / PATCH / DELETE                 |
| UI        | 표시만 (`onClick` 자체 정의 없음) | 인터랙션 처리 (`onClick`, `onSubmit`) |
| Query 훅  | `useQuery` (읽기)                 | `useMutation` (쓰기)                  |

```tsx
// ✅ entities — props로 받아 표시만
export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge>{status}</Badge>;
}

// ❌ entities에 인터랙션 추가 → features/로
export function OrderStatusBadge({ status, onCancel }: ...) {
  return <Badge onClick={onCancel}>{status}</Badge>; // onClick → features/
}
```

## Import 규칙

```
entities → shared                        ✅
entities → features, widgets, pages, app ❌
entities/A → entities/B (cross-slice)    ❌
```

## 도메인 에러 (`model/errors.ts`)

각 entity 슬라이스는 자기 도메인 에러 클래스를 `model/errors.ts` 에 정의한다.
`api/` 는 `httpClient()` 가 정규화한 `DataSourceError` 를 받아 `mapErrorByCode` 로 도메인 에러로 번역한 뒤 throw.

```ts
// entities/user/model/errors.ts
export class UserError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'UserError';
  }
}

// entities/user/api/userApi.ts
import { mapErrorByCode } from '@/shared/lib/mapErrorByCode';
import { UserError } from '../model/errors';

function toUserError(err: unknown): UserError {
  return mapErrorByCode<UserError>(err, {
    byCode: {},
    apiFallback: (e) =>
      new UserError(e.code, '사용자 정보를 불러오지 못했습니다.'),
    fallback: () =>
      new UserError('UNKNOWN', '사용자 정보를 불러오지 못했습니다.'),
  });
}
```

DataSourceError 3종 정의·`toDataSourceError` 호출 규칙·`mapErrorByCode` 동작은 [`shared/CLAUDE.md` — 에러 매핑 규칙](../shared/CLAUDE.md#에러-매핑-규칙-data-source--domain) 참조.

### 에러 변환 mapper 네이밍·분리

- 변환 함수는 **`to<Domain>Error(err)`** 로 명명한다 (`toUserError`, `toPartnerError`). DataSourceError 를 받아 슬라이스 도메인 에러로 번역.
- **인라인 기본**: request 1개·byCode 작으면 api 요청 파일(`xApi.ts`) 안에 둔다.
- **분리**: byCode 가 크거나 request 함수가 여러 개여서 파일이 커지면 `api/errorMapper.ts` 로 분리하고 `to<Domain>Error` 를 export 한다.
- `httpClient` 는 `@/shared/api` 에서 직접 import (mapper 파일에서 재export 금지).

## Retry 정책

`queryClient` 에 전역 `retry` 함수를 두지 않는다. **각 `useQuery` 가 자기 retry 정책을 호출 시점에 지정한다.**

이유: 같은 도메인 에러라도 호출 컨텍스트(초기 로드 / background refetch / 폴링)에 따라 재시도 의미가 달라지므로, 정책은 호출 시점에서 결정하는 게 정직하다. 전역 함수는 도메인 에러 클래스를 instanceof 로 알 수 없어 도달 불가 분기가 된다 (shared/api 가 entities/features 를 모름).

```ts
// ✅ 슬라이스가 자기 정책을 명시
export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    retry: (failureCount, error) => {
      if (failureCount >= 2) return false;
      // 인증 실패 / 권한 거부는 재시도 의미 없음
      if (error instanceof UserError && error.code !== 'UNKNOWN') return false;
      return true;
    },
  });
}
```

### 추출 트리거

동일 retry 로직이 **3개 이상 슬라이스에서 반복**되면 `shared/lib/queryRetry.ts` 에 도메인 무관 헬퍼로 추출하고 슬라이스가 import 해서 사용한다. 그 전엔 슬라이스마다 명시적으로 작성.

useMutation 도 동일 원칙 — [`features/CLAUDE.md`](../features/CLAUDE.md) 참조.

## Public API (index.ts)

```ts
// entities/order/index.ts
export type { Order, OrderStatus } from './model/types';
export { orderSchema } from './model/types';
export { useOrders, useOrder } from './api/orderApi';
export { OrderStatusBadge } from './ui/OrderStatusBadge';
```

외부에서는 `@/entities/order`만 참조한다. 내부 경로 직접 접근은 금지다.

## 체크리스트 — entities에 넣기 전

- [ ] 사용자가 버튼을 누르거나 폼을 제출해야만 발생하는 코드인가? → YES면 features/
- [ ] 특정 비즈니스 도메인 타입을 알고 있는가? (Order, Driver, User 등) → NO면 shared/
- [ ] UI라면 props로 데이터를 받아 표시만 하는가? (자체 `onClick` 정의 없음)
- [ ] 훅이라면 `useQuery`(읽기)인가, `useMutation`(쓰기)인가? → useMutation이면 features/

## 흔한 실수

```ts
// ❌ 상태 변경 요청을 entities에 두기
export const cancelOrder = (id: string) =>
  axios.patch(`/orders/${id}/cancel`); // PATCH + 사용자 액션 → features/cancel-order/api

// ❌ useMutation을 entities에 두기
export function useCancelOrder() {
  return useMutation(...); // useMutation → features/
}

// ❌ entities/A에서 entities/B 참조 (cross-slice 금지)
// entities/order/model/types.ts
import { Driver } from '@/entities/driver'; // ❌
// ✅ 각 entity는 독립적으로 자신의 타입만 정의. 조합은 상위 레이어에서

// ❌ entities에서 features 참조 (절대 금지)
import { useCancelOrder } from '@/features/cancel-order';
```

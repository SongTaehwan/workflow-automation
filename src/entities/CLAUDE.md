# entities/ 레이어

시스템이 다루는 비즈니스 객체(명사) 단위. 도메인 개념의 정의, 조회, 표시를 담당한다.

아래 경로 중 일부는 아직 존재하지 않는다. 목표 구조를 전제로 작성됐다.

## 세그먼트 규약

| 세그먼트   | 담는 것                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------ |
| `model/`   | 타입·zod 스키마·enum, 도메인 규칙 함수, 도메인 에러 클래스와 에러 코드 상수, Zustand store |
| `api/`     | 요청 함수 + 그 요청을 감싼 `useQuery` 훅                                                   |
| `ui/`      | 데이터를 props 로 받아 표시만 하는 컴포넌트                                                |
| `index.ts` | public API 만 re-export                                                                    |

- MUST: 요청 함수와 그 훅을 같은 `api/` 파일에 co-locate 한다 (`orderApi.ts` 가 `getOrder` 와 `useOrder` 를 함께 보유).
- MUST: 서버 상태 훅은 `api/` 에 둔다. `model/` 은 도메인 정의와 클라이언트 상태만 담는다.
- MUST: `ui/` 컴포넌트는 props 로 받아 표시만 한다. 인터랙션은 `features/` 가 소유한다.

판별식: `api/` 는 "서버와 어떻게 대화하는가", `model/` 은 "도메인이 무엇인가 + 클라이언트 상태".

## 판단 기준

### entities 인가 features 인가

HTTP 메서드는 참고용 휴리스틱이다. 진짜 기준은 **사용자가 의도적으로 발생시킨 요청인가** 다.

```
사용자 버튼 클릭·폼 제출로 발생하는가?
  YES -> features/
  NO  -> entities/
```

| 요청                                | HTTP  | 위치          | 근거                         |
| ----------------------------------- | ----- | ------------- | ---------------------------- |
| `GET /orders`                       | GET   | `entities/`   | 자동 조회                    |
| `GET /orders/export`                | GET   | `features/`   | 사용자가 내보내기 버튼 클릭  |
| `PATCH /orders/:id/cancel`          | PATCH | `features/`   | 사용자 액션                  |
| `POST /auth/refresh`                | POST  | `shared/api/` | 자동 토큰 갱신, 도메인 무관  |
| `POST /orders/search` (필터·페이지) | POST  | `entities/`   | 조건 변화에 따른 자동 재조회 |

POST 여도 자동 조회면 entities. GET 이어도 사용자가 눌러야 발생하면 features.

|           | entities              | features                         |
| --------- | --------------------- | -------------------------------- |
| 대응 품사 | 명사 (Order, Driver)  | 동사 (cancelOrder, assignDriver) |
| 트리거    | 자동·렌더링·조건 변화 | 사용자 클릭·폼 제출              |
| UI        | 표시만                | 인터랙션 처리                    |
| Query 훅  | `useQuery`            | `useMutation`                    |

### entities 에 넣기 전 확인

- 사용자가 버튼을 누르거나 폼을 제출해야만 발생하는가? YES 면 `features/`.
- 특정 도메인 타입을 알고 있는가? NO 면 `shared/`.
- UI 라면 props 로 받아 표시만 하는가?
- 훅이라면 `useQuery` 인가? `useMutation` 이면 `features/`.

## 도메인 에러

각 슬라이스는 도메인 에러 클래스를 `model/errors.ts` 에 정의한다. `api/` 가 `DataSourceError` 를 받아 `mapErrorByCode` 로 번역한 뒤 throw 한다.

- MUST: 변환 함수는 `to<Domain>Error(err)` 로 명명한다.
- MUST: request 1개이고 byCode 가 작으면 api 요청 파일 안에 인라인으로 둔다.
- MUST: byCode 가 크거나 request 함수가 여러 개면 `api/errorMapper.ts` 로 분리하고 `to<Domain>Error` 를 export 한다.
- MUST: `httpClient` 는 `@/shared/api` 에서 직접 import 한다.

```ts
// entities/user/api/userApi.ts
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

`DataSourceError` 정의와 `mapErrorByCode` 3축 작성법은 [`shared/CLAUDE.md` — 에러 매핑 규칙](../shared/CLAUDE.md#에러-매핑-규칙) 이 단일 출처다. 충돌 시 그쪽이 우선한다.

## Retry 정책

- MUST: 각 `useQuery` 가 자기 retry 정책을 호출 시점에 지정한다. `queryClient` 에 전역 `retry` 함수를 두지 않는다.
- MUST: 동일 retry 로직이 3개 이상 슬라이스에서 반복되면 `shared/lib/queryRetry.ts` 로 추출한다. 그 전에는 슬라이스마다 명시한다.

판별 근거: 같은 도메인 에러라도 호출 컨텍스트(초기 로드 / background refetch / 폴링)에 따라 재시도 의미가 다르다. 전역 함수는 도메인 에러 클래스를 `instanceof` 로 알 수 없어 도달 불가 분기가 된다.

```ts
export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    retry: (failureCount, error) => {
      if (failureCount >= 2) return false;
      // 인증 실패·권한 거부는 재시도 의미 없음
      if (error instanceof UserError && error.code !== 'UNKNOWN') return false;
      return true;
    },
  });
}
```

`useMutation` 도 동일 원칙이다.

## useQuery v5 제약

`useQuery` 는 v5 에서 `onSuccess`/`onError` 가 제거됐다.

- MUST: 파생 값은 `select`(순수 변환)로 만든다.
- MUST: 데이터에 대한 도메인 반응은 렌더 시점에 호출자가 `data` 를 보고 결정한다.
- MUST: toast·명령형 navigate 는 호출자(`ui/`)가 소유한다.

data-source 훅과 use-case 훅 구분, mutate call-site 콜백 패턴은 [`features/CLAUDE.md` — 훅의 두 정체성](../features/CLAUDE.md#훅의-두-정체성) 참조.

## 코드 예시

```tsx
// 정상: props 로 받아 표시만
export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge>{status}</Badge>;
}

// 위반: 인터랙션을 정의. features/ 로 옮긴다
export function OrderStatusBadge({ status, onCancel }) {
  return <Badge onClick={onCancel}>{status}</Badge>;
}
```

```ts
// 위반: 상태 변경 요청을 entities 에 둠. features/cancel-order/api 로
export const cancelOrder = (id: string) => axios.patch(`/orders/${id}/cancel`);

// 위반: entities/A 가 entities/B 를 참조. 조합은 상위 레이어에서
import { Driver } from '@/entities/driver';
```

## Public API

```ts
// entities/order/index.ts
export type { Order, OrderStatus } from './model/types';
export { orderSchema } from './model/types';
export { useOrders, useOrder } from './api/orderApi';
export { OrderStatusBadge } from './ui/OrderStatusBadge';
```

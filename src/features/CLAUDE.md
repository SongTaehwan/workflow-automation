# features/ 레이어

사용자가 의도적으로 수행하는 **액션(동사)** 단위.
"사용자가 버튼을 눌러서 무언가를 바꾼다" — 이 단위가 feature 슬라이스 하나다.

> 백엔드 비유: `@Service` 중에서 **상태를 변경하는** 유스케이스 메서드들의 묶음.
> `OrderService.cancelOrder()`, `OrderService.assignDriver()` 각각이 별도 슬라이스가 된다.

## 이 레이어에 두는 것

| 세그먼트   | 내용                                                                                                                         |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `api/`     | 요청 함수 (주로 POST / PATCH / DELETE, 사용자 액션 GET 포함) **+ TanStack Query 훅(useMutation, 사용자 의도 useQuery 포함)** |
| `model/`   | 에러 처리·폼 검증 로직, Zustand store (feature 전용 클라이언트 상태). **TanStack 훅은 두지 않는다(→ `api/`)**                |
| `ui/`      | 버튼, 모달, 폼 등 사용자 인터랙션 컴포넌트                                                                                   |
| `index.ts` | 외부에 노출할 public API만 re-export                                                                                         |

## 구조

```
src/features/
└── cancel-order/
    ├── api/
    │   ├── cancelOrder.ts        # PATCH /orders/:id/cancel (요청 함수)
    │   └── useCancelOrder.ts     # useMutation 훅, 토스트 처리
    ├── model/
    │   └── store.ts              # Zustand store — feature 전용 클라이언트 상태가 필요한 경우에만
    ├── ui/
    │   └── CancelOrderButton.tsx # 클릭 → useCancelOrder 호출
    └── index.ts
```

## api 함수·파일 네이밍

요청 함수는 **`<verb><Domain>[Qualifier]`** 형태로 명명한다. 도메인 명사 없이 바레 동사(`withdraw`, `activate`)만 쓰면 슬라이스 간 이름 충돌이 발생하고 import 경로만으로 맥락을 파악할 수 없다.

- **요청 함수**: `<verb><Domain>[Qualifier]` — 도메인 명사 포함 필수
- **파일명**: 함수명과 동일. 한 파일에 응집된 쌍(activate + deactivate)은 도메인 그룹 파일로 묶어도 된다(`partnerActivation.ts`)
- **훅**: `use<Fn>` — `useApprovePartnerDocuments`, `useActivatePartner`
- **entities 조회 묶음**: `<domain>Api.ts` (도메인 복수 조회는 entities 레이어)

| 바레 동사 (금지) | 도메인 포함 (정식)        | 파일                            |
| ---------------- | ------------------------- | ------------------------------- |
| `approve`        | `approvePartnerDocuments` | `approvePartnerDocuments.ts`    |
| `activate`       | `activatePartner`         | `partnerActivation.ts` (그룹)   |
| `withdraw`       | `withdrawPartner`         | `withdrawPartner.ts`            |
| `editVehicle`    | `editPartnerVehicle`      | `editPartnerDocument.ts` (그룹) |

## `api/` vs `model/` 개념

| 세그먼트 | 정체성             | 담는 것                                                                                 |
| -------- | ------------------ | --------------------------------------------------------------------------------------- |
| `api/`   | **서버 상태**      | request 함수 + 그 요청을 감싼 **TanStack Query 훅(useMutation, 사용자 의도 useQuery)**. |
| `model/` | **클라 상태·로직** | Zustand store, 폼 검증, 에러 처리 헬퍼. 서버 상태 훅은 두지 않음.                       |

> **TanStack 호출(useQuery/useMutation) 그 자체는 `api/`** (백엔드 상호작용 + 캐시). `model/` 은 서버가 아닌 상태/로직만.
> 사용자 의도로 발생하는 조회(useQuery)도 feature 의 `api/` 에 둔다 — "읽기는 무조건 entities" 가 아니라 **사용자 의도면 features**(아래 휴리스틱 참조).

### 훅의 두 정체성 — data-source 훅 vs use-case 훅

"훅"은 한 덩어리가 아니다. 정체성으로 갈린다:

| 훅 종류            | 정체성     | 하는 일                                                  | 위치     | TanStack             |
| ------------------ | ---------- | -------------------------------------------------------- | -------- | -------------------- |
| **data-source 훅** | 서버 상태  | `useMutation`/`useQuery` 직접 호출 + retry + 캐시 무효화 | `api/`   | 직접 호출            |
| **use-case 훅**    | 유스케이스 | api 함수/훅 + 클라 상태(store·token) + 흐름 조합         | `model/` | **호출 안 함**(소비) |

`useApproveDocuments`(useMutation 직접) → data-source 훅 → `api/`.
`useLogout`·`useLoginWithGoogle`(useMutation 없이 api 함수 + store + 흐름 조합) → use-case 훅 → `model/`.

> 즉 "TanStack 훅 = api/" 는 **TanStack 호출 사이트**에만 적용. 그 위에서 클라 상태를 엮는 use-case 훅은 `model/` 이며 `api/` 를 소비한다.

### UI/UX 부수효과는 호출자(ui/)가 소유

`api/`·`model/` 은 **사용자에게 보이는 부수효과(toast·명령형 navigate)를 소유하지 않는다.** 같은 훅을 여러 화면에서 쓸 때 피드백·이동이 호출처마다 다를 수 있으므로 `ui/` 가 결정한다.

| onSuccess/onError 내용                         | 정체           | 소유                          |
| ---------------------------------------------- | -------------- | ----------------------------- |
| `queryClient.invalidateQueries` / setQueryData | 서버 상태 역학 | `api/` 훅 (내부)              |
| `retry` 네트워크 정책                          | 네트워크       | `api/` 훅                     |
| `toast` 성공/에러 알림                         | UI/UX          | **호출자(ui/)**               |
| `navigate` / 모달 닫기 / 폼 reset              | UI 제어 흐름   | **호출자(ui/)**               |
| 도메인 분기                                    | 도메인 로직    | `entities/model/` 또는 호출자 |

**패턴 — TanStack v5 `mutate(vars, { onSuccess, onError })` call-site 콜백.** v5 는 훅레벨 onSuccess(캐시 무효화)와 mutate콜레벨 onSuccess(toast) **둘 다 호출**하므로 훅 시그니처를 바꿀 필요 없다:

```ts
// api/useApproveDocuments.ts — 서버 상태(캐시)만
export function useApproveDocuments(partnerId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => approveDocuments(partnerId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['partner', partnerId] });
      qc.invalidateQueries({ queryKey: ['partners'] });
    },
  });
}

// ui/ApproveButton.tsx — 호출자가 toast 소유
const { mutate } = useApproveDocuments(partnerId);
const confirm = () =>
  mutate(undefined, {
    onSuccess: () => toast.success('서류를 승인했습니다.'),
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : '승인 처리 중 오류'),
  });
```

> **useQuery 는 v5 에서 `onSuccess`/`onError` 가 제거됨.** 파생은 `select`(순수 변환), 데이터에 대한 도메인 반응은 렌더 시점 호출자가 `data` 를 보고 결정.

ESLint `no-restricted-imports` + hookify `fsd-no-ui-effects-in-api-model` 가 `api/`·`model/` 에서 `sonner`·명령형 navigate(`useNavigate`/`Navigate`/`redirect`) import 를 차단한다. URL 상태 동기화(`useSearchParams`/`useParams`)는 model/ 클라 상태이므로 허용.

> **ui 핸들러 작성**: trivial 1줄(`onClick={() => setOpen(true)}`)은 인라인이 더 명확 — 추출 금지. 다중문이거나 같은 본문이 반복되면 named 로 추출한다(`const closeModal = () => { setOpen(false); reset(); }`). 자동화 불가한 취향 영역이라 룰이 아닌 리뷰 기준(과추출=간접층 노이즈, 중복방치=DRY 위반 둘 다 지양).

## Import 규칙

```
features → entities, shared            ✅
features → widgets, pages, app         ❌
features/A → features/B (cross-slice)  ❌  ← 특히 주의
```

### cross-slice 금지 이유

`features/auth`가 `features/cancel-order`를 알면 둘이 사실상 하나가 된다.
순환 참조 가능성이 생기고, 한쪽을 삭제·수정할 때 다른 쪽이 터진다.

**두 feature가 공통으로 필요한 코드가 생겼다면:**

- 도메인 타입·개념 → `entities/`로 내린다
- 도메인 무관 유틸 → `shared/lib/`으로 내린다
- 둘을 함께 써야 하는 UI → `widgets/`나 `pages/_components/`에서 조합한다

---

### 도메인을 알지만 entities에 적합하지 않은 공유 코드

가장 헷갈리는 케이스다. `Order` 타입을 알고 있어서 `shared/`에 두기 어색하고,
그렇다고 사용자 액션이 아니라서 `features/`에 두기도 애매한 경우다.

#### 판단 질문

> "사용자 액션 없이도 이 코드가 독립적으로 의미를 갖는가?"

- YES → **entities에 둔다.** `features/`에서만 쓰더라도 entities가 맞다.
- NO (반드시 사용자 액션과 함께 의미를 가짐) → 아래 케이스별 처리를 따른다.

#### 케이스 1: 도메인 규칙·권한 체크 (사용자 액션 없음)

도메인 개념을 알지만 그 자체로 "조회·판단"에 해당하면 entities다.
`cancel-order`와 `assign-driver` 모두 주문 수정 권한을 체크해야 할 때:

```ts
// ✅ entities/order/model/permissions.ts
// "이 주문을 수정할 수 있는가" — 사용자 액션 없이 독립적으로 의미 있음
export function canModifyOrder(order: Order, role: UserRole): boolean {
  return order.status !== 'DELIVERED' && role !== 'VIEWER';
}

// features/cancel-order/model/useCancelOrder.ts
import { canModifyOrder } from '@/entities/order';
// features/assign-driver/model/useAssignDriver.ts
import { canModifyOrder } from '@/entities/order';
```

#### 케이스 2: 도메인 에러 코드·메시지 매핑

API 에러 코드가 도메인 개념을 담고 있고 여러 feature에서 공유할 때:

```ts
// ✅ entities/order/model/errors.ts
// 에러 코드 → 사용자 메시지 매핑. 사용자 액션 없이 독립적으로 의미 있음
export const ORDER_ERROR_MESSAGES: Record<string, string> = {
  ORDER_ALREADY_CANCELLED: '이미 취소된 주문입니다.',
  ORDER_LOCKED: '처리 중인 주문은 변경할 수 없습니다.',
};

// features/cancel-order, features/assign-driver 모두 import 가능
import { ORDER_ERROR_MESSAGES } from '@/entities/order';
```

#### 케이스 3: 두 feature의 액션이 연관된 UI

"취소 후 재배정" 같이 두 feature의 액션을 순서대로 실행해야 하는 UI.
이건 feature끼리 서로 알아야 하는 게 아니라 **상위 레이어에서 조합하는 문제**다.

```
// ❌ features/cancel-order가 features/assign-driver를 import
features/cancel-order → features/assign-driver

// ✅ 상위 레이어가 두 feature를 독립적으로 조합
widgets/order-actions/ui/OrderActions.tsx
  ├── import { CancelOrderButton } from '@/features/cancel-order'
  └── import { AssignDriverButton } from '@/features/assign-driver'
```

#### 케이스 4: 공유 폼 스키마 (도메인 타입 포함)

여러 feature의 폼이 동일한 도메인 필드를 검증할 때:

```ts
// ✅ entities/order/model/types.ts 에 기본 스키마 정의
export const orderIdSchema = z.string().uuid();
export const driverIdSchema = z.string().uuid();

// features/cancel-order/model/schema.ts — 액션 전용 추가 필드 조합
import { orderIdSchema } from '@/entities/order';
const cancelSchema = z.object({
  orderId: orderIdSchema,
  reason: z.string().min(1),
});

// features/assign-driver/model/schema.ts
import { orderIdSchema, driverIdSchema } from '@/entities/order';
const assignSchema = z.object({
  orderId: orderIdSchema,
  driverId: driverIdSchema,
});
```

#### 요약

| 공유 코드 성격                    | 배치                                 |
| --------------------------------- | ------------------------------------ |
| 도메인 규칙·권한 판단 (액션 없음) | `entities/<slice>/model/`            |
| 도메인 에러 코드·상수             | `entities/<slice>/model/`            |
| 도메인 기본 스키마·타입           | `entities/<slice>/model/`            |
| 두 feature 액션의 UI 조합         | `widgets/` 또는 `pages/_components/` |
| 도메인 무관 패턴·유틸             | `shared/lib/`                        |

## 도메인 에러

각 feature 슬라이스는 자기 도메인 에러 클래스를 **`model/errors.ts`** 에 정의하고 (강제, entities 와 동일), `api/` 가 DataSourceError → 도메인 에러로 번역한다.

- bare axios 사용 슬라이스 (인터셉터 우회 — 현재 `auth`)는 `toDataSourceError(err)` 를 먼저 호출해 정규화한 뒤 `mapErrorByCode` 로 번역
- `httpClient()` 사용 슬라이스는 인터셉터가 정규화한 DataSourceError 를 받아 곧바로 `mapErrorByCode` 호출

### 에러 변환 mapper 네이밍·분리

- 변환 함수는 **`to<Domain>Error(err)`** 로 명명한다 (`toLoginError`, `toPartnerError`). DataSourceError 를 받아 슬라이스 도메인 에러로 번역.
- **인라인 기본**: request 1개·byCode 작으면 api 요청 파일 안에 둔다.
- **분리**: byCode 가 크거나 request 함수가 여러 개여서 파일이 커지면 `api/errorMapper.ts` 로 분리하고 `to<Domain>Error` 를 export 한다.
- `httpClient` 는 `@/shared/api` 에서 직접 import (mapper 파일에서 재export 금지).
- bare axios 슬라이스는 `toDataSourceError` 선행 정규화 후 `mapErrorByCode` 호출.

```ts
// features/auth/model/errors.ts — 슬라이스별 도메인 에러 클래스
export class LoginError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'LoginError';
  }
}
// features/auth/api/loginWithGoogle.ts — 클래스는 import, mapper 는 api/ 소유
import { LoginError } from '../model/errors';
```

DataSourceError → 도메인 에러 변환 헬퍼(`toLoginError`)의 `mapErrorByCode` byCode/apiFallback/fallback 3축 작성법은 [`shared/CLAUDE.md` — mapErrorByCode](../shared/CLAUDE.md#슬라이스의-도메인-에러-번역--maperrorbycode) 에 동일 예제로 있다 — 중복 방지를 위해 단일 출처를 따른다.

`err.message` 는 `ui/` 컴포넌트가 그대로 토스트에 노출한다(toast 는 호출자 소유 — 위 [UI/UX 부수효과](#uiux-부수효과는-호출자ui가-소유)). 메시지는 이미 슬라이스가 사용자용으로 결정한 결과다.

`useMutation` 의 retry 정책도 호출 시점에 슬라이스가 지정한다 (`queryClient` 에 전역 정책 없음). 원칙·추출 트리거는 [`entities/CLAUDE.md` — Retry 정책](../entities/CLAUDE.md#retry-정책) 참조.

전체 규칙은 [`shared/CLAUDE.md` — 에러 매핑 규칙](../shared/CLAUDE.md#에러-매핑-규칙-data-source--domain) 참조.

## Public API (index.ts)

```ts
// features/cancel-order/index.ts
export { CancelOrderButton } from './ui/CancelOrderButton';
export { useCancelOrder } from './api/useCancelOrder';
export type { CancelOrderParams } from './api/useCancelOrder';
```

외부에서는 슬라이스 내부 경로를 직접 참조하지 않는다.

```ts
// ✅
import { CancelOrderButton } from '@/features/cancel-order';

// ❌
import { CancelOrderButton } from '@/features/cancel-order/ui/CancelOrderButton';
```

## HTTP 메서드 휴리스틱

```
POST / PATCH / DELETE → features/  (사용자 액션)
GET                   → entities/  (자동 조회)

예외: GET /orders/export → 사용자가 버튼 클릭 → features/
예외: POST /auth/refresh → 자동 토큰 갱신   → shared/api/
```

핵심은 메서드가 아니라 **"사용자가 의도한 행동인가"** 다.

## 체크리스트 — features에 넣기 전

- [ ] 사용자가 의도적으로 발생시키는 액션인가? (클릭, 폼 제출)
- [ ] 하나의 사용자 액션에만 대응하는 단일 책임인가?
- [ ] UI라면 인터랙션(클릭, 폼 제출)을 직접 처리하는가?
- [ ] API라면 상태를 변경하는 요청인가?

## 흔한 실수

```ts
// ❌ 다른 feature import (cross-slice)
// features/cancel-order/model/useCancelOrder.ts
import { useCurrentUser } from '@/features/auth'; // 금지

// ✅ 공유 개념은 entities에서 참조
import { useCurrentUser } from '@/entities/user';

// ❌ GET 요청을 features에 두기
export const getOrder = () => axios.get('/orders/:id'); // → entities/order/api 로

// ✅ 상태 변경만
export const cancelOrder = (id: string) => axios.patch(`/orders/${id}/cancel`);
```

# features/ 레이어

사용자가 의도적으로 수행하는 액션(동사) 단위. "사용자가 버튼을 눌러서 무언가를 바꾼다" 가 슬라이스 하나다.

아래 경로 중 일부는 아직 존재하지 않는다. 목표 구조를 전제로 작성됐다.

## 세그먼트 규약

| 세그먼트   | 담는 것                                                                      |
| ---------- | ---------------------------------------------------------------------------- |
| `api/`     | 요청 함수 + TanStack 훅(`useMutation`, 사용자 의도 `useQuery`)               |
| `model/`   | 폼 검증, 에러 처리 헬퍼, use-case 훅, Zustand store (feature 전용 클라 상태) |
| `ui/`      | 버튼·모달·폼 등 사용자 인터랙션 컴포넌트                                     |
| `index.ts` | public API 만 re-export                                                      |

- MUST: TanStack 훅은 `api/` 에서만 직접 호출한다.
- MUST: 사용자 의도로 발생하는 조회(`useQuery`)도 feature 의 `api/` 에 둔다.

판별식: `api/` 는 "서버와 어떻게 대화하는가", `model/` 은 "서버가 아닌 상태와 로직".

## 네이밍

- MUST: 요청 함수는 `<verb><Domain>[Qualifier]` 로 명명한다. 도메인 명사를 반드시 포함한다. 바레 동사(`withdraw`, `activate`)만 쓰는 것은 금지다.
- MUST: 파일명은 함수명과 동일하게 한다. 응집된 쌍(activate + deactivate)은 도메인 그룹 파일로 묶어도 된다.
- MUST: 훅은 `use<Fn>` 으로 명명한다.

판별 근거: 바레 동사는 슬라이스 간 이름이 충돌하고, import 경로만으로 맥락을 알 수 없다.

| 바레 동사 (위반) | 도메인 포함 (정상)        | 파일                          |
| ---------------- | ------------------------- | ----------------------------- |
| `approve`        | `approvePartnerDocuments` | `approvePartnerDocuments.ts`  |
| `activate`       | `activatePartner`         | `partnerActivation.ts` (그룹) |
| `withdraw`       | `withdrawPartner`         | `withdrawPartner.ts`          |

## 훅의 두 정체성

"훅" 은 한 덩어리가 아니다. 정체성으로 갈린다.

| 훅 종류        | 하는 일                                                 | 위치     | TanStack 호출 |
| -------------- | ------------------------------------------------------- | -------- | ------------- |
| data-source 훅 | `useMutation`/`useQuery` 직접 호출 + retry + 캐시무효화 | `api/`   | 직접 호출     |
| use-case 훅    | api 함수·훅 + 클라 상태(store·token) + 흐름 조합        | `model/` | 호출 안 함    |

`useApproveDocuments`(useMutation 직접 호출)는 data-source 훅이므로 `api/`.
`useLogout`·`useLoginWithGoogle`(api 함수 + store + 흐름 조합)은 use-case 훅이므로 `model/`.

판별식: **TanStack 을 직접 호출하는 사이트인가.** 그 위에서 클라 상태를 엮는 훅은 `model/` 이며 `api/` 를 소비한다.

## UI 부수효과 소유권

- MUST: 사용자에게 보이는 부수효과(toast, 명령형 navigate, 모달 닫기, 폼 reset)는 호출자(`ui/`)가 소유한다.
- MUST: 서버 상태 역학(캐시 무효화, retry)은 `api/` 훅이 소유한다.

판별 근거: 같은 훅을 여러 화면에서 쓸 때 피드백과 화면 이동이 호출처마다 다르다.

| onSuccess/onError 내용               | 소유                          |
| ------------------------------------ | ----------------------------- |
| `invalidateQueries` / `setQueryData` | `api/` 훅                     |
| `retry` 네트워크 정책                | `api/` 훅                     |
| `toast` 성공·에러 알림               | 호출자 (`ui/`)                |
| `navigate` / 모달 닫기 / 폼 reset    | 호출자 (`ui/`)                |
| 도메인 분기                          | `entities/model/` 또는 호출자 |

패턴: TanStack v5 는 훅레벨 `onSuccess`(캐시 무효화)와 `mutate` 콜레벨 `onSuccess`(toast)를 **둘 다 호출**한다. 훅 시그니처를 바꿀 필요가 없다.

```ts
// api/useApproveDocuments.ts — 서버 상태만
export function useApproveDocuments(partnerId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => approveDocuments(partnerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner', partnerId] });
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

URL 상태 동기화(`useSearchParams`/`useParams`)는 클라이언트 상태이므로 `model/` 에서 허용한다.

### ui 핸들러 추출

- MUST: 한 줄짜리 핸들러(`onClick={() => setOpen(true)}`)는 인라인으로 두고 추출하지 않는다.
- MUST: 다중문이거나 같은 본문이 반복되면 named 함수로 추출한다.

자동화 불가한 영역이라 리뷰 기준으로 둔다. 과추출은 간접층 노이즈, 중복 방치는 DRY 위반이다.

## 공유 코드 배치

두 feature 가 같은 코드를 필요로 할 때의 판별 질문:

> 사용자 액션 없이도 이 코드가 독립적으로 의미를 갖는가?

- YES: `entities/` 에 둔다. `features/` 에서만 쓰더라도 entities 가 맞다.
- NO: 아래 표를 따른다.

| 공유 코드 성격                    | 배치                                 |
| --------------------------------- | ------------------------------------ |
| 도메인 규칙·권한 판단 (액션 없음) | `entities/<slice>/model/`            |
| 도메인 에러 코드·상수             | `entities/<slice>/model/`            |
| 도메인 기본 스키마·타입           | `entities/<slice>/model/`            |
| 두 feature 액션의 UI 조합         | `widgets/` 또는 `pages/_components/` |
| 도메인 무관 패턴·유틸             | `shared/lib/`                        |

```ts
// 정상: entities/order/model/permissions.ts
// 사용자 액션 없이 독립적으로 의미 있음 -> entities
export function canModifyOrder(order: Order, role: UserRole): boolean {
  return order.status !== OrderStatus.DELIVERED && role !== UserRole.VIEWER;
}

// 정상: 여러 feature 가 entities 에서 참조
import { canModifyOrder } from '@/entities/order';
```

## 도메인 에러

- MUST: 슬라이스 도메인 에러 클래스를 `model/errors.ts` 에 정의한다.
- MUST: `api/` 가 `DataSourceError` 를 도메인 에러로 번역한다.
- MUST: 변환 함수는 `to<Domain>Error(err)` 로 명명한다.
- MUST: bare axios 슬라이스는 `toDataSourceError` 로 선행 정규화한 뒤 `mapErrorByCode` 를 호출한다.
- MUST: `httpClient()` 슬라이스는 인터셉터가 정규화한 값을 받아 곧바로 `mapErrorByCode` 를 호출한다.

인라인·분리 기준은 [`entities/CLAUDE.md` — 도메인 에러](../entities/CLAUDE.md#도메인-에러) 와 동일하다.
`mapErrorByCode` 3축 작성법은 [`shared/CLAUDE.md` — 에러 매핑 규칙](../shared/CLAUDE.md#에러-매핑-규칙) 이 단일 출처다. 충돌 시 그쪽이 우선한다.

retry 정책은 [`entities/CLAUDE.md` — Retry 정책](../entities/CLAUDE.md#retry-정책) 과 동일하다.

## features 에 넣기 전 확인

- 사용자가 의도적으로 발생시키는 액션인가?
- 하나의 사용자 액션에만 대응하는 단일 책임인가?
- UI 라면 인터랙션을 직접 처리하는가?
- API 라면 상태를 변경하거나 사용자 의도로 발생하는 요청인가?

## Public API

```ts
// features/cancel-order/index.ts
export { CancelOrderButton } from './ui/CancelOrderButton';
export { useCancelOrder } from './api/useCancelOrder';
export type { CancelOrderParams } from './api/useCancelOrder';
```

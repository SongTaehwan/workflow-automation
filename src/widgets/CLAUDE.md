# widgets/ 레이어

여러 페이지에서 재사용되는 독립 UI 블록. 하나 이상의 `features`·`entities` 를 조합한다.

이 레이어는 아직 비어 있다. 목표 구조를 전제로 작성됐다.

## 세그먼트 규약

| 세그먼트   | 담는 것                                            |
| ---------- | -------------------------------------------------- |
| `ui/`      | 조합 컴포넌트                                      |
| `model/`   | 위젯 전용 클라이언트 상태, 표시 조건 판단          |
| `api/`     | 위젯 자체가 소유하는 조회. 슬라이스 훅 소비가 우선 |
| `index.ts` | public API 만 re-export                            |

- MUST: 여러 feature 를 조합해야 하는 UI 는 widget 이 소유한다. feature 끼리 직접 참조하지 않는다.
- MUST: 비즈니스 규칙은 `entities/<slice>/model/` 의 판단 함수를 소비한다. 위젯이 새로 정의하지 않는다.

## 판단 기준

### widgets 인가 pages/_components 인가

판별 질문: **두 개 이상의 페이지에서 쓰이는가.**

- YES: `widgets/`.
- NO: `pages/<slice>/_components/` 에 두고, 두 번째 사용처가 생기면 승격한다.

미리 올리지 않는다. 재사용 예상만으로 승격하면 쓰이지 않는 추상이 남는다.

### widgets 인가 features 인가

판별 질문: **단일 사용자 액션에만 대응하는가.**

- YES: `features/`. 액션 하나가 슬라이스 하나다.
- NO (여러 액션·조회를 한 화면 영역으로 묶음): `widgets/`.

```tsx
// 정상: widget 이 독립 feature 들을 조합
// widgets/order-actions/ui/OrderActions.tsx
import { CancelOrderButton } from '@/features/cancel-order';
import { AssignDriverButton } from '@/features/assign-driver';

// 위반: feature 가 다른 feature 를 참조
// features/cancel-order/ui/CancelOrderButton.tsx
import { AssignDriverButton } from '@/features/assign-driver';
```

## 접근 정책

사이드바 등 역할 기반으로 노출을 제어하는 위젯은 **deny-by-default** 로 작성한다.

- MUST: 공개 항목은 `@/entities/user` 의 `PUBLIC` 상수를 import 해서 명시한다. `'public'` 문자열 리터럴은 금지다.
- MUST: 역할 비교는 `UserRole` 상수로 한다.

판별 근거: 타입은 `'public'` 리터럴을 통과시키므로 오타를 잡지 못한다. 상수 import 여야 참조 무결성이 생긴다.

```ts
// 정상
import { PUBLIC, UserRole } from '@/entities/user';

const navItems = [
  { path: '/login', allowedRoles: PUBLIC },
  { path: '/settings', allowedRoles: [UserRole.OWNER] },
];

// 위반: 매직 스트링
const navItems = [{ path: '/login', allowedRoles: 'public' }];
```

## widgets 에 넣기 전 확인

- 두 개 이상의 페이지에서 쓰이는가? 아니면 `pages/<slice>/_components/`.
- 여러 feature·entity 를 조합하는가? 단일 액션이면 `features/`.
- 도메인 판단 로직을 새로 정의하고 있지 않은가? `entities/<slice>/model/` 에서 가져온다.

## Public API

```ts
// widgets/order-actions/index.ts
export { OrderActions } from './ui/OrderActions';
```

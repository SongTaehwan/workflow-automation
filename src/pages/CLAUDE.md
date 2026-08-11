# pages/ 레이어

URL과 화면을 연결하는 레이어. **최대한 얇게** 유지한다.

> 백엔드 비유: Spring MVC의 `@Controller`. URL 파라미터를 받아 서비스에 넘기고 뷰를 반환한다.
> 비즈니스 로직은 없고, 위임(delegation)만 한다.

## 이 레이어에 두는 것

- URL 파라미터·쿼리스트링 추출
- `widgets/` 조합 (페이지 레이아웃 구성)
- 접근 제어 (인증 여부 확인 후 리다이렉트)
- 페이지 전용 조합 컴포넌트 (`_components/`)

## 구조

```
src/pages/
├── orders/
│   ├── ui/
│   │   └── OrdersPage.tsx          # 페이지 컴포넌트
│   └── _components/                # 이 페이지에서만 쓰이는 조합 컴포넌트
│       └── OrderTableWithFilters.tsx
└── login/
    └── ui/
        └── LoginPage.tsx
```

## Public API (`index.ts`) — default → named 재export

페이지 컴포넌트는 `ui/` 에서 **`export default function`** 으로 정의하고, 슬라이스 `index.ts` 에서 **`export { default as <Name>Page }`** 로 재export 한다 (`DeliveriesPage`·`PartnerDetailPage`·`LoginPage` 등 전부 동일). router 는 named import 으로 일관 소비한다.

```ts
// ✅ ui/DeliveryStatusPage.tsx
export default function DeliveryStatusPage() { ... }
// ✅ index.ts
export { default as DeliveryStatusPage } from './ui/DeliveryStatusPage';

// ❌ named export 직접 — index.ts 에서 `export { DeliveryStatusPage } from ...`
```

> 이중 강제: 편집 시점 hookify `fsd-pages-default-export`(warn) 넛지 + lint·CI 시점 ESLint `no-restricted-syntax`(error, `pages/*/index.ts`) 차단.

## Import 규칙

```
pages → widgets, features, entities, shared  ✅
pages → app                                  ❌
pages/A → pages/B (cross-slice)              ❌
```

### 벤더 SDK·HTTP·스키마 라이브러리 직접 import 금지

페이지는 다음 패키지를 **직접** import하면 안 된다 — 모두 feature 내부 구현 디테일이다:

| 금지 import                                | 이유                                            | 올바른 위치                  |
| ------------------------------------------ | ----------------------------------------------- | ---------------------------- |
| `axios`                                    | HTTP 호출은 사용자 액션 → `features/*/api/`     | `features/` 또는 `entities/` |
| `zod`                                      | 응답 스키마는 API 호출과 같은 레이어            | api 파일이 있는 슬라이스     |
| `@react-oauth/google`, OAuth Provider 류   | 인증 SDK는 로그인 액션 feature가 캡슐화         | `features/auth/`             |
| 결제·지도·분석 SDK (Stripe, Mapbox, GA 등) | 액션과 결합된 SDK는 해당 feature가 Provider까지 | `features/<action>/ui/`      |

**판단 기준**: "이 라이브러리가 사용자 액션과 결합되어 있는가?" YES → feature가 Provider·핸들러·SDK 호출을 전부 흡수해야 함. 페이지는 `<XxxButton />` 한 줄 렌더만.

```tsx
// ❌ 페이지가 OAuth Provider/client ID/SDK를 직접 다룸
import { GoogleOAuthProvider } from '@react-oauth/google';
import { env } from '@/shared/config/env';

export default function LoginPage() {
  return (
    <GoogleOAuthProvider clientId={env.VITE_GOOGLE_CLIENT_ID}>
      <LoginForm />
    </GoogleOAuthProvider>
  );
}

// ✅ feature가 Provider·client ID·SDK를 완전 캡슐화. 페이지는 모름.
import { GoogleLoginButton } from '@/features/auth';

export default function LoginPage() {
  return <LoginForm />; // 내부에서 <GoogleLoginButton /> 렌더
}
```

## `_components/` 규칙

특정 페이지 전용으로 `entities`, `features` 중 하나 이상을 조합한 컴포넌트는 `_components/`에 둔다.
다른 페이지에서도 쓰이게 되면 그때 `widgets/`로 승격한다. 미리 올리지 않는다.

```
pages/orders/_components/OrderTableWithFilters.tsx
  → orders 페이지에서만 사용 중 → 여기 유지

여러 페이지에서 쓰이게 되면
  → widgets/order-table/ 로 이동
```

## 접근 제어·인증 체크

페이지가 직접 인증 상태를 읽고 리다이렉트하는 것은 **pages의 정당한 책임**이다.
단, API 호출 로직은 `entities/user` 또는 `features/auth`에 있어야 하고, 페이지는 그 결과만 소비한다.

```tsx
// ✅ entities/user 훅으로 인증 상태 읽기 → 리다이렉트 판단은 페이지 책임
export function OrdersPage() {
  const { user, isLoading } = useCurrentUser(); // entities/user 훅
  if (isLoading) return <Spinner />;
  if (!user) return <Navigate to="/login" />;
  return <OrderTableWidget />;
}

// ✅ 역할 기반 접근 제어 (role 값은 UserRole 상수 사용 — 'OWNER'/'OPS'/'VIEWER' 리터럴 직접 비교 금지)
export function AdminSettingsPage() {
  const { user } = useCurrentUser();
  if (user?.role !== UserRole.admin) return <Navigate to="/" />;
  return <AdminSettingsWidget />;
}

// ❌ 페이지에서 axios 직접 호출로 인증 체크
export function OrdersPage() {
  useEffect(() => {
    axios.get('/auth/me').then(...); // API 로직은 entities/user/api 에서
  }, []);
}
```

## 체크리스트

- [ ] `axios`를 페이지에서 직접 호출하고 있지는 않은가? (→ `features/` 또는 `entities/`의 훅으로)
- [ ] 비즈니스 판단 로직이 들어있지는 않은가? (→ `features/model/`로)
- [ ] 인증·권한 체크라면 API 로직 자체는 `entities/user`나 `features/auth` 훅에 있는가?
- [ ] 이 조합 컴포넌트가 다른 페이지에서도 쓰이는가? (→ `widgets/`로 승격)
- [ ] 벤더 SDK·Provider(`@react-oauth/google` 등)나 `zod`를 직접 import하고 있지는 않은가? (→ 해당 feature가 캡슐화)

## 흔한 실수

```tsx
// ❌ 페이지에서 axios 직접 호출
export function OrdersPage() {
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    axios.get('/orders').then((res) => setOrders(res.data)); // → entities/order 훅으로
  }, []);
  const handleCancel = async (id: string) => {
    await axios.patch(`/orders/${id}/cancel`); // → features/cancel-order 훅으로
  };
}

// ✅ 훅은 entities/features에서, 페이지는 조합·판단만
export function OrdersPage() {
  const { user } = useCurrentUser(); // entities — 인증 상태 읽기
  if (!user) return <Navigate to="/login" />;
  return <OrderTableWidget />; // widgets 조합
}
```

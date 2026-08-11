# app/ 레이어

앱 전역 초기화 레이어. 라우터, Provider 조합, 글로벌 스타일만 담는다.

> 백엔드 비유: Spring의 `Application.java` + `WebMvcConfigurer` + `SecurityConfig` 조합.
> 비즈니스 로직 없이 설정과 초기화만 있는 곳이다.

## 이 레이어에 두는 것

- QueryClient 인스턴스 등 앱 단위 설정 (`config/`)
- React Router 라우트 정의 (`router/`)
- 전역 Provider 조합 — QueryClient, Toaster 등 (`providers/`, 추가 예정)
- 글로벌 CSS — CSS 변수, 폰트, reset (`theme/`)

> 환경변수 파서(`env.ts`)는 app 이 아니라 `src/shared/config/` 에 있다 — 전 레이어가 import 해야 하는데 app 은 최상위라 하위가 import 못 하기 때문. 아래 "환경변수" 참조.

## 현재 구조

```
src/app/
├── config/
│   └── queryClient.ts  # TanStack QueryClient 인스턴스
├── router/
│   └── router.tsx      # React Router 라우트 정의
└── theme/
    └── index.css       # Tailwind + shadcn CSS 변수, Noto Sans 폰트
```

## Import 규칙

`app/`은 최상위 레이어로 모든 레이어를 import할 수 있다.

```
app → pages, widgets, features, entities, shared  ✅
```

`app/` 내부 세그먼트 간 import는 자유롭다.

## 환경변수 (env)

env 파서는 `src/shared/config/env.ts` 에 있다 (app 아님 — 위 이유 참조). 모든 레이어가 `@/shared/config/env` 로 import 한다.

```ts
import { env } from '@/shared/config/env';

env.VITE_API_BASE_URL; // 타입 보장, 누락 시 앱 시작 전 throw
```

환경변수를 추가할 때 `env.ts`의 `EnvSchema`에 필드를 추가한다.  
`as string` 캐스팅이나 `import.meta.env.VITE_*` 직접 참조는 금지다.

## 체크리스트

새 파일을 만들기 전에:

- [ ] 앱 전체에 딱 한 번 초기화되는 코드인가?
- [ ] 특정 페이지나 기능에 종속되지 않는가?

NO라면 `pages/`, `widgets/`, `features/` 중 적합한 레이어에 배치한다.

## 흔한 실수

```ts
// ❌ app/router에서 데이터 페칭
const router = createBrowserRouter([
  {
    path: '/orders',
    element: <OrdersPage />,
    loader: async () => {
      const orders = await fetchOrders(); // → entities/order/api 로
      return orders;
    },
  },
]);

// ✅ 라우트 정의만. 데이터 페칭은 페이지 컴포넌트 내부에서
const router = createBrowserRouter([
  { path: '/orders', element: <OrdersPage /> },
  { path: '/login', element: <LoginPage /> },
]);

// ❌ 환경변수 직접 참조
const baseUrl = import.meta.env.VITE_API_BASE_URL as string;

// ✅ env 객체 사용
import { env } from '@/shared/config/env';
const baseUrl = env.VITE_API_BASE_URL;
```

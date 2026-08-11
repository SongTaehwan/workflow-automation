# app/ 레이어

앱 전역 초기화 레이어. 라우터, Provider 조합, 글로벌 스타일만 담는다.

아래 경로 중 일부는 아직 존재하지 않는다. 목표 구조를 전제로 작성됐다.

## 세그먼트 규약

| 세그먼트     | 담는 것                                        |
| ------------ | ---------------------------------------------- |
| `config/`    | 앱 단위 인스턴스 생성. QueryClient, SDK 초기화 |
| `router/`    | 라우트 정의만                                  |
| `providers/` | 전역 Provider 조합                             |
| `theme/`     | 글로벌 CSS. CSS 변수, 폰트, reset              |

- MUST: 앱 전체에서 정확히 한 번 실행되는 코드만 둔다.
- MUST: 데이터 페칭은 `entities/<slice>/api/` 에 둔다. 라우트 정의에는 경로와 element 만 쓴다.
- MUST: 비즈니스 로직은 `features/` 또는 `entities/` 에 둔다.

## 판단 기준

새 파일을 `app/` 에 두기 전에 두 질문에 모두 YES 여야 한다.

- 앱 전체에 딱 한 번 초기화되는 코드인가?
- 특정 페이지나 기능에 종속되지 않는가?

하나라도 NO 면 `pages/`, `widgets/`, `features/` 중 적합한 레이어에 배치한다.

`app` 은 최상위 레이어다. **하위 레이어가 `app` 을 import 할 수 없다.** 여러 레이어가 함께 써야 하는 코드는 `app` 이 아니라 `shared/` 에 둔다. 환경변수 파서(`env.ts`)와 ThemeProvider 가 `shared/` 에 있는 이유다.

## 환경변수

- MUST: `@/shared/config/env` 의 `env` 객체로만 접근한다. `import.meta.env.VITE_*` 직접 참조는 금지다.
- MUST: 타입은 `EnvSchema` 가 보장한다. `as string` 으로 캐스팅하지 않는다.
- MUST: 환경변수를 추가할 때 `env.ts` 의 `EnvSchema` 에 필드를 먼저 추가한다.

```ts
// 위반: 타입 보장 없음, 누락을 런타임에야 발견
const baseUrl = import.meta.env.VITE_API_BASE_URL as string;

// 정상: 타입 보장, 누락 시 앱 시작 전 throw
import { env } from '@/shared/config/env';
const baseUrl = env.VITE_API_BASE_URL;
```

## 코드 예시

```ts
// 위반: 라우트 정의가 데이터 페칭을 소유
const router = createBrowserRouter([
  {
    path: '/orders',
    element: <OrdersPage />,
    loader: async () => fetchOrders(),
  },
]);

// 정상: 라우트 정의만. 페칭은 페이지 컴포넌트 내부에서
const router = createBrowserRouter([
  { path: '/orders', element: <OrdersPage /> },
  { path: '/login', element: <LoginPage /> },
]);
```

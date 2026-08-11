# pages/ 레이어

URL 과 화면을 연결하는 레이어. 최대한 얇게 유지한다.

아래 경로 중 일부는 아직 존재하지 않는다. 목표 구조를 전제로 작성됐다.

## 세그먼트 규약

| 세그먼트       | 담는 것                                              |
| -------------- | ---------------------------------------------------- |
| `ui/`          | 페이지 컴포넌트. `export default function` 으로 정의 |
| `_components/` | 이 페이지에서만 쓰이는 조합 컴포넌트                 |
| `index.ts`     | `export { default as <Name>Page }` 재export          |

- MUST: URL 파라미터·쿼리스트링 추출, `widgets/` 조합, 접근 제어만 담는다.
- MUST: 비즈니스 판단 로직은 `features/<slice>/model/` 에 둔다.
- MUST: HTTP 호출은 `entities/` 또는 `features/` 훅으로만 한다.

## 판단 기준

### 벤더 SDK 를 페이지가 다뤄도 되는가

판별 질문: **이 라이브러리가 사용자 액션과 결합되어 있는가.**

YES 면 feature 가 Provider·핸들러·SDK 호출을 전부 흡수한다. 페이지는 `<XxxButton />` 한 줄만 렌더한다.

```tsx
// 위반: 페이지가 OAuth Provider 와 client ID 를 직접 다룸
import { GoogleOAuthProvider } from '@react-oauth/google';
import { env } from '@/shared/config/env';

export default function LoginPage() {
  return (
    <GoogleOAuthProvider clientId={env.VITE_GOOGLE_CLIENT_ID}>
      <LoginForm />
    </GoogleOAuthProvider>
  );
}

// 정상: feature 가 Provider·client ID·SDK 를 완전 캡슐화. 페이지는 모름
import { GoogleLoginButton } from '@/features/auth';

export default function LoginPage() {
  return <LoginForm />; // 내부에서 <GoogleLoginButton /> 렌더
}
```

### `_components/` 인가 `widgets/` 인가

- MUST: `entities`·`features` 중 하나 이상을 조합했고 한 페이지에서만 쓰이면 `_components/` 에 둔다.
- MUST: 다른 페이지에서도 쓰이게 된 시점에 `widgets/` 로 승격한다.
- MUST: 재사용을 예상해서 미리 올리지 않는다.

### 접근 제어

인증 상태를 읽고 리다이렉트를 판단하는 것은 pages 의 정당한 책임이다.

- MUST: 인증 상태는 `entities/user` 또는 `features/auth` 훅으로만 읽는다.
- MUST: 역할 비교는 `UserRole` 상수로 한다. 문자열 리터럴 직접 비교는 금지다.

```tsx
// 정상: 훅으로 상태를 읽고, 리다이렉트 판단만 페이지가 소유
export default function OrdersPage() {
  const { user, isLoading } = useCurrentUser();
  if (isLoading) return <Spinner />;
  if (!user) return <Navigate to="/login" />;
  return <OrderTableWidget />;
}

// 정상: 역할 비교는 상수로
export default function AdminSettingsPage() {
  const { user } = useCurrentUser();
  if (user?.role !== UserRole.OWNER) return <Navigate to="/" />;
  return <AdminSettingsWidget />;
}

// 위반: 페이지가 인증 API 를 직접 호출
export default function OrdersPage() {
  useEffect(() => {
    axios.get('/auth/me').then(...);
  }, []);
}
```

## pages 에 넣기 전 확인

- HTTP 를 페이지에서 직접 호출하고 있지 않은가?
- 비즈니스 판단 로직이 들어있지 않은가?
- 인증·권한 체크라면 API 호출 자체는 `entities/user` 나 `features/auth` 훅에 있는가?
- 이 조합 컴포넌트가 다른 페이지에서도 쓰이는가? 그렇다면 `widgets/` 로 승격한다.
- 벤더 SDK·Provider 를 직접 import 하고 있지 않은가?

## 코드 예시

```tsx
// 위반: 페이지가 데이터 페칭과 액션을 모두 소유
export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    axios.get('/orders').then((res) => setOrders(res.data));
  }, []);
  const handleCancel = async (id: string) => {
    await axios.patch(`/orders/${id}/cancel`);
  };
}

// 정상: 훅은 entities·features 에서, 페이지는 조합과 판단만
export default function OrdersPage() {
  const { user } = useCurrentUser();
  if (!user) return <Navigate to="/login" />;
  return <OrderTableWidget />;
}
```

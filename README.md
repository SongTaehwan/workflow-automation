# workflow-automation

React + TypeScript + Vite + shadcn/ui.

> **FSD 구조 규칙을 ESLint 로 정적으로 판정하고, 개발·커밋·푸시·CI·머지 단계에 중첩 배치한 harness 로 강제한다.**

무엇을 어느 도구가 강제하는지는 [`docs/rules/rules-map.md`](docs/rules/rules-map.md) 에 정리돼 있다.
레이어별 배치 규약은 `src/<layer>/CLAUDE.md` 를 참조한다.

## Adding components

To add components to your app, run the following command:

```bash
npx shadcn@latest add button
```

This will place the ui components in the `src/shared/ui` directory (see `components.json`).

## Using components

To use the components in your app, import them as follows:

```tsx
import { Button } from '@/shared/ui/button';
```

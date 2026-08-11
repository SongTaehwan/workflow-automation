import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import importX from 'eslint-plugin-import-x';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import boundaries from 'eslint-plugin-boundaries';
import { defineConfig, globalIgnores } from 'eslint/config';

// 슬라이스 내부 경로 직접 import 금지 — public API 배럴만 허용.
// no-restricted-imports 는 옵션이 병합되지 않고 통째로 덮어써지므로,
// 이 룰을 재정의하는 모든 블록이 이 배열을 다시 펼쳐야 한다.
const publicApiPatterns = [
  {
    group: ['@/entities/*/**'],
    message:
      'entities 내부 경로 직접 import 금지. @/entities/<slice> public API를 사용하세요.',
  },
  {
    group: ['@/pages/*/**'],
    message:
      'pages 내부 경로 직접 import 금지. @/pages/<slice> public API를 사용하세요.',
  },
  {
    group: ['@/widgets/*/**'],
    message:
      'widgets 내부 경로 직접 import 금지. @/widgets/<slice> public API를 사용하세요.',
  },
  {
    group: ['@/features/*/**'],
    message:
      'features 내부 경로 직접 import 금지. @/features/<slice> public API를 사용하세요.',
  },
  {
    group: ['@/shared/api/*/**'],
    message:
      'shared/api 내부 경로 직접 import 금지. @/shared/api 배럴만 사용하세요 (shared/api/CLAUDE.md).',
  },
];

export default defineConfig([
  // dist·coverage 는 빌드/리포트 산출물. 아래 `**/*.js` 블록이 이들을 집어삼키지 않게 막는다.
  globalIgnores(['dist', 'coverage']),
  // 설정 파일 등 저장소의 모든 .js — Node ESM.
  // 루트만 잡으면 중첩 .js 가 룰 0개로 통과하므로 `**` 로 넓힌다.
  // src/ 는 TS 전용이라 FSD·네이밍 룰은 여기 붙이지 않는다(아래 boundaries 블록이 배치를 강제).
  {
    files: ['**/*.{js,mjs,cjs}'],
    extends: [js.configs.recommended, prettier],
    languageOptions: {
      globals: globals.node,
      sourceType: 'module',
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      {
        ...reactRefresh.configs.vite,
        rules: { 'react-refresh/only-export-components': 'off' },
      },
      importX.flatConfigs.recommended,
      importX.flatConfigs.typescript,
      prettier,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    settings: {
      'import-x/resolver': {
        typescript: {
          project: ['./tsconfig.app.json', './tsconfig.node.json'],
          noWarnOnMultipleProjects: true,
        },
        node: true,
      },
    },
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'error',
      // 축약·모호한 식별자 금지 — verbose 우선. 짧은 이름만 잡힘(긴 단어 축약은 리뷰).
      // 예외: z(zod)·cn(tailwind)·id(범용 식별자)·_(discard).
      'id-length': [
        'error',
        { min: 3, exceptions: ['z', 'cn', 'id', '_'], properties: 'never' },
      ],
      // id-length 사각지대 보강 — 구조분해 shorthand 바인딩까지 검사(객체 리터럴 키는 제외).
      // 1~2자 바인딩 금지. 예외: z·cn·id·_.
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: ['variable', 'parameter', 'function'],
          format: null,
          custom: { regex: '^(z|cn|id|_|.{3,})$', match: true },
        },
      ],
      'import-x/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling', 'index'],
            'type',
          ],
          pathGroups: [
            { pattern: '@/**', group: 'internal', position: 'before' },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import-x/no-unresolved': 'error',
      'import-x/newline-after-import': 'error',
      'no-restricted-imports': ['error', { patterns: publicApiPatterns }],
    },
  },
  // pages 레이어 전용: 벤더 SDK·HTTP·스키마 라이브러리 직접 import 금지
  // (사용자 액션과 결합된 SDK는 features/가 Provider까지 캡슐화)
  {
    files: ['src/pages/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: publicApiPatterns,
          paths: [
            {
              name: 'axios',
              message:
                'pages 레이어에서 axios 직접 import 금지. HTTP 호출은 features/*/api 또는 entities/*/api로 옮기세요.',
            },
            {
              name: 'zod',
              message:
                'pages 레이어에서 zod 직접 import 금지. 응답 스키마는 api 파일과 동일 슬라이스에 두세요.',
            },
            {
              name: '@react-oauth/google',
              message:
                'pages 레이어에서 OAuth SDK 직접 import 금지. features/auth-by-google이 Provider까지 캡슐화합니다.',
            },
          ],
        },
      ],
    },
  },
  // pages 슬라이스 index.ts: default → named 재export 강제
  {
    files: ['src/pages/*/index.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "ExportNamedDeclaration[source] > ExportSpecifier[local.name!='default']",
          message:
            'pages 슬라이스 index.ts 는 default → named 재export 만 허용. export { default as <Name>Page } from ... 형태로 작성하세요.',
        },
      ],
    },
  },
  // FSD layer boundary rules
  {
    files: ['src/**/*.{ts,tsx,js,mjs,cjs}'],
    plugins: { boundaries },
    settings: {
      'boundaries/elements': [
        // mode: 'file' — 기본값 'folder' 는 파일의 상위 폴더 경로로 매칭하므로
        // src/app/App.tsx 처럼 레이어 루트에 바로 놓인 파일이 미분류로 샌다.
        { type: 'app', pattern: 'src/app/**/*', mode: 'file' },
        // 부트스트랩 진입점. index.html 이 이 경로를 직접 가리키므로 app/ 안으로 못 옮긴다.
        // app 타입으로 선언해 전 레이어 import 를 허용하고, no-unknown-files 도 통과시킨다.
        { type: 'app', pattern: 'src/main.tsx', mode: 'file' },
        { type: 'pages', pattern: 'src/pages/*/**', capture: ['slice'] },
        { type: 'widgets', pattern: 'src/widgets/*/**', capture: ['slice'] },
        { type: 'features', pattern: 'src/features/*/**', capture: ['slice'] },
        { type: 'entities', pattern: 'src/entities/*/**', capture: ['slice'] },
        { type: 'shared', pattern: 'src/shared/**/*', mode: 'file' },
      ],
      'import/resolver': {
        typescript: {
          project: ['./tsconfig.app.json'],
        },
      },
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          rules: [
            {
              from: { type: 'app' },
              allow: [
                { to: { type: 'app' } },
                { to: { type: 'pages' } },
                { to: { type: 'widgets' } },
                { to: { type: 'features' } },
                { to: { type: 'entities' } },
                { to: { type: 'shared' } },
              ],
            },
            {
              from: { type: 'pages' },
              allow: [
                {
                  to: {
                    type: 'pages',
                    captured: { slice: '{{ from.captured.slice }}' },
                  },
                },
                { to: { type: 'widgets' } },
                { to: { type: 'features' } },
                { to: { type: 'entities' } },
                { to: { type: 'shared' } },
              ],
            },
            {
              from: { type: 'widgets' },
              allow: [
                {
                  to: {
                    type: 'widgets',
                    captured: { slice: '{{ from.captured.slice }}' },
                  },
                },
                { to: { type: 'features' } },
                { to: { type: 'entities' } },
                { to: { type: 'shared' } },
              ],
            },
            {
              from: { type: 'features' },
              allow: [
                {
                  to: {
                    type: 'features',
                    captured: { slice: '{{ from.captured.slice }}' },
                  },
                },
                { to: { type: 'entities' } },
                { to: { type: 'shared' } },
              ],
            },
            {
              from: { type: 'entities' },
              allow: [
                {
                  to: {
                    type: 'entities',
                    captured: { slice: '{{ from.captured.slice }}' },
                  },
                },
                { to: { type: 'shared' } },
              ],
            },
            {
              from: { type: 'shared' },
              allow: [{ to: { type: 'shared' } }],
            },
          ],
        },
      ],
      // src/ 안의 모든 파일은 어느 레이어엔가 속해야 한다.
      // 이게 없으면 레이어 밖 디렉터리(예전 src/components/)가 룰 사각지대로 조용히 자란다.
      'boundaries/no-unknown-files': 'error',
      // 미분류 파일을 import 하는 것도 같은 구멍이라 함께 막는다.
      'boundaries/no-unknown': 'error',
    },
  },
  // entities api/ 에서 도메인 에러 클래스 정의 금지 (model/errors.ts 로)
  // + entities 는 읽기 전용 — api/ 에 useMutation 금지 (쓰기는 features)
  {
    files: ['src/entities/*/api/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ClassDeclaration[id.name=/Error$/]',
          message:
            'entities api/ 에서 도메인 에러 클래스 정의 금지. model/errors.ts 로 옮기세요 (entities/CLAUDE.md).',
        },
        {
          selector: 'CallExpression[callee.name="useMutation"]',
          message:
            'entities 는 읽기 전용 — api/ 에 useMutation 금지. 쓰기(useMutation)는 features/<action>/api/ 로 (entities/CLAUDE.md).',
        },
      ],
    },
  },
  // 도메인 에러 클래스는 model/errors.ts 에 정의 — api/ 정의 금지 (entities·features 공통)
  {
    files: ['src/features/*/api/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ClassDeclaration[id.name=/Error$/]',
          message:
            '도메인 에러 클래스는 api/ 가 아니라 model/errors.ts 에 정의하세요 (features/CLAUDE.md).',
        },
      ],
    },
  },
  // TanStack 훅(useQuery/useMutation)은 슬라이스 api/ 에 정의 — model/ui 직접 호출 금지
  {
    files: ['src/{entities,features,widgets}/*/{model,ui}/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'warn',
        {
          selector: 'CallExpression[callee.name=/^use(Query|Mutation)$/]',
          message:
            'TanStack 훅(useQuery/useMutation)은 슬라이스 api/ 세그먼트에 정의하세요. model/ui 에서 직접 호출 금지 — 읽기/쓰기 모두 api/ (CLAUDE.md).',
        },
      ],
    },
  },
  // api/·model/ 세그먼트는 서버 상태·비즈니스만 — UI/UX 부수효과(toast/navigate) 직접 소유 금지.
  // toast·명령형 navigate 는 호출자(ui/ 세그먼트)가 mutate 콜백 등으로 소유한다.
  // (URL 상태 동기화용 useSearchParams/useParams 는 model/ 에서 허용 — navigate 만 차단)
  {
    files: ['src/{entities,features,widgets}/*/{api,model}/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: publicApiPatterns,
          paths: [
            {
              name: 'sonner',
              message:
                'api/·model/ 에서 toast 직접 호출 금지. UI 피드백은 호출자(ui/)가 mutate 콜백 등으로 소유하세요 (CLAUDE.md — api/model은 서버 상태·비즈니스만).',
            },
            {
              name: 'react-router-dom',
              importNames: ['useNavigate', 'Navigate', 'redirect'],
              message:
                'api/·model/ 에서 명령형 navigate 금지. 라우팅은 호출자(ui/)가 소유하세요. URL 상태 동기화는 useSearchParams/useParams 사용 (CLAUDE.md).',
            },
          ],
        },
      ],
    },
  },
  // slice 에서 httpClient 재export 금지 — @/shared/api 배럴서 직접 import
  {
    files: ['src/{entities,features,widgets}/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-exports': [
        'error',
        { restrictedNamedExports: ['httpClient'] },
      ],
    },
  },
  // 접근정책 공개는 PUBLIC const 로 명시 — 'public' 매직 스트링 금지 (deny-by-default, entities/user/model/permissions.ts)
  {
    files: ['src/widgets/sidebar-layout/model/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "Property[key.name='allowedRoles'] > Literal[value='public']",
          message:
            "allowedRoles 공개는 'public' 매직 스트링 대신 PUBLIC const 를 import 해서 쓰세요 (@/entities/user). 타입은 'public' 리터럴을 통과시키므로 오타·일관성은 이 룰이 강제합니다.",
        },
      ],
    },
  },
]);

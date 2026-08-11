import path from 'path';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { checker } from 'vite-plugin-checker';
// vitest/config 의 defineConfig 는 vite 것에 test 옵션 타입만 더한 것.
import { defineConfig } from 'vitest/config';

// checker 는 dev 서버에서만 — 저장 즉시 브라우저 오버레이로 타입·lint 에러를 보는 게 목적.
// build/test 에 붙이면 lint 위반이 "빌드 실패"·"테스트 실패"로 오귀속된다.
// 규칙 강제는 lefthook pre-push 와 CI 의 `pnpm lint` 가 맡는다(main ruleset 이 필수 체크로 강제).
// vitest 는 이 설정을 command: 'serve' 로 읽으므로 VITEST 도 같이 봐야 한다.
const isDevServer = (command: string) =>
  command === 'serve' && !process.env.VITEST;

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    tailwindcss(),
    isDevServer(command) &&
      checker({
        typescript: { buildMode: true },
        eslint: {
          lintCommand: 'eslint "./src/**/*.{ts,tsx}"',
          useFlatConfig: true,
        },
      }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  test: {
    coverage: {
      provider: 'v8',
      // text 는 터미널 요약, html 은 coverage/ 에 리포트. 둘 다 .gitignore 대상.
      reporter: ['text', 'html'],
      // 테스트가 아예 없는 파일도 0% 로 잡히게 대상을 명시한다.
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}'],
    },
  },
}));

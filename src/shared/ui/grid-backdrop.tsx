import type { ReactNode } from 'react';

/** 다크 네이비 배경 + 40px 그리드 위에 콘텐츠를 올리는 화면 셸. */
export function GridBackdrop({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh bg-slate-950 p-6 font-mono text-slate-50 md:p-8">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-60"
        style={{
          backgroundImage:
            'linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="relative mx-auto max-w-[1360px]">{children}</div>
    </div>
  );
}

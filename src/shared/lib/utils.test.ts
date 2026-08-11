import { describe, expect, it } from 'vitest';

import { cn } from '@/shared/lib/utils';

describe('cn', () => {
  it('클래스를 이어 붙인다', () => {
    expect(cn('px-2', 'text-sm')).toBe('px-2 text-sm');
  });

  it('falsy 값을 버린다', () => {
    expect(cn('px-2', false, undefined, null, '')).toBe('px-2');
  });

  it('조건부 객체·배열 문법을 지원한다', () => {
    expect(cn(['px-2', { 'text-sm': true, hidden: false }])).toBe(
      'px-2 text-sm'
    );
  });

  // twMerge 없이 clsx 만 쓰면 "px-2 px-4" 가 되고 CSS 순서에 따라 결과가 갈린다
  it('충돌하는 Tailwind 유틸리티는 뒤에 온 것만 남긴다', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
    expect(cn('text-sm text-red-500', 'text-lg')).toBe('text-red-500 text-lg');
  });
});

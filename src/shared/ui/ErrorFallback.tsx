'use client';

import type { FallbackProps } from 'react-error-boundary';

type Props = FallbackProps;

export function ErrorFallback({ error, resetErrorBoundary }: Props) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">오류가 발생했습니다</p>
      <p className="max-w-xs text-xs text-zinc-400">
        {error instanceof Error ? error.message : '알 수 없는 오류'}
      </p>
      <button
        onClick={resetErrorBoundary}
        className="rounded-md bg-zinc-900 px-4 py-2 text-xs text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        다시 시도
      </button>
    </div>
  );
}

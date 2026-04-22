'use client';

import { useState } from 'react';
import { parsePackageJson } from '../model/schema';
import { usePackageInputStore } from '../model/store';

const SAMPLE = JSON.stringify(
  {
    name: 'my-app',
    version: '1.0.0',
    dependencies: {
      react: '^18.0.0',
      'react-dom': '^18.0.0',
      next: '^13.0.0',
      zustand: '^4.0.0',
      zod: '^3.0.0',
    },
    devDependencies: {
      typescript: '^5.0.0',
      eslint: '^8.0.0',
      tailwindcss: '^3.0.0',
    },
  },
  null,
  2,
);

export function TextTab() {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const setPackageJson = usePackageInputStore((s) => s.setPackageJson);

  function handleParse() {
    setError(null);
    try {
      setPackageJson(parsePackageJson(text));
    } catch (e) {
      setError(e instanceof Error ? e.message : '유효하지 않은 JSON입니다.');
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={'{\n  "name": "my-app",\n  "version": "1.0.0",\n  "dependencies": {}\n}'}
        rows={10}
        className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 font-mono text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-400"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex justify-between gap-2">
        <button
          onClick={() => setText(SAMPLE)}
          className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
        >
          샘플 불러오기
        </button>
        <button
          onClick={handleParse}
          disabled={!text.trim()}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          분석
        </button>
      </div>
    </div>
  );
}

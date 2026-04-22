'use client';

import { useRef } from 'react';
import { parsePackageJson } from '../model/schema';
import { usePackageInputStore } from '../model/store';

export function FileUploadTab() {
  const inputRef = useRef<HTMLInputElement>(null);
  const setPackageJson = usePackageInputStore((s) => s.setPackageJson);

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = parsePackageJson(e.target?.result as string);
        setPackageJson(parsed);
      } catch {
        alert('유효하지 않은 package.json 파일입니다.');
      }
    };
    reader.readAsText(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div
      className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-zinc-300 p-10 text-center transition-colors hover:border-zinc-500 dark:border-zinc-700 dark:hover:border-zinc-400"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        package.json 파일을 드래그하거나 클릭하여 업로드
      </p>
      <button
        onClick={() => inputRef.current?.click()}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        파일 선택
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}

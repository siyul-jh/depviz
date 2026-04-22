'use client';

import type { DependencyType } from '@/src/entities/package/model/types';

const TYPE_OPTIONS: { id: DependencyType; label: string }[] = [
  { id: 'prod', label: 'prod' },
  { id: 'dev', label: 'dev' },
  { id: 'peer', label: 'peer' },
  { id: 'optional', label: 'optional' },
];

const TYPE_TIPS: Record<DependencyType, string> = {
  prod: 'dependencies\n앱 실행에 반드시 필요한 패키지',
  dev: 'devDependencies\n개발·빌드 시에만 사용, 프로덕션 번들 미포함',
  peer: 'peerDependencies\n호스트가 직접 설치해야 하는 패키지\n(라이브러리 개발 시)',
  optional: 'optionalDependencies\n없어도 동작하는 선택적 패키지',
};

interface Props {
  activeTypes: Set<DependencyType>;
  onToggleType: (type: DependencyType) => void;
  onResetZoom: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  layout: 'force' | 'tree';
  onToggleLayout: () => void;
  onExportSVG: () => void;
}

export function GraphControls({
  activeTypes,
  onToggleType,
  onResetZoom,
  searchQuery,
  onSearchChange,
  layout,
  onToggleLayout,
  onExportSVG,
}: Props) {
  return (
    <div className="absolute left-3 top-3 flex flex-col gap-1.5">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="패키지 검색…"
        className="w-40 rounded border border-zinc-200 bg-white/90 px-2 py-1 text-[11px] text-zinc-700 placeholder-zinc-400 backdrop-blur focus:outline-none dark:border-zinc-700 dark:bg-zinc-900/90 dark:text-zinc-200"
      />
      <div className="flex flex-wrap gap-1">
        {TYPE_OPTIONS.map((opt) => (
          <div key={opt.id} className="group/tip relative">
            <button
              onClick={() => onToggleType(opt.id)}
              className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                activeTypes.has(opt.id)
                  ? 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900'
                  : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500'
              }`}
            >
              {opt.label}
            </button>
            <div className="pointer-events-none absolute left-0 top-full z-20 mt-1.5 w-max whitespace-pre-line rounded bg-zinc-800 px-2.5 py-1.5 text-[10px] leading-relaxed text-white opacity-0 transition-opacity group-hover/tip:opacity-100 dark:bg-zinc-700">
              {TYPE_TIPS[opt.id]}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-1">
        <button
          onClick={onResetZoom}
          className="rounded bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
        >
          줌 리셋
        </button>
        <button
          onClick={onToggleLayout}
          className="rounded bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
        >
          {layout === 'force' ? '트리 뷰' : '포스 뷰'}
        </button>
        <button
          onClick={onExportSVG}
          className="rounded bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
        >
          SVG 저장
        </button>
      </div>
    </div>
  );
}

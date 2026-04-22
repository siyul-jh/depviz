'use client';

import type { DependencyNode } from '@/src/entities/dependency/model/types';
import type { RiskLevel } from '@/src/entities/package/model/types';

const RISK_LABEL: Record<RiskLevel, string> = {
  low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical',
};
const RISK_CLASS: Record<RiskLevel, string> = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

interface Props {
  node: DependencyNode;
  isRoot: boolean;
  onClose: () => void;
}

export function NodeDetailPanel({ node, isRoot, onClose }: Props) {
  return (
    <div className="absolute bottom-4 right-4 w-64 rounded-xl border border-zinc-200 bg-white/95 p-4 shadow-lg backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/95">
      <div className="mb-3 flex items-start justify-between gap-2">
        <span className="break-all font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          {node.name}
        </span>
        <button
          onClick={onClose}
          className="shrink-0 rounded p-0.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          aria-label="닫기"
        >
          ✕
        </button>
      </div>
      <dl className="space-y-1.5 text-xs">
        <div className="flex justify-between">
          <dt className="text-zinc-500">요청 버전</dt>
          <dd className="font-mono text-zinc-800 dark:text-zinc-200">{node.version}</dd>
        </div>
        {node.latestVersion && (
          <div className="flex justify-between">
            <dt className="text-zinc-500">최신 버전</dt>
            <dd className="font-mono text-zinc-800 dark:text-zinc-200">{node.latestVersion}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-zinc-500">타입</dt>
          <dd>
            <span className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              {node.type}
            </span>
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-zinc-500">리스크</dt>
          <dd>
            <span className={`rounded px-1.5 py-0.5 font-medium ${RISK_CLASS[node.riskLevel]}`}>
              {RISK_LABEL[node.riskLevel]}
            </span>
          </dd>
        </div>
      </dl>
      {!isRoot && (
        <a
          href={`https://www.npmjs.com/package/${node.name}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 block text-center text-[11px] text-blue-500 hover:underline"
        >
          npmjs.com에서 보기 ↗
        </a>
      )}
    </div>
  );
}

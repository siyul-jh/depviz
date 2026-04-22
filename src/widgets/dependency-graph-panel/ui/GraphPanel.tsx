'use client';

import { useState } from 'react';
import { useGraphData } from '@/src/features/dependency-graph/model/use-graph-data';
import { DependencyGraph } from '@/src/features/dependency-graph/ui/DependencyGraph';
import { GraphSummary } from './GraphSummary';
import { UpdateReport } from '@/src/features/update-report/ui/UpdateReport';

type Tab = 'graph' | 'summary' | 'report';

const TABS: { id: Tab; label: string }[] = [
  { id: 'graph', label: '의존성 그래프' },
  { id: 'summary', label: '리스크 요약' },
  { id: 'report', label: '업데이트 리포트' },
];

export function GraphPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('graph');
  const { graph, isLoading, packageJson } = useGraphData();

  if (!packageJson) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
        <p className="text-sm font-medium text-zinc-400">
          package.json을 입력하면 분석 결과가 표시됩니다.
        </p>
        <p className="text-xs text-zinc-300 dark:text-zinc-600">
          파일 업로드 · URL · 텍스트 입력을 지원합니다.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-500" />
          <p className="text-sm text-zinc-400">npm registry 조회 중...</p>
        </div>
      </div>
    );
  }

  if (!graph) return null;

  return (
    <div className="flex flex-1 flex-col min-h-0">
      <div className="flex gap-1 border-b border-zinc-200 dark:border-zinc-800">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm transition-colors ${
              activeTab === tab.id
                ? 'border-b-2 border-zinc-900 font-medium text-zinc-900 dark:border-zinc-50 dark:text-zinc-50'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-1 min-h-0 pt-4">
        {activeTab === 'graph' && <DependencyGraph graph={graph} />}
        {activeTab === 'summary' && (
          <div className="flex-1 overflow-y-auto">
            <GraphSummary graph={graph} />
          </div>
        )}
        {activeTab === 'report' && (
          <div className="flex-1 overflow-y-auto">
            <UpdateReport />
          </div>
        )}
      </div>
    </div>
  );
}

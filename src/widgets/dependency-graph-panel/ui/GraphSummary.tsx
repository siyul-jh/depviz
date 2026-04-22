import type { DependencyGraph } from '@/src/entities/dependency/model/types';
import type { RiskLevel } from '@/src/entities/package/model/types';
import { calcMajorDiff } from '@/src/shared/lib/semver';

const RISK_COLORS: Record<RiskLevel, string> = {
  low: 'text-green-600 dark:text-green-400',
  medium: 'text-yellow-600 dark:text-yellow-400',
  high: 'text-orange-600 dark:text-orange-400',
  critical: 'text-red-600 dark:text-red-400',
};

const RISK_BORDER: Record<RiskLevel, string> = {
  low: 'border-green-100 dark:border-green-900/40',
  medium: 'border-yellow-100 dark:border-yellow-900/40',
  high: 'border-orange-100 dark:border-orange-900/40',
  critical: 'border-red-100 dark:border-red-900/40',
};

const RISK_BADGE: Record<RiskLevel, string> = {
  low: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
};

const RISK_META: Record<RiskLevel, { label: string; criterion: string; impact: string }> = {
  low: {
    label: '낮음',
    criterion: '패치/마이너 업데이트',
    impact: '하위 호환성 유지 — 안전하게 업데이트 가능',
  },
  medium: {
    label: '보통',
    criterion: 'Major 1버전 차이',
    impact: 'API 변경 가능성 있음 — 릴리스 노트 확인 권장',
  },
  high: {
    label: '높음',
    criterion: 'Major 2버전 차이',
    impact: 'Breaking changes 예상 — 마이그레이션 가이드 검토 필요',
  },
  critical: {
    label: '위험',
    criterion: 'Major 3버전 이상 차이',
    impact: '대규모 변경 — 충분한 검토 후 단계적 업데이트 권장',
  },
};

const RISK_ORDER: RiskLevel[] = ['critical', 'high', 'medium', 'low'];

interface Props {
  graph: DependencyGraph;
}

export function GraphSummary({ graph }: Props) {
  const depNodes = graph.nodes.slice(1);

  const riskCounts = depNodes.reduce<Record<RiskLevel, number>>(
    (acc, node) => { acc[node.riskLevel as RiskLevel]++; return acc; },
    { low: 0, medium: 0, high: 0, critical: 0 },
  );

  const actionableNodes = depNodes
    .filter((n) => n.riskLevel === 'critical' || n.riskLevel === 'high' || n.riskLevel === 'medium')
    .sort((a, b) =>
      RISK_ORDER.indexOf(a.riskLevel as RiskLevel) - RISK_ORDER.indexOf(b.riskLevel as RiskLevel),
    );

  return (
    <div className="flex flex-col gap-6">
      {/* 리스크 카드 — 기준 및 영향 포함 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {RISK_ORDER.map((level) => {
          const meta = RISK_META[level];
          return (
            <div
              key={level}
              className={`flex flex-col gap-1 rounded-lg border px-4 py-3 ${RISK_BORDER[level]}`}
            >
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-bold ${RISK_COLORS[level]}`}>
                  {riskCounts[level]}
                </span>
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${RISK_BADGE[level]}`}>
                  {meta.label}
                </span>
              </div>
              <p className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">{meta.criterion}</p>
              <p className="text-[10px] leading-snug text-zinc-400">{meta.impact}</p>
            </div>
          );
        })}
      </div>

      {/* 조치 필요 패키지 목록 (medium 이상) */}
      {actionableNodes.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            조치 필요 패키지
            <span className="ml-2 text-xs font-normal text-zinc-400">medium 이상</span>
          </h3>
          <ul className="flex flex-col gap-1.5">
            {actionableNodes.map((node) => {
              const currentBare = node.version.replace(/^[\^~>=<*\s]+/, '') || node.version;
              const majorDiff = node.latestVersion ? calcMajorDiff(currentBare, node.latestVersion) : null;
              const meta = RISK_META[node.riskLevel as RiskLevel];
              return (
                <li
                  key={node.id}
                  className="rounded-md border border-zinc-100 bg-zinc-50 px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="flex items-center gap-2">
                    <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${RISK_BADGE[node.riskLevel as RiskLevel]}`}>
                      {meta.label}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      {node.name}
                    </span>
                    <span className="shrink-0 font-mono text-xs text-zinc-400">{currentBare}</span>
                    {node.latestVersion && (
                      <>
                        <span className="shrink-0 text-xs text-zinc-300 dark:text-zinc-600">→</span>
                        <span className="shrink-0 font-mono text-xs font-medium text-zinc-700 dark:text-zinc-300">
                          {node.latestVersion}
                        </span>
                      </>
                    )}
                  </div>
                  <p className="mt-0.5 pl-0 text-[10px] text-zinc-400">
                    {meta.criterion}
                    {majorDiff !== null ? ` · major ${majorDiff}버전 차이` : ''}
                    {' — '}
                    {meta.impact}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <p className="text-xs text-zinc-400">
        총 {depNodes.length}개 패키지 · {graph.edges.length}개 의존성
      </p>
    </div>
  );
}

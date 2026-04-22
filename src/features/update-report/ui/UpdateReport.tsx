'use client';

import { useState, useMemo } from 'react';
import { useUpdateReport } from '../model/use-update-report';
import { usePackageInputStore } from '@/src/features/package-input/model/store';
import type { DependencyType, RiskLevel } from '@/src/entities/package/model/types';

// ── 패키지 매니저 ─────────────────────────────────────────────────────────────
type PkgManager = 'npm' | 'yarn' | 'pnpm' | 'bun';
const PM_LIST: PkgManager[] = ['npm', 'yarn', 'pnpm', 'bun'];

function buildCmd(pm: PkgManager, type: DependencyType, pkgs: string): string {
  const base = pm === 'npm' ? 'npm install' : `${pm} add`;
  const flags: Partial<Record<DependencyType, Record<PkgManager, string>>> = {
    dev: { npm: '-D', yarn: '-D', pnpm: '-D', bun: '-D' },
    peer: { npm: '--save-peer', yarn: '--peer', pnpm: '--save-peer', bun: '--peer' },
    optional: { npm: '--save-optional', yarn: '--optional', pnpm: '--save-optional', bun: '--optional' },
  };
  const flag = flags[type]?.[pm];
  return flag ? `${base} ${flag} ${pkgs}` : `${base} ${pkgs}`;
}

function detectPm(raw: Record<string, unknown> | null): PkgManager {
  const field = typeof raw?.packageManager === 'string' ? raw.packageManager : '';
  return PM_LIST.find((pm) => field.startsWith(pm)) ?? 'npm';
}

// ── 뱃지 스타일 ───────────────────────────────────────────────────────────────
const RISK_BADGE: Record<RiskLevel, string> = {
  low: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
};
const RISK_LABELS: Record<RiskLevel, string> = {
  low: '낮음', medium: '보통', high: '높음', critical: '위험',
};
const RISK_META: Record<RiskLevel, { criterion: string; impact: string }> = {
  low: {
    criterion: '패치/마이너 업데이트',
    impact: '하위 호환성 유지 — 안전하게 업데이트 가능',
  },
  medium: {
    criterion: 'Major 1버전 차이',
    impact: 'API 변경 가능성 있음 — 릴리스 노트 확인 권장',
  },
  high: {
    criterion: 'Major 2버전 차이',
    impact: 'Breaking changes 예상 — 마이그레이션 가이드 검토 필요',
  },
  critical: {
    criterion: 'Major 3버전 이상 차이',
    impact: '대규모 변경 — 충분한 검토 후 단계적 업데이트 권장',
  },
};
const TYPE_BADGE: Record<DependencyType, string> = {
  prod: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  dev: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
  peer: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
  optional: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
};

type Filter = 'all' | DependencyType;
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'prod', label: 'prod' },
  { id: 'dev', label: 'dev' },
  { id: 'peer', label: 'peer' },
];

const TYPE_TIPS: Record<Filter, string> = {
  all: '모든 타입의 패키지를 표시합니다',
  prod: 'dependencies\n앱 실행에 반드시 필요한 패키지',
  dev: 'devDependencies\n개발·빌드 시에만 사용, 프로덕션 번들 미포함',
  peer: 'peerDependencies\n호스트가 직접 설치해야 하는 패키지\n(라이브러리 개발 시)',
  optional: 'optionalDependencies\n없어도 동작하는 선택적 패키지',
};

// ── 컴포넌트 ──────────────────────────────────────────────────────────────────
export function UpdateReport() {
  const { items, isLoading } = useUpdateReport();
  const packageJson = usePackageInputStore((s) => s.packageJson);
  const [filter, setFilter] = useState<Filter>('all');
  const [copied, setCopied] = useState<'report' | 'command' | null>(null);
  const [copiedPkg, setCopiedPkg] = useState<string | null>(null);
  const [manualPm, setManualPm] = useState<PkgManager | null>(null);
  const detectedPm = useMemo(
    () => detectPm(packageJson as Record<string, unknown> | null),
    [packageJson],
  );
  const pkgManager = manualPm ?? detectedPm;

  if (isLoading) {
    return <p className="text-sm text-zinc-400">데이터 로딩 중...</p>;
  }

  const filtered = filter === 'all' ? items : items.filter((i) => i.type === filter);
  const outdated = items.filter((i) => i.needsUpdate && i.latestVersion);

  function copyWith(key: 'report' | 'command', text: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  function copyPkg(name: string, version: string, type: DependencyType) {
    navigator.clipboard.writeText(buildCmd(pkgManager, type, `${name}@${version}`));
    setCopiedPkg(name);
    setTimeout(() => setCopiedPkg(null), 2000);
  }

  function handleCopyReport() {
    const lines = [
      '업데이트 우선순위 리포트',
      `총 ${items.length}개 패키지 · 업데이트 필요 ${outdated.length}개`,
      '',
      ...outdated.map(
        (i) => `[${RISK_LABELS[i.riskLevel]}] ${i.name}: ${i.currentBare} → ${i.latestVersion} (${i.type})`,
      ),
    ];
    copyWith('report', lines.join('\n'));
  }

  function handleCopyCommand() {
    // dep 타입별로 그룹화하여 별도 명령어 생성
    const byType = new Map<DependencyType, string[]>();
    for (const i of outdated) {
      if (!i.latestVersion) continue;
      const arr = byType.get(i.type) ?? [];
      arr.push(`${i.name}@${i.latestVersion}`);
      byType.set(i.type, arr);
    }
    const lines = [...byType.entries()].map(([type, pkgs]) =>
      buildCmd(pkgManager, type, pkgs.join(' ')),
    );
    copyWith('command', lines.join('\n'));
  }

  function handleExportPackageJson() {
    if (!packageJson) return;
    const preview = outdated
      .slice(0, 5)
      .map((i) => `• ${i.name}: ${i.currentBare} → ${i.latestVersion}`)
      .join('\n');
    const more = outdated.length > 5 ? `\n...외 ${outdated.length - 5}개` : '';
    const confirmed = window.confirm(
      `${outdated.length}개 패키지를 최신 버전(^x.y.z)으로 교체한 package.json을 저장합니다.\n\n${preview}${more}\n\n계속하시겠습니까?`,
    );
    if (!confirmed) return;

    const raw = packageJson as Record<string, unknown>;
    const updated: Record<string, unknown> = { ...raw };
    const depMap: Record<DependencyType, string> = {
      prod: 'dependencies',
      dev: 'devDependencies',
      peer: 'peerDependencies',
      optional: 'optionalDependencies',
    };
    for (const item of outdated) {
      if (!item.latestVersion) continue;
      const field = depMap[item.type];
      const existing = raw[field];
      if (existing && typeof existing === 'object' && item.name in (existing as Record<string, string>)) {
        updated[field] = { ...(existing as Record<string, string>), [item.name]: `^${item.latestVersion}` };
      }
    }
    const blob = new Blob([JSON.stringify(updated, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'package.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 상단 컨트롤 */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1.5">
          {FILTERS.map((f) => (
            <div key={f.id} className="group/tip relative">
              <button
                onClick={() => setFilter(f.id)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  filter === f.id
                    ? 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
                }`}
              >
                {f.label}
              </button>
              <div className="pointer-events-none absolute left-0 top-full z-20 mt-1.5 w-max whitespace-pre-line rounded bg-zinc-800 px-2.5 py-1.5 text-[10px] leading-relaxed text-white opacity-0 transition-opacity group-hover/tip:opacity-100 dark:bg-zinc-700">
                {TYPE_TIPS[f.id]}
              </div>
            </div>
          ))}
        </div>

        {/* 패키지 매니저 선택 */}
        <div className="flex items-center gap-1">
          {PM_LIST.map((pm) => (
            <button
              key={pm}
              onClick={() => setManualPm(pm)}
              className={`rounded px-2 py-0.5 text-[11px] font-mono transition-colors ${
                pkgManager === pm
                  ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900'
                  : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
              }`}
            >
              {pm}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={handleCopyCommand}
          disabled={outdated.length === 0}
          className="rounded-md border border-zinc-200 px-3 py-1 text-xs text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900"
        >
          {copied === 'command' ? '복사됨 ✓' : '전체 명령어 복사'}
        </button>
        <button
          onClick={handleCopyReport}
          disabled={outdated.length === 0}
          className="rounded-md border border-zinc-200 px-3 py-1 text-xs text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900"
        >
          {copied === 'report' ? '복사됨 ✓' : '리포트 복사'}
        </button>
        <button
          onClick={handleExportPackageJson}
          disabled={outdated.length === 0}
          className="rounded-md border border-zinc-200 px-3 py-1 text-xs text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900"
        >
          최신 버전으로 package.json 저장
        </button>
      </div>

      <p className="text-xs text-zinc-400">
        총 {filtered.length}개 · 업데이트 필요{' '}
        <span className="font-medium text-zinc-600 dark:text-zinc-300">
          {filtered.filter((i) => i.needsUpdate).length}개
        </span>
      </p>

      {/* 리스크 기준 패널 */}
      <details className="rounded-lg border border-zinc-100 dark:border-zinc-800">
        <summary className="cursor-pointer select-none px-3 py-2 text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
          리스크 기준 보기
        </summary>
        <div className="grid grid-cols-1 gap-2 px-3 pb-3 pt-1 sm:grid-cols-2">
          {(Object.entries(RISK_META) as [RiskLevel, { criterion: string; impact: string }][]).map(([level, meta]) => (
            <div key={level} className="flex items-start gap-2">
              <span className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${RISK_BADGE[level]}`}>
                {RISK_LABELS[level]}
              </span>
              <div>
                <p className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">{meta.criterion}</p>
                <p className="text-[10px] text-zinc-400">{meta.impact}</p>
              </div>
            </div>
          ))}
        </div>
      </details>

      {/* 패키지 목록 */}
      <div className="flex flex-col gap-1.5">
        {filtered.map((item) => (
          <div
            key={`${item.name}-${item.type}`}
            className="flex items-center gap-3 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <span
              className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${RISK_BADGE[item.riskLevel]}`}
            >
              {RISK_LABELS[item.riskLevel]}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">{item.name}</p>
              <p className="truncate text-[10px] text-zinc-400">
                {RISK_META[item.riskLevel].criterion}
                {item.majorDiff !== null ? ` · major ${item.majorDiff}버전 차이` : ''}
                {' — '}
                {RISK_META[item.riskLevel].impact}
              </p>
            </div>
            <span className="shrink-0 font-mono text-xs text-zinc-400">{item.currentBare}</span>
            {item.needsUpdate && item.latestVersion && (
              <>
                <span className="shrink-0 text-xs text-zinc-300 dark:text-zinc-600">→</span>
                <span className="shrink-0 font-mono text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  {item.latestVersion}
                </span>
                <button
                  onClick={() => copyPkg(item.name, item.latestVersion!, item.type)}
                  className="shrink-0 rounded border border-zinc-200 px-1.5 py-0.5 text-[10px] text-zinc-500 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                  title={buildCmd(pkgManager, item.type, `${item.name}@${item.latestVersion}`)}
                >
                  {copiedPkg === item.name ? '✓' : '복사'}
                </button>
              </>
            )}
            <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${TYPE_BADGE[item.type]}`}>
              {item.type}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

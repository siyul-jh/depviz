import type { RiskLevel } from '@/src/entities/package/model/types';

const RISKS: { level: RiskLevel; label: string; color: string }[] = [
  { level: 'low', label: '낮음', color: '#22c55e' },
  { level: 'medium', label: '보통', color: '#eab308' },
  { level: 'high', label: '높음', color: '#f97316' },
  { level: 'critical', label: '위험', color: '#ef4444' },
];

export function GraphLegend() {
  return (
    <div className="absolute bottom-4 left-4 flex flex-col gap-1.5 rounded-lg border border-zinc-200 bg-white/90 p-3 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/90">
      <p className="text-xs font-medium text-zinc-500">리스크 수준</p>
      {RISKS.map(({ level, label, color }) => (
        <div key={level} className="flex items-center gap-2">
          <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-xs text-zinc-600 dark:text-zinc-400">{label}</span>
        </div>
      ))}
    </div>
  );
}

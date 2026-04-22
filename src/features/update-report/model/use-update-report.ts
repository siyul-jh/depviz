'use client';

import { useGraphData } from '@/src/features/dependency-graph/model/use-graph-data';
import type { RiskLevel, DependencyType } from '@/src/entities/package/model/types';
import { calcVersionRisk, calcMajorDiff, isOutdated } from '@/src/shared/lib/semver';

export interface UpdateReportItem {
  name: string;
  currentRange: string;
  currentBare: string;
  latestVersion: string | null;
  majorDiff: number | null;
  type: DependencyType;
  riskLevel: RiskLevel;
  needsUpdate: boolean;
}

const RISK_ORDER: RiskLevel[] = ['critical', 'high', 'medium', 'low'];

export function useUpdateReport() {
  const { packageJson, registryData, isLoading } = useGraphData();

  if (!packageJson) return { items: [], isLoading: false };

  const groups: [Record<string, string>, DependencyType][] = [
    [packageJson.dependencies, 'prod'],
    [packageJson.devDependencies, 'dev'],
    [packageJson.peerDependencies, 'peer'],
    [packageJson.optionalDependencies, 'optional'],
  ];

  const items: UpdateReportItem[] = [];

  for (const [deps, type] of groups) {
    for (const [name, range] of Object.entries(deps)) {
      const info = registryData[name];
      const bare = range.replace(/^[\^~>=<*\s]+/, '') || range;
      const latestVersion = info?.latestVersion ?? null;
      const riskLevel = latestVersion ? calcVersionRisk(bare, latestVersion) : 'low';
      const needsUpdate = latestVersion ? isOutdated(bare, latestVersion) : false;
      const majorDiff = latestVersion ? calcMajorDiff(bare, latestVersion) : null;
      items.push({ name, currentRange: range, currentBare: bare, latestVersion, majorDiff, type, riskLevel, needsUpdate });
    }
  }

  items.sort((a, b) => {
    const rDiff = RISK_ORDER.indexOf(a.riskLevel) - RISK_ORDER.indexOf(b.riskLevel);
    return rDiff !== 0 ? rDiff : a.name.localeCompare(b.name);
  });

  return { items, isLoading };
}

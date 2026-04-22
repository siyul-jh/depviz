import semver from 'semver';
import type { RiskLevel } from '@/src/entities/package/model/types';
import { RISK_THRESHOLDS } from '@/src/shared/config';

export function calcVersionRisk(current: string, latest: string): RiskLevel {
  const currentClean = semver.coerce(current)?.version;
  const latestClean = semver.coerce(latest)?.version;
  if (!currentClean || !latestClean) return 'low';

  const majorDiff = semver.major(latestClean) - semver.major(currentClean);
  const { critical, high, medium } = RISK_THRESHOLDS.majorVersionsBehind;

  if (majorDiff >= critical) return 'critical';
  if (majorDiff >= high) return 'high';
  if (majorDiff >= medium) return 'medium';
  return 'low';
}

export function calcMajorDiff(current: string, latest: string): number | null {
  const c = semver.coerce(current)?.version;
  const l = semver.coerce(latest)?.version;
  if (!c || !l) return null;
  const diff = semver.major(l) - semver.major(c);
  return diff > 0 ? diff : null;
}

export function isOutdated(current: string, latest: string): boolean {
  const c = semver.coerce(current);
  const l = semver.coerce(latest);
  if (!c || !l) return false;
  return semver.lt(c.version, l.version);
}

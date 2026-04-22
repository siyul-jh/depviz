export const REGISTRY_URL = 'https://registry.npmjs.org';

export const RISK_THRESHOLDS = {
  majorVersionsBehind: { medium: 1, high: 2, critical: 3 },
  monthsSinceUpdate: { medium: 6, high: 12, critical: 24 },
} as const;

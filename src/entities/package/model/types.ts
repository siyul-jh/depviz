export interface PackageJson {
  name: string;
  version: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
}

export interface ResolvedPackage {
  name: string;
  version: string;
  latestVersion: string | null;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
  isOutdated: boolean;
  riskLevel: RiskLevel;
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type DependencyType = 'prod' | 'dev' | 'peer' | 'optional';

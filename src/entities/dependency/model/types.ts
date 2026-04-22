import type { DependencyType, RiskLevel } from '@/src/entities/package/model/types';

export interface DependencyNode {
  id: string;
  name: string;
  version: string;
  latestVersion: string | null;
  type: DependencyType;
  riskLevel: RiskLevel;
}

export interface DependencyEdge {
  source: string;
  target: string;
  type: DependencyType;
  versionRange: string;
}

export interface DependencyGraph {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
}

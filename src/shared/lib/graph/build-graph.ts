import type { ParsedPackageJson } from '@/src/features/package-input/model/schema';
import type { DependencyGraph, DependencyNode, DependencyEdge } from '@/src/entities/dependency/model/types';
import type { NpmPackageInfo } from '@/src/shared/api/npm-registry';
import { calcVersionRisk } from '@/src/shared/lib/semver';
import type { DependencyType } from '@/src/entities/package/model/types';

export function buildDependencyGraph(
  pkg: ParsedPackageJson,
  registryData: Record<string, NpmPackageInfo>,
): DependencyGraph {
  const nodes: DependencyNode[] = [];
  const edges: DependencyEdge[] = [];
  const rootId = `${pkg.name}@${pkg.version}`;

  nodes.push({ id: rootId, name: pkg.name, version: pkg.version, latestVersion: null, type: 'prod', riskLevel: 'low' });

  const groups: [Record<string, string>, DependencyType][] = [
    [pkg.dependencies, 'prod'],
    [pkg.devDependencies, 'dev'],
    [pkg.peerDependencies, 'peer'],
    [pkg.optionalDependencies, 'optional'],
  ];

  for (const [deps, type] of groups) {
    for (const [name, versionRange] of Object.entries(deps)) {
      const info = registryData[name];
      const bare = versionRange.replace(/^[\^~>=<*\s]+/, '') || versionRange;
      const riskLevel = info ? calcVersionRisk(bare, info.latestVersion) : 'low';
      const nodeId = `${name}@${versionRange}`;

      if (!nodes.find((n) => n.id === nodeId)) {
        nodes.push({ id: nodeId, name, version: versionRange, latestVersion: info?.latestVersion ?? null, type, riskLevel });
      }
      edges.push({ source: rootId, target: nodeId, type, versionRange });
    }
  }

  return { nodes, edges };
}

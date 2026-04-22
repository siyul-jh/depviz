import { describe, it, expect } from 'vitest';
import { buildDependencyGraph } from './build-graph';
import type { ParsedPackageJson } from '@/src/features/package-input/model/schema';
import type { NpmPackageInfo } from '@/src/shared/api/npm-registry';

const basePkg: ParsedPackageJson = {
  name: 'my-app',
  version: '1.0.0',
  dependencies: { react: '^18.0.0' },
  devDependencies: { typescript: '^5.0.0' },
  peerDependencies: {},
  optionalDependencies: {},
};

const registry: Record<string, NpmPackageInfo> = {
  react: { name: 'react', latestVersion: '19.0.0', publishedAt: null },
  typescript: { name: 'typescript', latestVersion: '5.4.0', publishedAt: null },
};

describe('buildDependencyGraph', () => {
  it('루트 노드를 포함한 그래프 생성', () => {
    const graph = buildDependencyGraph(basePkg, registry);
    const root = graph.nodes[0];
    expect(root.name).toBe('my-app');
    expect(root.id).toBe('my-app@1.0.0');
  });

  it('의존성 노드와 엣지 수', () => {
    const graph = buildDependencyGraph(basePkg, registry);
    expect(graph.nodes).toHaveLength(3); // root + react + typescript
    expect(graph.edges).toHaveLength(2);
  });

  it('registry에 없는 패키지는 riskLevel low', () => {
    const graph = buildDependencyGraph(basePkg, {});
    const reactNode = graph.nodes.find((n) => n.name === 'react');
    expect(reactNode?.riskLevel).toBe('low');
  });

  it('major 버전 차이에 따라 riskLevel 계산', () => {
    const graph = buildDependencyGraph(basePkg, registry);
    // react: 18 → 19, 1 major 차이 → medium
    const reactNode = graph.nodes.find((n) => n.name === 'react');
    expect(reactNode?.riskLevel).toBe('medium');
  });

  it('dep type 구분', () => {
    const graph = buildDependencyGraph(basePkg, registry);
    const reactNode = graph.nodes.find((n) => n.name === 'react');
    const tsNode = graph.nodes.find((n) => n.name === 'typescript');
    expect(reactNode?.type).toBe('prod');
    expect(tsNode?.type).toBe('dev');
  });
});

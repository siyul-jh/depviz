'use client';

import { useMemo } from 'react';
import * as d3 from 'd3';
import type { DependencyGraph } from '@/src/entities/dependency/model/types';
import type { RiskLevel, DependencyType } from '@/src/entities/package/model/types';
import type { SimNode, SimLink } from './use-force-simulation';

interface TreeDatum {
  id: string;
  name: string;
  riskLevel: RiskLevel;
  type: DependencyType;
  isRoot: boolean;
  children?: TreeDatum[];
}

export function useTreeLayout(
  graph: DependencyGraph | null,
  width: number,
  height: number,
) {
  return useMemo(() => {
    if (!graph || width === 0 || height === 0) return { treeNodes: [], treeLinks: [] };

    const rootNode = graph.nodes[0];
    if (!rootNode) return { treeNodes: [], treeLinks: [] };

    const datum: TreeDatum = {
      id: rootNode.id,
      name: rootNode.name,
      riskLevel: rootNode.riskLevel,
      type: rootNode.type,
      isRoot: true,
      children: graph.nodes.slice(1).map((n) => ({
        id: n.id,
        name: n.name,
        riskLevel: n.riskLevel,
        type: n.type,
        isRoot: false,
      })),
    };

    // Left-to-right orthogonal tree:
    // d3.tree().size([breadth, depth]) where breadth = vertical spread, depth = horizontal extent
    const padX = 80;
    const padY = 20;
    const breadth = height - 2 * padY;
    const depth = width - 2 * padX;

    const hierarchy = d3.hierarchy(datum);
    d3.tree<TreeDatum>().size([breadth, depth])(hierarchy);

    // depth-dimension (d.y) → x-axis, breadth-dimension (d.x) → y-axis
    const treeNodes: SimNode[] = hierarchy.descendants().map((d) => ({
      id: d.data.id,
      name: d.data.name,
      riskLevel: d.data.riskLevel,
      type: d.data.type,
      isRoot: d.data.isRoot,
      x: padX + (d.y ?? 0),
      y: padY + (d.x ?? 0),
    }));

    const nodeById = new Map(treeNodes.map((n) => [n.id, n]));
    const treeLinks: SimLink[] = graph.edges.map((e) => ({
      source: nodeById.get(e.source) ?? e.source,
      target: nodeById.get(e.target) ?? e.target,
      type: e.type,
    }));

    return { treeNodes, treeLinks };
  }, [graph, width, height]);
}

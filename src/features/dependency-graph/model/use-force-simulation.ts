'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { DependencyGraph } from '@/src/entities/dependency/model/types';
import type { RiskLevel, DependencyType } from '@/src/entities/package/model/types';

export interface SimNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  riskLevel: RiskLevel;
  type: DependencyType;
  isRoot: boolean;
}

export interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  type: DependencyType;
}

export function useForceSimulation(
  graph: DependencyGraph | null,
  width: number,
  height: number,
) {
  const [simNodes, setSimNodes] = useState<SimNode[]>([]);
  const [simLinks, setSimLinks] = useState<SimLink[]>([]);
  const simRef = useRef<d3.Simulation<SimNode, SimLink> | null>(null);

  useEffect(() => {
    simRef.current?.stop();
    if (!graph || width === 0 || height === 0) return;

    const rootId = graph.nodes[0]?.id;
    const nodes: SimNode[] = graph.nodes.map((n) => ({
      ...n,
      riskLevel: n.riskLevel as RiskLevel,
      type: n.type as DependencyType,
      isRoot: n.id === rootId,
    }));
    const nodeById = new Map(nodes.map((n) => [n.id, n]));

    const links: SimLink[] = graph.edges
      .map((e) => ({
        source: nodeById.get(e.source) ?? e.source,
        target: nodeById.get(e.target) ?? e.target,
        type: e.type,
      }))
      .filter((l) => l.source && l.target);

    const n = nodes.length;
    const linkDistance = n > 100 ? 80 : n > 50 ? 100 : 120;
    const chargeStrength = n > 100 ? -200 : n > 50 ? -300 : -400;
    const collideRadius = n > 100 ? 26 : n > 50 ? 30 : 36;

    const sim = d3
      .forceSimulation<SimNode>(nodes)
      .force(
        'link',
        d3.forceLink<SimNode, SimLink>(links).id((d) => d.id).distance(linkDistance),
      )
      .force('charge', d3.forceManyBody<SimNode>().strength(chargeStrength))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide<SimNode>(collideRadius))
      .on('tick', () => {
        setSimNodes([...nodes]);
        setSimLinks([...links]);
      });

    simRef.current = sim;
    return () => { sim.stop(); };
  }, [graph, width, height]);

  return { simNodes, simLinks };
}

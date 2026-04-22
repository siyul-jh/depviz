'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { useForceSimulation, type SimNode } from '../model/use-force-simulation';
import { useTreeLayout } from '../model/use-tree-layout';
import { GraphLegend } from './GraphLegend';
import { GraphControls } from './GraphControls';
import { NodeDetailPanel } from './NodeDetailPanel';
import type { DependencyGraph as DependencyGraphData } from '@/src/entities/dependency/model/types';
import type { RiskLevel, DependencyType } from '@/src/entities/package/model/types';

const RISK_FILL: Record<RiskLevel, string> = {
  low: '#22c55e',
  medium: '#eab308',
  high: '#f97316',
  critical: '#ef4444',
};

const ALL_TYPES = new Set<DependencyType>(['prod', 'dev', 'peer', 'optional']);

function getNodePos(node: SimNode | string): { x: number; y: number; id: string } {
  if (typeof node === 'object' && 'id' in node) {
    return { x: node.x ?? 0, y: node.y ?? 0, id: node.id };
  }
  return { x: 0, y: 0, id: String(node) };
}

interface Props {
  graph: DependencyGraphData;
}

export function DependencyGraph({ graph }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [clickedId, setClickedId] = useState<string | null>(null);
  const [activeTypes, setActiveTypes] = useState<Set<DependencyType>>(ALL_TYPES);
  const [searchQuery, setSearchQuery] = useState('');
  const [layout, setLayout] = useState<'force' | 'tree'>('force');

  const { simNodes, simLinks } = useForceSimulation(
    layout === 'force' ? graph : null,
    dimensions.width,
    dimensions.height,
  );
  const { treeNodes, treeLinks } = useTreeLayout(
    layout === 'tree' ? graph : null,
    dimensions.width,
    dimensions.height,
  );

  const nodes = layout === 'force' ? simNodes : treeNodes;
  const links = layout === 'force' ? simLinks : treeLinks;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setDimensions({ width, height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || dimensions.width === 0) return;
    const g = svg.querySelector<SVGGElement>('#zg');
    if (!g) return;

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.15, 5])
      .on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        d3.select(g).attr('transform', event.transform.toString());
      });

    zoomRef.current = zoom;
    d3.select(svg).call(zoom);
    return () => {
      d3.select(svg).on('.zoom', null);
    };
  }, [dimensions]);

  function handleResetZoom() {
    const svg = svgRef.current;
    const zoom = zoomRef.current;
    if (!svg || !zoom) return;
    d3.select(svg).transition().duration(300).call(zoom.transform, d3.zoomIdentity);
  }

  function handleToggleLayout() {
    setLayout((prev) => (prev === 'force' ? 'tree' : 'force'));
    setClickedId(null);
  }

  function handleToggleType(type: DependencyType) {
    setActiveTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        if (next.size === 1) return prev;
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
    setClickedId(null);
  }

  const visibleNodes = nodes.filter((n) => n.isRoot || activeTypes.has(n.type));
  const visibleNodeIds = new Set(visibleNodes.map((n) => n.id));
  const visibleLinks = links.filter((l) => {
    const s = getNodePos(l.source as SimNode | string);
    const t = getNodePos(l.target as SimNode | string);
    return visibleNodeIds.has(s.id) && visibleNodeIds.has(t.id);
  });

  function handleExportSVG() {
    const svg = svgRef.current;
    if (!svg || visibleNodes.length === 0) return;
    const xs = visibleNodes.map((n) => n.x ?? 0);
    const ys = visibleNodes.map((n) => n.y ?? 0);
    const pad = 60;
    const minX = Math.min(...xs) - pad;
    const minY = Math.min(...ys) - pad;
    const maxX = Math.max(...xs) + pad;
    const maxY = Math.max(...ys) + pad;
    const vw = maxX - minX;
    const vh = maxY - minY;
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute('width', String(vw));
    clone.setAttribute('height', String(vh));
    clone.setAttribute('viewBox', `${minX} ${minY} ${vw} ${vh}`);
    const zg = clone.querySelector('#zg');
    if (zg) zg.removeAttribute('transform');
    const svgStr = '<?xml version="1.0" encoding="UTF-8"?>' + new XMLSerializer().serializeToString(clone);
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dependency-graph.svg';
    a.click();
    URL.revokeObjectURL(url);
  }

  const matchedIds = useMemo(
    () =>
      searchQuery.trim()
        ? new Set(visibleNodes.filter((n) => n.name.toLowerCase().includes(searchQuery.toLowerCase())).map((n) => n.id))
        : null,
    [searchQuery, visibleNodes],
  );

  const isVisible = useCallback(
    (id: string) => {
      if (matchedIds) return matchedIds.has(id);
      if (!hoveredId) return true;
      if (id === hoveredId) return true;
      return visibleLinks.some((l) => {
        const s = getNodePos(l.source as SimNode | string);
        const t = getNodePos(l.target as SimNode | string);
        return (s.id === hoveredId && t.id === id) || (t.id === hoveredId && s.id === id);
      });
    },
    [hoveredId, visibleLinks, matchedIds],
  );

  const rootId = graph.nodes[0]?.id ?? '';
  const clickedNode = clickedId ? graph.nodes.find((n) => n.id === clickedId) ?? null : null;

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden">
      <svg ref={svgRef} width="100%" height="100%" className="cursor-grab active:cursor-grabbing">
        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#94a3b8" />
          </marker>
        </defs>
        <g id="zg">
          {visibleLinks.map((link, i) => {
            const s = getNodePos(link.source as SimNode | string);
            const t = getNodePos(link.target as SimNode | string);
            const visible = isVisible(s.id) && isVisible(t.id);
            return (
              <line
                key={i}
                x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                stroke="#94a3b8"
                strokeWidth={1.5}
                strokeOpacity={visible ? 0.5 : 0.05}
                markerEnd="url(#arrow)"
              />
            );
          })}
          {visibleNodes.map((node) => {
            const visible = isVisible(node.id);
            const r = node.isRoot ? 22 : 13;
            const fill = RISK_FILL[node.riskLevel];
            return (
              <g
                key={node.id}
                transform={`translate(${node.x ?? 0},${node.y ?? 0})`}
                opacity={visible ? 1 : 0.15}
                onMouseEnter={() => setHoveredId(node.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => setClickedId((prev) => (prev === node.id ? null : node.id))}
                className="cursor-pointer"
              >
                <circle r={r} fill={fill} stroke="white" strokeWidth={2} />
                {node.isRoot && (
                  <circle r={r + 4} fill="none" stroke={fill} strokeWidth={1.5} opacity={0.4} />
                )}
                <text
                  y={r + 13}
                  textAnchor="middle"
                  fontSize={10}
                  fill="currentColor"
                  className="pointer-events-none select-none fill-zinc-700 dark:fill-zinc-300"
                >
                  {node.name.length > 22 ? node.name.slice(0, 20) + '…' : node.name}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
      <GraphLegend />
      <GraphControls
        activeTypes={activeTypes}
        onToggleType={handleToggleType}
        onResetZoom={handleResetZoom}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        layout={layout}
        onToggleLayout={handleToggleLayout}
        onExportSVG={handleExportSVG}
      />
      {clickedNode && (
        <NodeDetailPanel
          node={clickedNode}
          isRoot={clickedNode.id === rootId}
          onClose={() => setClickedId(null)}
        />
      )}
    </div>
  );
}

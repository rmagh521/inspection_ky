"use client";

import { useMemo, useState, useCallback } from "react";
import type { Technology, TechRelation } from "@/types/data";

const CATEGORY_COLORS: Record<string, string> = {
  OPTICAL_SENSOR: "#3b82f6",
  SOFTWARE_ALGORITHM: "#10b981",
  HARDWARE_MECHANICS: "#f59e0b",
};

const CATEGORY_LABELS: Record<string, string> = {
  OPTICAL_SENSOR: "광학/센서",
  SOFTWARE_ALGORITHM: "소프트웨어",
  HARDWARE_MECHANICS: "하드웨어",
};

interface Node {
  id: string;
  label: string;
  category: string;
  x: number;
  y: number;
  gapLevel?: string;
}

interface Edge {
  from: string;
  to: string;
  type: string;
}

function layoutNodes(technologies: Technology[]): Node[] {
  const groups: Record<string, Technology[]> = {};
  for (const t of technologies) {
    if (!groups[t.category]) groups[t.category] = [];
    groups[t.category].push(t);
  }

  const nodes: Node[] = [];
  const categoryOrder = ["OPTICAL_SENSOR", "SOFTWARE_ALGORITHM", "HARDWARE_MECHANICS"];
  const colWidth = 320;
  const rowHeight = 48;
  const startX = 40;
  const startY = 60;

  for (let ci = 0; ci < categoryOrder.length; ci++) {
    const cat = categoryOrder[ci];
    const techs = groups[cat] ?? [];
    for (let ri = 0; ri < techs.length; ri++) {
      const t = techs[ri];
      nodes.push({
        id: t.name,
        label: t.name.length > 28 ? t.name.slice(0, 26) + "..." : t.name,
        category: t.category,
        x: startX + ci * colWidth,
        y: startY + ri * rowHeight,
        gapLevel: t.kyCapability?.gapLevel,
      });
    }
  }
  return nodes;
}

interface Props {
  technologies: Technology[];
  relations: TechRelation[];
}

export function TechDependencyGraph({ technologies, relations }: Props) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const nodes = useMemo(() => layoutNodes(technologies), [technologies]);
  const nodeMap = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  const edges: Edge[] = useMemo(
    () =>
      relations
        .filter((r) => nodeMap.has(r.technologyName) && nodeMap.has(r.relatedTechnology))
        .map((r) => ({
          from: r.technologyName,
          to: r.relatedTechnology,
          type: r.relationType,
        })),
    [relations, nodeMap]
  );

  const connectedNodes = useMemo(() => {
    if (!hoveredNode) return new Set<string>();
    const connected = new Set<string>();
    connected.add(hoveredNode);
    for (const e of edges) {
      if (e.from === hoveredNode) connected.add(e.to);
      if (e.to === hoveredNode) connected.add(e.from);
    }
    return connected;
  }, [hoveredNode, edges]);

  const maxY = useMemo(() => Math.max(...nodes.map((n) => n.y)) + 60, [nodes]);
  const maxX = useMemo(() => Math.max(...nodes.map((n) => n.x)) + 280, [nodes]);

  const handleMouseEnter = useCallback((id: string) => setHoveredNode(id), []);
  const handleMouseLeave = useCallback(() => setHoveredNode(null), []);

  const gapColor = (gap?: string) => {
    if (gap === "LARGE") return "#ef4444";
    if (gap === "MEDIUM") return "#f59e0b";
    if (gap === "SMALL") return "#3b82f6";
    return "#22c55e";
  };

  return (
    <div className="overflow-x-auto">
      <svg
        width={maxX}
        height={maxY}
        className="min-w-[900px]"
        style={{ fontFamily: "system-ui, sans-serif" }}
      >
        <defs>
          <marker id="arrow-prereq" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
          </marker>
          <marker id="arrow-enables" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#8b5cf6" />
          </marker>
          <marker id="arrow-synergy" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
          </marker>
        </defs>

        {/* Category column headers */}
        {["OPTICAL_SENSOR", "SOFTWARE_ALGORITHM", "HARDWARE_MECHANICS"].map((cat, i) => (
          <text
            key={cat}
            x={40 + i * 320 + 100}
            y={25}
            textAnchor="middle"
            className="text-xs font-semibold"
            fill={CATEGORY_COLORS[cat]}
            fontSize={12}
          >
            {CATEGORY_LABELS[cat]}
          </text>
        ))}

        {/* Edges */}
        {edges.map((edge, i) => {
          const fromNode = nodeMap.get(edge.from);
          const toNode = nodeMap.get(edge.to);
          if (!fromNode || !toNode) return null;

          const isHighlighted = hoveredNode && (connectedNodes.has(edge.from) && connectedNodes.has(edge.to));
          const isDimmed = hoveredNode && !isHighlighted;

          const x1 = fromNode.x + 100;
          const y1 = fromNode.y + 14;
          const x2 = toNode.x + 100;
          const y2 = toNode.y + 14;

          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2;
          const dx = x2 - x1;
          const curveOffset = Math.abs(dx) < 50 ? (y2 > y1 ? 30 : -30) : 0;

          const stroke =
            edge.type === "PREREQUISITE" ? "#3b82f6" :
            edge.type === "ENABLES" ? "#8b5cf6" :
            "#f59e0b";

          const markerId =
            edge.type === "PREREQUISITE" ? "arrow-prereq" :
            edge.type === "ENABLES" ? "arrow-enables" :
            "arrow-synergy";

          return (
            <path
              key={i}
              d={curveOffset
                ? `M ${x1} ${y1} Q ${midX + curveOffset} ${midY} ${x2} ${y2}`
                : `M ${x1} ${y1} Q ${midX} ${midY + (Math.abs(y2 - y1) < 20 ? 20 : 0)} ${x2} ${y2}`
              }
              fill="none"
              stroke={stroke}
              strokeWidth={isHighlighted ? 2 : 1}
              strokeDasharray={edge.type === "SYNERGY" ? "4 3" : edge.type === "ENABLES" ? "6 3" : undefined}
              opacity={isDimmed ? 0.1 : isHighlighted ? 1 : 0.4}
              markerEnd={`url(#${markerId})`}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => {
          const isHighlighted = !hoveredNode || connectedNodes.has(node.id);
          const color = CATEGORY_COLORS[node.category] ?? "#64748b";

          return (
            <g
              key={node.id}
              transform={`translate(${node.x}, ${node.y})`}
              opacity={isHighlighted ? 1 : 0.2}
              onMouseEnter={() => handleMouseEnter(node.id)}
              onMouseLeave={handleMouseLeave}
              className="cursor-pointer"
            >
              <rect
                x={0}
                y={0}
                width={200}
                height={28}
                rx={4}
                fill="white"
                stroke={color}
                strokeWidth={hoveredNode === node.id ? 2 : 1}
              />
              <circle cx={10} cy={14} r={4} fill={gapColor(node.gapLevel)} />
              <text
                x={20}
                y={18}
                fontSize={10}
                fill="#334155"
              >
                {node.label}
              </text>
            </g>
          );
        })}

        {/* Legend */}
        <g transform={`translate(${maxX - 240}, ${maxY - 60})`}>
          <rect x={0} y={0} width={230} height={55} rx={4} fill="#f8fafc" stroke="#e2e8f0" />
          <line x1={10} y1={15} x2={40} y2={15} stroke="#3b82f6" strokeWidth={1.5} />
          <text x={45} y={18} fontSize={9} fill="#64748b">선행 (PREREQUISITE)</text>
          <line x1={10} y1={30} x2={40} y2={30} stroke="#8b5cf6" strokeWidth={1.5} strokeDasharray="6 3" />
          <text x={45} y={33} fontSize={9} fill="#64748b">기반 (ENABLES)</text>
          <line x1={10} y1={45} x2={40} y2={45} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 3" />
          <text x={45} y={48} fontSize={9} fill="#64748b">시너지 (SYNERGY)</text>
          <circle cx={140} cy={15} r={3} fill="#22c55e" />
          <text x={148} y={18} fontSize={9} fill="#64748b">NONE</text>
          <circle cx={140} cy={30} r={3} fill="#f59e0b" />
          <text x={148} y={33} fontSize={9} fill="#64748b">MEDIUM</text>
          <circle cx={185} cy={15} r={3} fill="#3b82f6" />
          <text x={193} y={18} fontSize={9} fill="#64748b">SMALL</text>
          <circle cx={185} cy={30} r={3} fill="#ef4444" />
          <text x={193} y={33} fontSize={9} fill="#64748b">LARGE</text>
        </g>
      </svg>
    </div>
  );
}

"use client";

import { useCallback, useMemo } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useRouter } from "next/navigation";
import MemberNode from "@/components/graph/MemberNode";
import type {
  FamilyGraphNode,
  FamilyGraphPayload,
} from "@/server/families/read-family-graph";

const EDGE_LABELS: Record<string, string> = {
  PARENT_OF: "Parent",
  SPOUSE_OF: "Spouse",
  SIBLING_OF: "Sibling",
};

const EDGE_COLORS: Record<string, string> = {
  PARENT_OF: "#d97706",
  SPOUSE_OF: "#e11d48",
  SIBLING_OF: "#059669",
};

interface Props {
  payload: FamilyGraphPayload;
  familyId: string;
}

function computeLayout(
  nodes: FamilyGraphNode[]
): (FamilyGraphNode & { position: { x: number; y: number } })[] {
  const COLUMN_GAP = 240;
  const ROW_GAP = 180;
  const PADDING_X = 60;
  const PADDING_Y = 40;

  const decadeBuckets = new Map<number, FamilyGraphNode[]>();
  const unknowns: FamilyGraphNode[] = [];

  for (const node of nodes) {
    if (node.data.birthYear !== null) {
      const decade = Math.floor(node.data.birthYear / 10) * 10;
      const bucket = decadeBuckets.get(decade) ?? [];
      bucket.push(node);
      decadeBuckets.set(decade, bucket);
    } else {
      unknowns.push(node);
    }
  }

  const sortedDecades = Array.from(decadeBuckets.keys()).sort((a, b) => a - b);

  const positioned: (FamilyGraphNode & {
    position: { x: number; y: number };
  })[] = [];
  let rowIndex = 0;

  for (const decade of sortedDecades) {
    const bucket = decadeBuckets.get(decade)!;
    bucket.sort((a, b) => {
      const ay = a.data.birthYear ?? Infinity;
      const by = b.data.birthYear ?? Infinity;
      return ay - by;
    });

    for (let col = 0; col < bucket.length; col++) {
      positioned.push({
        ...bucket[col],
        position: {
          x: PADDING_X + col * COLUMN_GAP,
          y: PADDING_Y + rowIndex * ROW_GAP,
        },
      });
    }
    rowIndex++;
  }

  if (unknowns.length > 0) {
    for (let col = 0; col < unknowns.length; col++) {
      positioned.push({
        ...unknowns[col],
        position: {
          x: PADDING_X + col * COLUMN_GAP,
          y: PADDING_Y + rowIndex * ROW_GAP,
        },
      });
    }
  }

  return positioned;
}

export default function FamilyGraphView({ payload, familyId }: Props) {
  const router = useRouter();

  const positionedNodes = useMemo(
    () => computeLayout(payload.nodes),
    [payload.nodes]
  );

  const rfNodes: Node[] = useMemo(
    () =>
      positionedNodes.map((n) => ({
        id: n.id,
        type: "memberNode",
        position: n.position,
        data: n.data,
      })),
    [positionedNodes]
  );

  const rfEdges: Edge[] = useMemo(
    () =>
      payload.edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: "smoothstep",
        label: EDGE_LABELS[edge.data.relationshipType] ?? edge.data.relationshipType,
        labelStyle: { fontSize: 11, fontWeight: 600 },
        labelBgStyle: {
          fill: EDGE_COLORS[edge.data.relationshipType] ?? "#64748b",
          fillOpacity: 0.12,
        },
        labelBgPadding: [6, 3] as [number, number],
        labelBgBorderRadius: 4,
        style: {
          stroke: EDGE_COLORS[edge.data.relationshipType] ?? "#94a3b8",
          strokeWidth: 1.5,
        },
        animated: edge.data.isPrimary,
      })),
    [payload.edges]
  );

  const [nodes, , onNodesChange] = useNodesState(rfNodes);
  const [edges, , onEdgesChange] = useEdgesState(rfEdges);

  const nodeTypes: NodeTypes = useMemo(
    () => ({
      memberNode: MemberNode,
    }),
    []
  );

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      const memberId = node.data?.memberId as string | undefined;
      if (memberId) {
        router.push(`/families/${familyId}/members/${memberId}`);
      }
    },
    [router, familyId]
  );

  return (
    <div className="h-[72vh] w-full rounded-lg border border-slate-200 bg-white">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#e2e8f0" gap={24} />
        <Controls className="!rounded-lg !border !border-slate-200 !bg-white !shadow-sm" />
        <MiniMap
          className="!rounded-lg !border !border-slate-200 !shadow-sm"
          nodeColor="#475569"
          maskColor="rgba(248,250,252,0.6)"
        />
      </ReactFlow>
    </div>
  );
}

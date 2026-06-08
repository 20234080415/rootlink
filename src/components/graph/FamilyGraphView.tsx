"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import Link from "next/link";
import GraphRelationshipSummary from "@/components/graph/GraphRelationshipSummary";
import MemberNode from "@/components/graph/MemberNode";
import type {
  FamilyGraphNode,
  FamilyGraphPayload,
} from "@/server/families/read-family-graph";

const EDGE_LABELS: Record<string, string> = {
  PARENT_OF: "父母",
  SPOUSE_OF: "夫妻",
  SIBLING_OF: "兄弟姐妹",
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
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

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

  const [nodes, setNodes, onNodesChange] = useNodesState(rfNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(rfEdges);

  useEffect(() => {
    setNodes(rfNodes);
    setEdges(rfEdges);
  }, [rfNodes, rfEdges, setNodes, setEdges]);

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
        setSelectedMemberId(memberId);
      }
    },
    []
  );

  const selectedNode = useMemo(
    () =>
      payload.nodes.find((node) => node.data.memberId === selectedMemberId) ??
      null,
    [payload.nodes, selectedMemberId]
  );

  return (
    <div className="relative h-[72vh] w-full overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-sky-50 shadow-sm">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={() => setSelectedMemberId(null)}
        fitView
        fitViewOptions={{ padding: 0.24 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#cbd5e1" gap={28} />
        <Controls className="!rounded-lg !border !border-slate-200 !bg-white !shadow-sm" />
        <MiniMap
          className="!rounded-lg !border !border-slate-200 !shadow-sm"
          nodeColor="#475569"
          maskColor="rgba(248,250,252,0.6)"
        />
      </ReactFlow>

      {selectedNode ? (
        <aside className="absolute right-4 top-4 z-10 flex max-h-[calc(72vh-2rem)] w-[340px] max-w-[calc(100%-2rem)] flex-col gap-3 overflow-auto rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl shadow-slate-200/70 backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-400">节点详情</p>
              <h3 className="mt-1 text-base font-semibold text-slate-950">
                {selectedNode.data.fullName}
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                {selectedNode.data.birthYear ?? "出生年份未知"}
                {selectedNode.data.deathYear
                  ? ` - ${selectedNode.data.deathYear}`
                  : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedMemberId(null)}
              className="rounded-full border border-slate-200 px-2 py-0.5 text-xs text-slate-500 transition hover:bg-slate-50"
            >
              关闭
            </button>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <p className="mb-2 text-xs font-semibold text-slate-500">
              推导关系摘要
            </p>
            <GraphRelationshipSummary
              familyId={familyId}
              memberId={selectedNode.data.memberId}
            />
          </div>

          <Link
            href={`/families/${familyId}/members/${selectedNode.data.memberId}`}
            className="inline-flex justify-center rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            查看成员详情
          </Link>
        </aside>
      ) : null}
    </div>
  );
}

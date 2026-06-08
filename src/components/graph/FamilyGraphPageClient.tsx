"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import FamilyGraphView from "@/components/graph/FamilyGraphView";
import GraphModeSwitch from "@/components/graph/GraphModeSwitch";
import RelationshipCreateDrawer from "@/components/graph/RelationshipCreateDrawer";
import type {
  FamilyGraphPayload,
  FamilyGraphNode,
} from "@/server/families/read-family-graph";

interface Props {
  initialPayload: FamilyGraphPayload;
  familyId: string;
}

function getMembersFromNodes(nodes: FamilyGraphNode[]) {
  return nodes.map((node) => ({
    id: node.data.memberId,
    fullName: node.data.fullName,
  }));
}

export default function FamilyGraphPageClient({
  initialPayload,
  familyId,
}: Props) {
  const [payload, setPayload] = useState<FamilyGraphPayload>(initialPayload);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const refreshGraph = useCallback(async () => {
    try {
      const response = await fetch(`/api/v1/families/${familyId}/graph`);
      if (response.ok) {
        const json = await response.json();
        if (json?.data) {
          setPayload(json.data);
        }
      }
    } catch {
      // silently fail refresh
    }
  }, [familyId]);

  const handleSubmit = useCallback(
    async (input: {
      subjectMemberId: string;
      objectMemberId: string;
      relationshipType: string;
      startDate: string | null;
      endDate: string | null;
      isPrimary: boolean;
      source: string;
    }) => {
      setServerError(null);
      setSubmitting(true);

      try {
        const response = await fetch(
          `/api/v1/families/${familyId}/relationships`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input),
          }
        );

        const json = await response.json();

        if (!response.ok) {
          const apiError = json?.error;
          setServerError(
            apiError?.message ?? "创建关系失败，请稍后重试。"
          );
          return;
        }

        setDrawerOpen(false);
        setServerError(null);
        setSuccessMessage("关系创建成功");

        setTimeout(() => setSuccessMessage(null), 3000);

        await refreshGraph();
      } catch {
        setServerError("网络错误，请检查连接后重试。");
      } finally {
        setSubmitting(false);
      }
    },
    [familyId, refreshGraph]
  );

  const members = getMembersFromNodes(payload.nodes);

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
            <Link
              href={`/families/${familyId}`}
              className="transition hover:text-slate-700"
            >
              {payload.family.name}
            </Link>
            {" / 图谱"}
          </p>
          <h1 className="text-2xl font-semibold text-slate-950">
            家族图谱
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {successMessage ? (
            <span className="text-xs font-medium text-emerald-600">
              {successMessage}
            </span>
          ) : null}
          <span className="text-xs text-slate-400">
            {payload.nodes.length} 成员 · {payload.edges.length} 关系
          </span>
          <GraphModeSwitch familyId={familyId} activeMode="2d" />
          <button
            type="button"
            onClick={() => {
              setServerError(null);
              setDrawerOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            创建关系
          </button>
          <Link
            href={`/families/${familyId}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            返回仪表盘
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <LegendBadge color="amber" label="父母关系" />
        <LegendBadge color="rose" label="夫妻关系" />
        <LegendBadge color="emerald" label="兄弟姐妹" />
      </div>

      <FamilyGraphView payload={payload} familyId={familyId} />

      <RelationshipCreateDrawer
        open={drawerOpen}
        members={members}
        onClose={() => {
          setServerError(null);
          setDrawerOpen(false);
        }}
        onSubmit={handleSubmit}
        submitting={submitting}
        serverError={serverError}
      />
    </>
  );
}

function LegendBadge({
  color,
  label,
}: {
  color: "amber" | "rose" | "emerald";
  label: string;
}) {
  const colors: Record<string, string> = {
    amber: "bg-amber-100 text-amber-700 border-amber-200",
    rose: "bg-rose-100 text-rose-700 border-rose-200",
    emerald: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${colors[color]}`}
    >
      <span
        className={`inline-block h-1.5 w-1.5 rounded-full ${
          color === "amber"
            ? "bg-amber-500"
            : color === "rose"
              ? "bg-rose-500"
              : "bg-emerald-500"
        }`}
      />
      {label}
    </span>
  );
}

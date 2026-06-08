"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";

const ROLE_LABELS: Record<string, string> = {
  SELF: "Self",
  PROXY: "Proxy",
  GUARDIAN: "Guardian",
  FAMILY_ADMIN: "Admin",
  ARCHIVIST: "Archivist",
};

interface MemberNodeData {
  fullName: string;
  birthYear: number | null;
  deathYear: number | null;
  bioShort: string | null;
  maintenanceRole: string;
  source: string;
}

export default function MemberNode({
  data,
  selected,
}: NodeProps) {
  const d = data as unknown as MemberNodeData;
  const lifespanLabel =
    d.birthYear !== null && d.deathYear !== null
      ? `${d.birthYear} — ${d.deathYear}`
      : d.birthYear !== null
        ? `Born ${d.birthYear}`
        : d.deathYear !== null
          ? `Died ${d.deathYear}`
          : null;

  return (
    <div
      className={`relative min-w-[180px] rounded-xl border bg-white px-4 py-3 shadow-sm transition ${
        selected
          ? "border-slate-700 shadow-md ring-1 ring-slate-300"
          : "border-slate-200"
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2.5 !w-2.5 !border-2 !border-slate-400 !bg-white"
      />

      <div className="flex flex-col gap-1.5">
        <p className="text-sm font-semibold leading-tight text-slate-900">
          {d.fullName}
        </p>

        {lifespanLabel ? (
          <p className="text-xs text-slate-500">{lifespanLabel}</p>
        ) : null}

        {d.bioShort ? (
          <p className="line-clamp-2 text-xs leading-relaxed text-slate-400">
            {d.bioShort}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-1 pt-0.5">
          {d.maintenanceRole && ROLE_LABELS[d.maintenanceRole] ? (
            <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-600">
              {ROLE_LABELS[d.maintenanceRole]}
            </span>
          ) : null}
          {d.source ? (
            <span className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-blue-600">
              {d.source}
            </span>
          ) : null}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2.5 !w-2.5 !border-2 !border-slate-400 !bg-white"
      />
    </div>
  );
}

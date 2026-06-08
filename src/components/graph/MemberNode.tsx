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
  avatarUrl: string | null;
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
  const initials = d.fullName
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
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
      className={`relative min-w-[220px] rounded-2xl border bg-white/95 px-4 py-3 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md ${
        selected
          ? "border-sky-500 shadow-md ring-2 ring-sky-100"
          : "border-slate-200"
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2.5 !w-2.5 !border-2 !border-slate-400 !bg-white"
      />

      <div className="flex gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-gradient-to-br from-sky-100 to-indigo-100 text-sm font-semibold text-slate-700 shadow-inner">
          {d.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={d.avatarUrl}
              alt={`${d.fullName} 的头像`}
              className="h-full w-full object-cover"
            />
          ) : (
            <span>{initials || "?"}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-tight text-slate-900">
            {d.fullName}
          </p>

          {lifespanLabel ? (
            <p className="mt-1 text-xs text-slate-500">{lifespanLabel}</p>
          ) : null}

          {d.bioShort ? (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-400">
              {d.bioShort}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-1 pt-2">
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
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2.5 !w-2.5 !border-2 !border-slate-400 !bg-white"
      />
    </div>
  );
}

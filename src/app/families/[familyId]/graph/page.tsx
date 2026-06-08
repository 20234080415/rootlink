import Link from "next/link";
import { notFound } from "next/navigation";
import { readFamilyGraph } from "@/server/families/read-family-graph";
import { ApiError } from "@/server/api";
import FamilyGraphView from "@/components/graph/FamilyGraphView";

export default async function FamilyGraphPage({
  params,
}: {
  params: Promise<{ familyId: string }>;
}) {
  const { familyId } = await params;

  let payload;
  try {
    payload = await readFamilyGraph(familyId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  const { family, nodes, edges } = payload;

  return (
    <main className="min-h-screen px-6 py-8">
      <section className="mx-auto flex w-full max-w-[1400px] flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
              <Link
                href={`/families/${familyId}`}
                className="transition hover:text-slate-700"
              >
                {family.name}
              </Link>
              {" / 图谱"}
            </p>
            <h1 className="text-2xl font-semibold text-slate-950">
            家族图谱
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">
              {nodes.length} 成员 · {edges.length} 关系
            </span>
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
          <LegendBadge color="amber" label="Parent" />
          <LegendBadge color="rose" label="Spouse" />
          <LegendBadge color="emerald" label="Sibling" />
        </div>

        <FamilyGraphView payload={payload} familyId={familyId} />
      </section>
    </main>
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

import { readFamilyDashboardSummary } from "@/server/families/read-family";
import { ApiError } from "@/server/api";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function FamilyDashboardPage({
  params,
}: {
  params: Promise<{ familyId: string }>;
}) {
  const { familyId } = await params;

  let data;
  try {
    data = await readFamilyDashboardSummary(familyId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  const { family, summary } = data;

  return (
    <main className="min-h-screen px-6 py-10">
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
            家族仪表盘
          </p>
          <h1 className="text-3xl font-semibold text-slate-950">
            {family.name}
          </h1>
          <p className="text-sm text-slate-500">
            标识：<code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">{family.slug}</code>
          </p>
          {family.description ? (
            <p className="text-sm leading-relaxed text-slate-600">
              {family.description}
            </p>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="成员" value={summary.memberCount} />
          <StatCard label="关系" value={summary.relationshipCount} />
          <StatCard label="传记" value={summary.biographyCount} />
          <StatCard label="时间线事件" value={summary.timelineEventCount} />
        </div>

        <nav className="flex flex-wrap gap-3">
          <Link
            href={`/families/${familyId}/members/new`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            创建成员
          </Link>

          <Link
            href={`/families/${familyId}/graph`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <circle cx="5" cy="19" r="2.5" />
              <circle cx="15" cy="5" r="2.5" />
              <circle cx="19" cy="19" r="2.5" />
              <line x1="7.32" y1="17.68" x2="12.68" y2="6.32" />
              <line x1="16.68" y1="6.32" x2="17.32" y2="17.68" />
            </svg>
            查看图谱
          </Link>
        </nav>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">
            该家族创建于{" "}
            <time className="font-medium text-slate-700">
              {new Date(family.createdAt).toLocaleDateString()}
            </time>
            {" · "}
            最后更新{" "}
            <time className="font-medium text-slate-700">
              {new Date(family.updatedAt).toLocaleDateString()}
            </time>
          </p>
        </div>

        <p className="text-center text-sm text-slate-400">
          <Link href="/" className="underline transition hover:text-slate-600">
            返回 RootLink
          </Link>
        </p>
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-slate-200 bg-white px-4 py-3">
      <span className="text-2xl font-semibold text-slate-950">{value}</span>
      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </span>
    </div>
  );
}

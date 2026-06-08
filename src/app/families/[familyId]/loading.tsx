export default function FamilyDashboardLoading() {
  return (
    <main className="min-h-screen px-6 py-10">
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
          <div className="h-8 w-64 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex flex-col gap-1 rounded-lg border border-slate-200 bg-white px-4 py-3"
            >
              <div className="h-7 w-12 animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <div className="h-10 w-28 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-10 w-28 animate-pulse rounded-lg border border-slate-200 bg-white" />
        </div>

        <div className="h-12 animate-pulse rounded-lg border border-slate-200 bg-white" />
      </section>
    </main>
  );
}

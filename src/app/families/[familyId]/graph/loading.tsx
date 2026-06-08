export default function GraphLoading() {
  return (
    <main className="min-h-screen px-6 py-8">
      <section className="mx-auto flex w-full max-w-[1400px] flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <div className="h-4 w-48 animate-pulse rounded bg-slate-200" />
            <div className="h-7 w-36 animate-pulse rounded bg-slate-200" />
          </div>
          <div className="h-9 w-40 animate-pulse rounded-lg bg-slate-200" />
        </div>

        <div className="flex gap-2">
          <div className="h-6 w-16 animate-pulse rounded-full bg-slate-200" />
          <div className="h-6 w-16 animate-pulse rounded-full bg-slate-200" />
          <div className="h-6 w-16 animate-pulse rounded-full bg-slate-200" />
        </div>

        <div className="h-[72vh] animate-pulse rounded-lg border border-slate-200 bg-white" />
      </section>
    </main>
  );
}

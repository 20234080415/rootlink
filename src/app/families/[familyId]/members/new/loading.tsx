export default function NewMemberLoading() {
  return (
    <main className="min-h-screen px-6 py-8">
      <section className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <div className="flex flex-col gap-1">
          <div className="h-4 w-36 animate-pulse rounded bg-slate-200" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <div className="h-7 w-28 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-24 animate-pulse rounded-lg bg-slate-200" />
            <div className="h-9 w-24 animate-pulse rounded-lg bg-slate-200" />
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="h-4 w-16 animate-pulse rounded bg-slate-200" />
              <div className="h-9 w-full animate-pulse rounded-lg bg-slate-100" />
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <div className="h-10 w-24 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-10 w-16 animate-pulse rounded-lg border border-slate-200 bg-white" />
        </div>
      </section>
    </main>
  );
}

export default function MemberDetailLoading() {
  return (
    <main className="min-h-screen px-6 py-8">
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div className="h-4 w-48 animate-pulse rounded bg-slate-200" />

        <div className="flex items-center justify-between">
          <div className="h-8 w-56 animate-pulse rounded bg-slate-200" />
          <div className="flex gap-2">
            <div className="h-9 w-24 animate-pulse rounded-lg bg-slate-200" />
            <div className="h-9 w-28 animate-pulse rounded-lg bg-slate-200" />
          </div>
        </div>

        <div className="flex items-start gap-4 rounded-lg border border-slate-200 bg-white p-5">
          <div className="h-16 w-16 animate-pulse rounded-full bg-slate-200" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-48 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-72 animate-pulse rounded bg-slate-200" />
            <div className="flex gap-2">
              <div className="h-5 w-14 animate-pulse rounded-full bg-slate-200" />
              <div className="h-5 w-20 animate-pulse rounded-full bg-slate-200" />
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-3">
            <div className="h-6 w-24 animate-pulse rounded bg-slate-200" />
            <div className="h-32 animate-pulse rounded-lg bg-slate-100" />
          </div>
          <div className="flex flex-col gap-3">
            <div className="h-6 w-24 animate-pulse rounded bg-slate-200" />
            <div className="h-32 animate-pulse rounded-lg bg-slate-100" />
          </div>
        </div>
      </section>
    </main>
  );
}

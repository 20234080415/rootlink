import Link from "next/link";

export default function Graph3DNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
      <section className="max-w-md rounded-2xl border border-slate-700 bg-slate-900/80 p-6 text-center">
        <h1 className="text-lg font-semibold">暂无可展示的家族关系</h1>
        <p className="mt-2 text-sm text-slate-400">
          没有找到对应家族，或当前家族还没有可展示的数据。
        </p>
        <Link
          href="/"
          className="mt-5 inline-flex rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-800"
        >
          返回 RootLink
        </Link>
      </section>
    </main>
  );
}

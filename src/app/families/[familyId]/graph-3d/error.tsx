"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Graph3DError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("3D family graph error:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
      <section className="max-w-md rounded-2xl border border-red-400/30 bg-red-950/30 p-6 text-center shadow-2xl shadow-red-950/30">
        <h1 className="text-lg font-semibold text-red-100">
          3D 家族星图加载失败
        </h1>
        <p className="mt-2 text-sm text-red-200">
          错误：无法加载 3D 家族星图，请稍后重试。
        </p>
        <div className="mt-5 flex justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-lg bg-red-100 px-4 py-2 text-sm font-semibold text-red-950 transition hover:bg-red-50"
          >
            重试
          </button>
          <Link
            href="/"
            className="rounded-lg border border-red-200/30 px-4 py-2 text-sm font-medium text-red-50 transition hover:bg-red-100/10"
          >
            返回 RootLink
          </Link>
        </div>
      </section>
    </main>
  );
}

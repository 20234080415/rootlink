"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GraphError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Family graph error:", error);
  }, [error]);

  return (
    <main className="min-h-screen px-6 py-10">
      <section className="mx-auto flex w-full max-w-4xl flex-col items-center gap-4 py-20">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <svg
            className="h-6 w-6 text-red-500"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <h2 className="text-lg font-semibold text-slate-950">
          Could not load graph
        </h2>
        <p className="max-w-md text-center text-sm text-slate-500">
          We couldn&apos;t load the family graph. The family may not exist or
          the server might be unavailable.
        </p>

        <div className="flex gap-3 pt-2">
          <button
            onClick={reset}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Back to RootLink
          </Link>
        </div>
      </section>
    </main>
  );
}

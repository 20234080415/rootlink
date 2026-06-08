import Link from "next/link";

export default function FamilyNotFound() {
  return (
    <main className="min-h-screen px-6 py-10">
      <section className="mx-auto flex w-full max-w-4xl flex-col items-center gap-4 py-20">
        <p className="text-6xl font-light text-slate-300">404</p>

        <h2 className="text-lg font-semibold text-slate-950">
          Family not found
        </h2>
        <p className="max-w-md text-center text-sm text-slate-500">
          The family you&apos;re looking for doesn&apos;t exist or may have been
          removed.
        </p>

        <Link
          href="/"
          className="mt-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Back to RootLink
        </Link>
      </section>
    </main>
  );
}

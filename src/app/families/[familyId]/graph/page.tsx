import { notFound } from "next/navigation";
import { readFamilyGraph } from "@/server/families/read-family-graph";
import { ApiError } from "@/server/api";
import FamilyGraphPageClient from "@/components/graph/FamilyGraphPageClient";

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

  return (
    <main className="min-h-screen px-6 py-8">
      <section className="mx-auto flex w-full max-w-[1400px] flex-col gap-4">
        <FamilyGraphPageClient
          initialPayload={payload}
          familyId={familyId}
        />
      </section>
    </main>
  );
}

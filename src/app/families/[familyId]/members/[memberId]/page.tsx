import { readMemberDetail } from "@/server/members/read-member";
import { ApiError } from "@/server/api";
import { notFound } from "next/navigation";
import MemberDetailPageClient from "@/components/member/MemberDetailPageClient";

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ familyId: string; memberId: string }>;
}) {
  const { familyId, memberId } = await params;

  let data;
  try {
    data = await readMemberDetail(familyId, memberId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  return (
    <main className="min-h-screen px-6 py-8">
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <MemberDetailPageClient
          initialData={data}
          familyId={familyId}
          memberId={memberId}
        />
      </section>
    </main>
  );
}

import FamilyGraph3DPageClient from "@/components/graph/FamilyGraph3DPageClient";

export default async function FamilyGraph3DPage({
  params,
}: {
  params: Promise<{ familyId: string }>;
}) {
  const { familyId } = await params;

  return <FamilyGraph3DPageClient familyId={familyId} />;
}

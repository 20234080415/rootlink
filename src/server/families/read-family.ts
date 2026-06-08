import { ApiError, API_ERROR_CODES, assertUuid } from "@/server/api";
import { prisma } from "@/server/db/prisma";

export type FamilyDashboardSummary = {
  family: {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
  };
  summary: {
    memberCount: number;
    relationshipCount: number;
    biographyCount: number;
    timelineEventCount: number;
  };
};

export async function readFamilyDashboardSummary(
  familyId: string
): Promise<FamilyDashboardSummary> {
  assertUuid(familyId, "familyId");

  const family = await prisma.family.findUnique({
    where: {
      id: familyId,
    },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          members: true,
          relationships: true,
          biographies: true,
          timelineEvents: true,
        },
      },
    },
  });

  if (!family) {
    throw new ApiError(
      API_ERROR_CODES.NOT_FOUND,
      "Family was not found.",
      404,
      {
        familyId: "No family exists for this id.",
      }
    );
  }

  return {
    family: {
      id: family.id,
      slug: family.slug,
      name: family.name,
      description: family.description,
      createdAt: family.createdAt.toISOString(),
      updatedAt: family.updatedAt.toISOString(),
    },
    summary: {
      memberCount: family._count.members,
      relationshipCount: family._count.relationships,
      biographyCount: family._count.biographies,
      timelineEventCount: family._count.timelineEvents,
    },
  };
}

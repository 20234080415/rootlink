import { ApiError, API_ERROR_CODES } from "@/server/api";
import { prisma } from "@/server/db/prisma";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

function assertFamilyId(value: string) {
  if (!UUID_PATTERN.test(value)) {
    throw new ApiError(
      API_ERROR_CODES.VALIDATION_ERROR,
      "Family id must be a valid UUID.",
      400,
      {
        familyId: "Expected a UUID.",
      }
    );
  }
}

export async function readFamilyDashboardSummary(
  familyId: string
): Promise<FamilyDashboardSummary> {
  assertFamilyId(familyId);

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

import { ApiError, API_ERROR_CODES, assertUuid } from "@/server/api";
import { prisma } from "@/server/db/prisma";

export type FamilyGraphNode = {
  id: string;
  type: "memberNode";
  position: {
    x: number;
    y: number;
  };
  data: {
    memberId: string;
    fullName: string;
    avatarUrl: string | null;
    birthYear: number | null;
    deathYear: number | null;
    bioShort: string | null;
    maintenanceRole: string;
    source: string;
  };
};

export type FamilyGraphEdge = {
  id: string;
  source: string;
  target: string;
  type: "smoothstep";
  data: {
    relationshipId: string;
    relationshipType: string;
    isPrimary: boolean;
    source: string;
  };
};

export type FamilyGraphPayload = {
  family: {
    id: string;
    name: string;
    slug: string;
  };
  nodes: FamilyGraphNode[];
  edges: FamilyGraphEdge[];
};

export type FamilyGraphMeta = {
  counts: {
    nodes: number;
    edges: number;
  };
};

function extractYear(value: Date | null): number | null {
  if (!value) return null;
  return value.getFullYear();
}

function getInitialPosition(index: number) {
  const columns = 5;
  const column = index % columns;
  const row = Math.floor(index / columns);

  return {
    x: column * 240,
    y: row * 160,
  };
}

export async function readFamilyGraph(
  familyId: string
): Promise<FamilyGraphPayload> {
  assertUuid(familyId, "familyId");

  const family = await prisma.family.findUnique({
    where: {
      id: familyId,
    },
    select: {
      id: true,
      name: true,
      slug: true,
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

  const [members, relationships] = await Promise.all([
    prisma.member.findMany({
      where: {
        familyId,
      },
      select: {
        id: true,
        fullName: true,
        avatarUrl: true,
        birthDate: true,
        deathDate: true,
        bioShort: true,
        maintenanceRole: true,
        source: true,
      },
      orderBy: {
        fullName: "asc",
      },
    }),
    prisma.relationship.findMany({
      where: {
        familyId,
      },
      select: {
        id: true,
        subjectMemberId: true,
        objectMemberId: true,
        relationshipType: true,
        isPrimary: true,
        source: true,
      },
    }),
  ]);

  const nodes: FamilyGraphNode[] = members.map((member, index) => ({
    id: member.id,
    type: "memberNode",
    position: getInitialPosition(index),
    data: {
      memberId: member.id,
      fullName: member.fullName,
      avatarUrl: member.avatarUrl,
      birthYear: extractYear(member.birthDate),
      deathYear: extractYear(member.deathDate),
      bioShort: member.bioShort,
      maintenanceRole: member.maintenanceRole,
      source: member.source,
    },
  }));

  const edges: FamilyGraphEdge[] = relationships.map((relationship) => ({
    id: relationship.id,
    source: relationship.subjectMemberId,
    target: relationship.objectMemberId,
    type: "smoothstep",
    data: {
      relationshipId: relationship.id,
      relationshipType: relationship.relationshipType,
      isPrimary: relationship.isPrimary,
      source: relationship.source,
    },
  }));

  return {
    family: {
      id: family.id,
      name: family.name,
      slug: family.slug,
    },
    nodes,
    edges,
  };
}

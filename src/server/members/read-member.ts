import { ApiError, API_ERROR_CODES, assertUuid } from "@/server/api";
import { prisma } from "@/server/db/prisma";

export type MemberDetail = {
  member: {
    id: string;
    familyId: string;
    claimedByUserId: string | null;
    fullName: string;
    gender: string | null;
    birthDate: string | null;
    deathDate: string | null;
    avatarUrl: string | null;
    bioShort: string | null;
    maintenanceRole: string;
    source: string;
    createdAt: string;
    updatedAt: string;
  };
  biography: {
    id: string;
    contentMd: string;
    source: string;
    maintenanceRole: string;
    visibility: string;
    updatedAt: string;
  } | null;
  timelineEvents: Array<{
    id: string;
    title: string;
    description: string | null;
    eventDate: string | null;
    sortDate: string;
    dateLabel: string | null;
    isApproximate: boolean;
    source: string;
    maintenanceRole: string;
    visibility: string;
  }>;
  relationships: Array<{
    id: string;
    relationshipType: string;
    direction: "SUBJECT" | "OBJECT";
    relatedMember: {
      id: string;
      fullName: string;
    };
    startDate: string | null;
    endDate: string | null;
    isPrimary: boolean;
    source: string;
  }>;
};

function toDateString(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : null;
}

function toIsoString(value: Date) {
  return value.toISOString();
}

export async function readMemberDetail(
  familyId: string,
  memberId: string
): Promise<MemberDetail> {
  assertUuid(familyId, "familyId");
  assertUuid(memberId, "memberId");

  const member = await prisma.member.findFirst({
    where: {
      id: memberId,
      familyId,
    },
    select: {
      id: true,
      familyId: true,
      claimedByUserId: true,
      fullName: true,
      gender: true,
      birthDate: true,
      deathDate: true,
      avatarUrl: true,
      bioShort: true,
      maintenanceRole: true,
      source: true,
      createdAt: true,
      updatedAt: true,
      biography: {
        select: {
          id: true,
          contentMd: true,
          source: true,
          maintenanceRole: true,
          visibility: true,
          updatedAt: true,
        },
      },
      timelineEvents: {
        orderBy: [
          {
            sortDate: "asc",
          },
          {
            createdAt: "asc",
          },
        ],
        select: {
          id: true,
          title: true,
          description: true,
          eventDate: true,
          sortDate: true,
          dateLabel: true,
          isApproximate: true,
          source: true,
          maintenanceRole: true,
          visibility: true,
        },
      },
      subjectRelationships: {
        select: {
          id: true,
          relationshipType: true,
          startDate: true,
          endDate: true,
          isPrimary: true,
          source: true,
          objectMember: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      },
      objectRelationships: {
        select: {
          id: true,
          relationshipType: true,
          startDate: true,
          endDate: true,
          isPrimary: true,
          source: true,
          subjectMember: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      },
    },
  });

  if (!member) {
    throw new ApiError(
      API_ERROR_CODES.NOT_FOUND,
      "Member was not found in this family.",
      404,
      {
        memberId: "No member exists for this family and member id.",
      }
    );
  }

  return {
    member: {
      id: member.id,
      familyId: member.familyId,
      claimedByUserId: member.claimedByUserId,
      fullName: member.fullName,
      gender: member.gender,
      birthDate: toDateString(member.birthDate),
      deathDate: toDateString(member.deathDate),
      avatarUrl: member.avatarUrl,
      bioShort: member.bioShort,
      maintenanceRole: member.maintenanceRole,
      source: member.source,
      createdAt: toIsoString(member.createdAt),
      updatedAt: toIsoString(member.updatedAt),
    },
    biography: member.biography
      ? {
          id: member.biography.id,
          contentMd: member.biography.contentMd,
          source: member.biography.source,
          maintenanceRole: member.biography.maintenanceRole,
          visibility: member.biography.visibility,
          updatedAt: toIsoString(member.biography.updatedAt),
        }
      : null,
    timelineEvents: member.timelineEvents.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      eventDate: toDateString(event.eventDate),
      sortDate: toDateString(event.sortDate) ?? "",
      dateLabel: event.dateLabel,
      isApproximate: event.isApproximate,
      source: event.source,
      maintenanceRole: event.maintenanceRole,
      visibility: event.visibility,
    })),
    relationships: [
      ...member.subjectRelationships.map((relationship) => ({
        id: relationship.id,
        relationshipType: relationship.relationshipType,
        direction: "SUBJECT" as const,
        relatedMember: relationship.objectMember,
        startDate: toDateString(relationship.startDate),
        endDate: toDateString(relationship.endDate),
        isPrimary: relationship.isPrimary,
        source: relationship.source,
      })),
      ...member.objectRelationships.map((relationship) => ({
        id: relationship.id,
        relationshipType: relationship.relationshipType,
        direction: "OBJECT" as const,
        relatedMember: relationship.subjectMember,
        startDate: toDateString(relationship.startDate),
        endDate: toDateString(relationship.endDate),
        isPrimary: relationship.isPrimary,
        source: relationship.source,
      })),
    ],
  };
}

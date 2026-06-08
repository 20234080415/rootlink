import { ApiError, API_ERROR_CODES, assertUuid } from "@/server/api";
import { prisma } from "@/server/db/prisma";
import type { FieldErrors } from "@/server/api";

const DATA_SOURCES = new Set([
  "SELF_REPORTED",
  "PROXY_RECORDED",
  "INTERVIEW",
  "FAMILY_MEMORY",
  "IMPORTED",
  "ADMIN_CREATED",
]);

const MAINTENANCE_ROLES = new Set([
  "SELF",
  "PROXY",
  "GUARDIAN",
  "FAMILY_ADMIN",
  "ARCHIVIST",
]);

const VISIBILITIES = new Set(["FAMILY", "ADMINS_ONLY", "PRIVATE_TO_MAINTAINERS"]);

export type UpsertBiographyInput = {
  contentMd: string;
  source?: string;
  maintenanceRole?: string;
  visibility?: string;
};

export type UpsertedBiography = {
  biography: {
    id: string;
    familyId: string;
    memberId: string;
    contentMd: string;
    source: string;
    maintenanceRole: string;
    visibility: string;
    createdAt: string;
    updatedAt: string;
  };
};

function toIsoString(value: Date) {
  return value.toISOString();
}

function validateUpsertBiographyInput(value: unknown): {
  data?: UpsertBiographyInput;
  fieldErrors?: FieldErrors;
} {
  const fieldErrors: FieldErrors = {};

  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return { fieldErrors: { body: "请求体必须是一个 JSON 对象。" } };
  }

  const body = value as Record<string, unknown>;

  if (!("contentMd" in body)) {
    fieldErrors.contentMd = "传记内容字段必须存在。";
  } else if (typeof body.contentMd !== "string") {
    fieldErrors.contentMd = "传记内容必须为字符串。";
  }

  let source = body.source;
  if (source === null || source === undefined || source === "") {
    source = "ADMIN_CREATED";
  } else if (typeof source !== "string" || !DATA_SOURCES.has(source)) {
    fieldErrors.source = "来源不存在。";
  }

  let maintenanceRole = body.maintenanceRole;
  if (
    maintenanceRole === null ||
    maintenanceRole === undefined ||
    maintenanceRole === ""
  ) {
    maintenanceRole = "PROXY";
  } else if (
    typeof maintenanceRole !== "string" ||
    !MAINTENANCE_ROLES.has(maintenanceRole)
  ) {
    fieldErrors.maintenanceRole = "维护角色不存在。";
  }

  let visibility = body.visibility;
  if (visibility === null || visibility === undefined || visibility === "") {
    visibility = "FAMILY";
  } else if (
    typeof visibility !== "string" ||
    !VISIBILITIES.has(visibility)
  ) {
    fieldErrors.visibility = "可见性不存在。";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  return {
    data: {
      contentMd: body.contentMd as string,
      source: source as string,
      maintenanceRole: maintenanceRole as string,
      visibility: visibility as string,
    },
  };
}

export async function upsertBiography(
  familyId: string,
  memberId: string,
  input: UpsertBiographyInput
): Promise<UpsertedBiography> {
  assertUuid(familyId, "familyId");
  assertUuid(memberId, "memberId");

  const family = await prisma.family.findUnique({
    where: { id: familyId },
    select: { id: true },
  });

  if (!family) {
    throw new ApiError(API_ERROR_CODES.NOT_FOUND, "指定的家族不存在。", 404, {
      familyId: "未找到对应 ID 的家族。",
    });
  }

  const member = await prisma.member.findFirst({
    where: {
      id: memberId,
      familyId,
    },
    select: { id: true },
  });

  if (!member) {
    throw new ApiError(
      API_ERROR_CODES.NOT_FOUND,
      "成员在此家族中不存在。",
      404,
      {
        memberId: "未找到此家族中的成员。",
      }
    );
  }

  const biography = await prisma.biography.upsert({
    where: {
      memberId,
    },
    create: {
      familyId,
      memberId,
      contentMd: input.contentMd,
      source: input.source as
        | "SELF_REPORTED"
        | "PROXY_RECORDED"
        | "INTERVIEW"
        | "FAMILY_MEMORY"
        | "IMPORTED"
        | "ADMIN_CREATED",
      maintenanceRole: input.maintenanceRole as
        | "SELF"
        | "PROXY"
        | "GUARDIAN"
        | "FAMILY_ADMIN"
        | "ARCHIVIST",
      visibility: input.visibility as
        | "FAMILY"
        | "ADMINS_ONLY"
        | "PRIVATE_TO_MAINTAINERS",
    },
    update: {
      contentMd: input.contentMd,
      source: input.source as
        | "SELF_REPORTED"
        | "PROXY_RECORDED"
        | "INTERVIEW"
        | "FAMILY_MEMORY"
        | "IMPORTED"
        | "ADMIN_CREATED",
      maintenanceRole: input.maintenanceRole as
        | "SELF"
        | "PROXY"
        | "GUARDIAN"
        | "FAMILY_ADMIN"
        | "ARCHIVIST",
      visibility: input.visibility as
        | "FAMILY"
        | "ADMINS_ONLY"
        | "PRIVATE_TO_MAINTAINERS",
    },
  });

  return {
    biography: {
      id: biography.id,
      familyId: biography.familyId,
      memberId: biography.memberId,
      contentMd: biography.contentMd,
      source: biography.source,
      maintenanceRole: biography.maintenanceRole,
      visibility: biography.visibility,
      createdAt: toIsoString(biography.createdAt),
      updatedAt: toIsoString(biography.updatedAt),
    },
  };
}

export { validateUpsertBiographyInput };

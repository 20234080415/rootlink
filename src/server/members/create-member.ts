import { ApiError, API_ERROR_CODES, assertUuid } from "@/server/api";
import { prisma } from "@/server/db/prisma";
import type { FieldErrors } from "@/server/api";

const GENDERS = new Set(["MALE", "FEMALE", "OTHER", "UNKNOWN"]);
const MAINTENANCE_ROLES = new Set([
  "SELF",
  "PROXY",
  "GUARDIAN",
  "FAMILY_ADMIN",
  "ARCHIVIST",
]);
const DATA_SOURCES = new Set([
  "SELF_REPORTED",
  "PROXY_RECORDED",
  "INTERVIEW",
  "FAMILY_MEMORY",
  "IMPORTED",
  "ADMIN_CREATED",
]);

export type CreateMemberInput = {
  fullName: string;
  gender?: string | null;
  birthDate?: string | null;
  deathDate?: string | null;
  avatarUrl?: string | null;
  bioShort?: string | null;
  maintenanceRole?: string;
  source?: string;
  claimedByUserId?: string | null;
};

export type CreatedMember = {
  member: {
    id: string;
    familyId: string;
    fullName: string;
    gender: string | null;
    birthDate: string | null;
    deathDate: string | null;
    avatarUrl: string | null;
    bioShort: string | null;
    maintenanceRole: string;
    source: string;
    claimedByUserId: string | null;
    createdAt: string;
    updatedAt: string;
  };
};

function toDateString(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : null;
}

function toIsoString(value: Date) {
  return value.toISOString();
}

function parseDateString(
  value: unknown,
  fieldName: string,
  fieldErrors: FieldErrors
): Date | null | undefined {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    fieldErrors[fieldName] = "格式错误，应为 YYYY-MM-DD。";
    return undefined;
  }

  const trimmed = value.trim();
  const match = trimmed.match(/^\d{4}-\d{2}-\d{2}$/);

  if (!match) {
    fieldErrors[fieldName] = "格式错误，应为 YYYY-MM-DD。";
    return undefined;
  }

  const date = new Date(trimmed + "T00:00:00");

  if (isNaN(date.getTime())) {
    fieldErrors[fieldName] = "不是有效的日期。";
    return undefined;
  }

  return date;
}

function validateCreateMemberInput(value: unknown): {
  data?: CreateMemberInput;
  fieldErrors?: FieldErrors;
} {
  const fieldErrors: FieldErrors = {};

  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return { fieldErrors: { body: "请求体必须是一个 JSON 对象。" } };
  }

  const body = value as Record<string, unknown>;

  const fullName = body.fullName;
  if (typeof fullName !== "string" || fullName.trim().length === 0) {
    fieldErrors.fullName = "姓名不能为空。";
  } else if (fullName.trim().length > 120) {
    fieldErrors.fullName = "姓名不能超过 120 个字符。";
  }

  let gender: string | null | undefined;
  if (body.gender === null || body.gender === undefined || body.gender === "") {
    gender = null;
  } else if (
    typeof body.gender === "string" &&
    GENDERS.has(body.gender.toUpperCase())
  ) {
    gender = body.gender.toUpperCase();
  } else {
    fieldErrors.gender = "性别必须为 MALE、FEMALE、OTHER 或 UNKNOWN。";
  }

  const birthDateParsed = parseDateString(
    body.birthDate,
    "birthDate",
    fieldErrors
  );

  const deathDateParsed = parseDateString(
    body.deathDate,
    "deathDate",
    fieldErrors
  );

  if (
    birthDateParsed !== undefined &&
    birthDateParsed !== null &&
    deathDateParsed !== undefined &&
    deathDateParsed !== null &&
    birthDateParsed > deathDateParsed
  ) {
    fieldErrors.birthDate = "出生日期不能晚于死亡日期。";
    fieldErrors.deathDate = "死亡日期不能早于出生日期。";
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
    fieldErrors.maintenanceRole =
      "维护角色必须为 SELF、PROXY、GUARDIAN、FAMILY_ADMIN 或 ARCHIVIST。";
  }

  let source = body.source;
  if (source === null || source === undefined || source === "") {
    source = "ADMIN_CREATED";
  } else if (typeof source !== "string" || !DATA_SOURCES.has(source)) {
    fieldErrors.source =
      "来源必须为 SELF_REPORTED、PROXY_RECORDED、INTERVIEW、FAMILY_MEMORY、IMPORTED 或 ADMIN_CREATED。";
  }

  let avatarUrl: string | null | undefined;
  if (
    body.avatarUrl === null ||
    body.avatarUrl === undefined ||
    body.avatarUrl === ""
  ) {
    avatarUrl = null;
  } else if (typeof body.avatarUrl === "string") {
    avatarUrl = body.avatarUrl;
  } else {
    fieldErrors.avatarUrl = "头像 URL 格式不正确。";
  }

  let bioShort: string | null | undefined;
  if (
    body.bioShort === null ||
    body.bioShort === undefined ||
    body.bioShort === ""
  ) {
    bioShort = null;
  } else if (typeof body.bioShort === "string") {
    bioShort = body.bioShort;
  } else {
    fieldErrors.bioShort = "简介格式不正确。";
  }

  let claimedByUserId: string | null | undefined;
  if (
    body.claimedByUserId === null ||
    body.claimedByUserId === undefined ||
    body.claimedByUserId === ""
  ) {
    claimedByUserId = null;
  } else if (typeof body.claimedByUserId === "string") {
    claimedByUserId = body.claimedByUserId;
  } else {
    fieldErrors.claimedByUserId = "用户 ID 格式不正确。";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  return {
    data: {
      fullName: (fullName as string).trim(),
      gender,
      birthDate: birthDateParsed
        ? birthDateParsed.toISOString().slice(0, 10)
        : null,
      deathDate: deathDateParsed
        ? deathDateParsed.toISOString().slice(0, 10)
        : null,
      avatarUrl,
      bioShort,
      maintenanceRole: maintenanceRole as string,
      source: source as string,
      claimedByUserId,
    },
  };
}

export async function createMember(
  familyId: string,
  input: CreateMemberInput
): Promise<CreatedMember> {
  assertUuid(familyId, "familyId");

  const family = await prisma.family.findUnique({
    where: { id: familyId },
    select: { id: true },
  });

  if (!family) {
    throw new ApiError(API_ERROR_CODES.NOT_FOUND, "指定的家族不存在。", 404, {
      familyId: "未找到对应 ID 的家族。",
    });
  }

  if (
    input.claimedByUserId !== null &&
    input.claimedByUserId !== undefined
  ) {
    assertUuid(input.claimedByUserId, "claimedByUserId");

    const user = await prisma.user.findUnique({
      where: { id: input.claimedByUserId },
      select: { id: true },
    });

    if (!user) {
      throw new ApiError(
        API_ERROR_CODES.VALIDATION_ERROR,
        "指定的用户不存在。",
        400,
        {
          claimedByUserId: "未找到对应 ID 的用户。",
        }
      );
    }
  }

  const birthDateObj = input.birthDate
    ? new Date(input.birthDate + "T00:00:00")
    : null;
  const deathDateObj = input.deathDate
    ? new Date(input.deathDate + "T00:00:00")
    : null;

  const member = await prisma.member.create({
    data: {
      familyId,
      fullName: input.fullName,
      gender: (input.gender as
        | "MALE"
        | "FEMALE"
        | "OTHER"
        | "UNKNOWN"
        | null) ?? null,
      birthDate: birthDateObj,
      deathDate: deathDateObj,
      avatarUrl: input.avatarUrl ?? null,
      bioShort: input.bioShort ?? null,
      maintenanceRole: input.maintenanceRole as
        | "SELF"
        | "PROXY"
        | "GUARDIAN"
        | "FAMILY_ADMIN"
        | "ARCHIVIST",
      source: input.source as
        | "SELF_REPORTED"
        | "PROXY_RECORDED"
        | "INTERVIEW"
        | "FAMILY_MEMORY"
        | "IMPORTED"
        | "ADMIN_CREATED",
      claimedByUserId: input.claimedByUserId ?? null,
    },
  });

  return {
    member: {
      id: member.id,
      familyId: member.familyId,
      fullName: member.fullName,
      gender: member.gender,
      birthDate: toDateString(member.birthDate),
      deathDate: toDateString(member.deathDate),
      avatarUrl: member.avatarUrl,
      bioShort: member.bioShort,
      maintenanceRole: member.maintenanceRole,
      source: member.source,
      claimedByUserId: member.claimedByUserId,
      createdAt: toIsoString(member.createdAt),
      updatedAt: toIsoString(member.updatedAt),
    },
  };
}

export { validateCreateMemberInput };

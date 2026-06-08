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

export type UpdateMemberInput = {
  fullName?: string;
  gender?: string | null;
  birthDate?: string | null;
  deathDate?: string | null;
  avatarUrl?: string | null;
  bioShort?: string | null;
  maintenanceRole?: string;
  source?: string;
  claimedByUserId?: string | null;
};

export type UpdatedMember = {
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

function parseOptionalOrNullDate(
  value: unknown,
  fieldName: string,
  fieldErrors: FieldErrors
): Date | null | undefined {
  if (value === null) {
    return null;
  }

  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string") {
    fieldErrors[fieldName] = "格式错误，应为 YYYY-MM-DD。";
    return undefined;
  }

  if (value.trim() === "") {
    return null;
  }

  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
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

function validateUpdateMemberInput(
  value: unknown,
  currentBirthDate: string | null,
  currentDeathDate: string | null
): {
  data?: UpdateMemberInput;
  fieldErrors?: FieldErrors;
} {
  const fieldErrors: FieldErrors = {};

  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return { fieldErrors: { body: "请求体必须是一个 JSON 对象。" } };
  }

  const body = value as Record<string, unknown>;

  const hasFullName = "fullName" in body;
  const hasGender = "gender" in body;
  const hasBirthDate = "birthDate" in body;
  const hasDeathDate = "deathDate" in body;
  const hasAvatarUrl = "avatarUrl" in body;
  const hasBioShort = "bioShort" in body;
  const hasMaintenanceRole = "maintenanceRole" in body;
  const hasSource = "source" in body;
  const hasClaimedByUserId = "claimedByUserId" in body;

  const hasAnyField =
    hasFullName ||
    hasGender ||
    hasBirthDate ||
    hasDeathDate ||
    hasAvatarUrl ||
    hasBioShort ||
    hasMaintenanceRole ||
    hasSource ||
    hasClaimedByUserId;

  if (!hasAnyField) {
    return { fieldErrors: { body: "没有提供任何可更新的字段。" } };
  }

  let fullName: string | undefined;
  if (hasFullName) {
    if (typeof body.fullName !== "string" || body.fullName.trim().length === 0) {
      fieldErrors.fullName = "姓名不能为空。";
    } else if (body.fullName.trim().length > 120) {
      fieldErrors.fullName = "姓名不能超过 120 个字符。";
    } else {
      fullName = body.fullName.trim();
    }
  }

  let gender: string | null | undefined;
  if (hasGender) {
    if (body.gender === null) {
      gender = null;
    } else if (
      typeof body.gender === "string" &&
      GENDERS.has(body.gender.toUpperCase())
    ) {
      gender = body.gender.toUpperCase();
    } else {
      fieldErrors.gender = "性别必须为 MALE、FEMALE、OTHER 或 UNKNOWN。";
    }
  }

  const birthDateParsed = hasBirthDate
    ? parseOptionalOrNullDate(body.birthDate, "birthDate", fieldErrors)
    : undefined;

  const deathDateParsed = hasDeathDate
    ? parseOptionalOrNullDate(body.deathDate, "deathDate", fieldErrors)
    : undefined;

  const effectiveBirth =
    birthDateParsed !== undefined
      ? birthDateParsed
      : currentBirthDate
        ? new Date(currentBirthDate + "T00:00:00")
        : null;

  const effectiveDeath =
    deathDateParsed !== undefined
      ? deathDateParsed
      : currentDeathDate
        ? new Date(currentDeathDate + "T00:00:00")
        : null;

  if (effectiveBirth && effectiveDeath && effectiveBirth > effectiveDeath) {
    fieldErrors.birthDate = "出生日期不能晚于死亡日期。";
    fieldErrors.deathDate = "死亡日期不能早于出生日期。";
  }

  let maintenanceRole: string | undefined;
  if (hasMaintenanceRole) {
    if (
      typeof body.maintenanceRole !== "string" ||
      !MAINTENANCE_ROLES.has(body.maintenanceRole)
    ) {
      fieldErrors.maintenanceRole =
        "维护角色不存在。";
    } else {
      maintenanceRole = body.maintenanceRole;
    }
  }

  let source: string | undefined;
  if (hasSource) {
    if (typeof body.source !== "string" || !DATA_SOURCES.has(body.source)) {
      fieldErrors.source = "来源不存在。";
    } else {
      source = body.source;
    }
  }

  let avatarUrl: string | null | undefined;
  if (hasAvatarUrl) {
    if (body.avatarUrl === null) {
      avatarUrl = null;
    } else if (typeof body.avatarUrl === "string") {
      avatarUrl = body.avatarUrl;
    } else {
      fieldErrors.avatarUrl = "头像 URL 格式不正确。";
    }
  }

  let bioShort: string | null | undefined;
  if (hasBioShort) {
    if (body.bioShort === null) {
      bioShort = null;
    } else if (typeof body.bioShort === "string") {
      bioShort = body.bioShort;
    } else {
      fieldErrors.bioShort = "简介格式不正确。";
    }
  }

  let claimedByUserId: string | null | undefined;
  if (hasClaimedByUserId) {
    if (body.claimedByUserId === null) {
      claimedByUserId = null;
    } else if (typeof body.claimedByUserId === "string") {
      claimedByUserId = body.claimedByUserId;
    } else {
      fieldErrors.claimedByUserId = "用户 ID 格式不正确。";
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  return {
    data: {
      fullName,
      gender,
      birthDate:
        birthDateParsed === undefined
          ? undefined
          : birthDateParsed
            ? birthDateParsed.toISOString().slice(0, 10)
            : null,
      deathDate:
        deathDateParsed === undefined
          ? undefined
          : deathDateParsed
            ? deathDateParsed.toISOString().slice(0, 10)
            : null,
      avatarUrl,
      bioShort,
      maintenanceRole,
      source,
      claimedByUserId,
    },
  };
}

export async function updateMember(
  familyId: string,
  memberId: string,
  input: UpdateMemberInput
): Promise<UpdatedMember> {
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
    select: {
      id: true,
      birthDate: true,
      deathDate: true,
    },
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

  const effectiveBd =
    input.birthDate !== undefined
      ? input.birthDate
      : toDateString(member.birthDate);
  const effectiveDd =
    input.deathDate !== undefined
      ? input.deathDate
      : toDateString(member.deathDate);

  if (
    effectiveBd &&
    effectiveDd &&
    new Date(effectiveBd + "T00:00:00") > new Date(effectiveDd + "T00:00:00")
  ) {
    throw new ApiError(
      API_ERROR_CODES.VALIDATION_ERROR,
      "出生日期不能晚于死亡日期。",
      400,
      {
        birthDate: "出生日期不能晚于死亡日期。",
        deathDate: "死亡日期不能早于出生日期。",
      }
    );
  }

  if (
    input.claimedByUserId !== undefined &&
    input.claimedByUserId !== null
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

  const updateData: Record<string, unknown> = {};

  if (input.fullName !== undefined) {
    updateData.fullName = input.fullName;
  }
  if (input.gender !== undefined) {
    updateData.gender = input.gender as "MALE" | "FEMALE" | "OTHER" | "UNKNOWN" | null;
  }
  if (input.birthDate !== undefined) {
    updateData.birthDate = input.birthDate
      ? new Date(input.birthDate + "T00:00:00")
      : null;
  }
  if (input.deathDate !== undefined) {
    updateData.deathDate = input.deathDate
      ? new Date(input.deathDate + "T00:00:00")
      : null;
  }
  if (input.avatarUrl !== undefined) {
    updateData.avatarUrl = input.avatarUrl;
  }
  if (input.bioShort !== undefined) {
    updateData.bioShort = input.bioShort;
  }
  if (input.maintenanceRole !== undefined) {
    updateData.maintenanceRole = input.maintenanceRole as
      | "SELF"
      | "PROXY"
      | "GUARDIAN"
      | "FAMILY_ADMIN"
      | "ARCHIVIST";
  }
  if (input.source !== undefined) {
    updateData.source = input.source as
      | "SELF_REPORTED"
      | "PROXY_RECORDED"
      | "INTERVIEW"
      | "FAMILY_MEMORY"
      | "IMPORTED"
      | "ADMIN_CREATED";
  }
  if (input.claimedByUserId !== undefined) {
    updateData.claimedByUserId = input.claimedByUserId;
  }

  const updated = await prisma.member.update({
    where: { id: memberId },
    data: updateData,
  });

  return {
    member: {
      id: updated.id,
      familyId: updated.familyId,
      fullName: updated.fullName,
      gender: updated.gender,
      birthDate: toDateString(updated.birthDate),
      deathDate: toDateString(updated.deathDate),
      avatarUrl: updated.avatarUrl,
      bioShort: updated.bioShort,
      maintenanceRole: updated.maintenanceRole,
      source: updated.source,
      claimedByUserId: updated.claimedByUserId,
      createdAt: toIsoString(updated.createdAt),
      updatedAt: toIsoString(updated.updatedAt),
    },
  };
}

export { validateUpdateMemberInput };

import { ApiError, API_ERROR_CODES, assertUuid } from "@/server/api";
import { prisma } from "@/server/db/prisma";
import type { FieldErrors } from "@/server/api";

const RELATIONSHIP_TYPES = new Set(["PARENT_OF", "SPOUSE_OF", "SIBLING_OF"]);
const DATA_SOURCES = new Set([
  "SELF_REPORTED",
  "PROXY_RECORDED",
  "INTERVIEW",
  "FAMILY_MEMORY",
  "IMPORTED",
  "ADMIN_CREATED",
]);

export type CreateRelationshipInput = {
  subjectMemberId: string;
  objectMemberId: string;
  relationshipType: string;
  startDate?: string | null;
  endDate?: string | null;
  isPrimary?: boolean;
  source?: string;
};

export type CreatedRelationship = {
  relationship: {
    id: string;
    familyId: string;
    subjectMemberId: string;
    objectMemberId: string;
    relationshipType: string;
    startDate: string | null;
    endDate: string | null;
    isPrimary: boolean;
    source: string;
    createdAt: string;
  };
};

function toDateString(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : null;
}

function toIsoString(value: Date) {
  return value.toISOString();
}

function parseOptionalDate(
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

function validateCreateRelationshipInput(value: unknown): {
  data?: CreateRelationshipInput;
  fieldErrors?: FieldErrors;
} {
  const fieldErrors: FieldErrors = {};

  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return { fieldErrors: { body: "请求体必须是一个 JSON 对象。" } };
  }

  const body = value as Record<string, unknown>;

  const subjectMemberId = body.subjectMemberId;
  if (typeof subjectMemberId !== "string" || subjectMemberId.trim().length === 0) {
    fieldErrors.subjectMemberId = "主体成员 ID 不能为空。";
  }

  const objectMemberId = body.objectMemberId;
  if (typeof objectMemberId !== "string" || objectMemberId.trim().length === 0) {
    fieldErrors.objectMemberId = "客体成员 ID 不能为空。";
  } else if (
    typeof subjectMemberId === "string" &&
    typeof objectMemberId === "string" &&
    subjectMemberId === objectMemberId
  ) {
    fieldErrors.subjectMemberId = "不能将成员与自身建立关系。";
    fieldErrors.objectMemberId = "不能将成员与自身建立关系。";
  }

  const relationshipType = body.relationshipType;
  if (
    typeof relationshipType !== "string" ||
    !RELATIONSHIP_TYPES.has(relationshipType)
  ) {
    fieldErrors.relationshipType =
      "关系类型必须为 PARENT_OF、SPOUSE_OF 或 SIBLING_OF。";
  }

  const startDateParsed = parseOptionalDate(
    body.startDate,
    "startDate",
    fieldErrors
  );

  const endDateParsed = parseOptionalDate(
    body.endDate,
    "endDate",
    fieldErrors
  );

  if (
    startDateParsed !== undefined &&
    startDateParsed !== null &&
    endDateParsed !== undefined &&
    endDateParsed !== null &&
    startDateParsed > endDateParsed
  ) {
    fieldErrors.startDate = "开始日期不能晚于结束日期。";
    fieldErrors.endDate = "结束日期不能早于开始日期。";
  }

  let source = body.source;
  if (source === null || source === undefined || source === "") {
    source = "ADMIN_CREATED";
  } else if (typeof source !== "string" || !DATA_SOURCES.has(source)) {
    fieldErrors.source =
      "来源必须为 SELF_REPORTED、PROXY_RECORDED、INTERVIEW、FAMILY_MEMORY、IMPORTED 或 ADMIN_CREATED。";
  }

  let isPrimary: boolean;
  if (body.isPrimary === null || body.isPrimary === undefined) {
    isPrimary = true;
  } else if (typeof body.isPrimary !== "boolean") {
    fieldErrors.isPrimary = "是否为主要关系必须为布尔值。";
    isPrimary = true;
  } else {
    isPrimary = body.isPrimary;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  return {
    data: {
      subjectMemberId: (subjectMemberId as string).trim(),
      objectMemberId: (objectMemberId as string).trim(),
      relationshipType: relationshipType as string,
      startDate: startDateParsed
        ? startDateParsed.toISOString().slice(0, 10)
        : null,
      endDate: endDateParsed
        ? endDateParsed.toISOString().slice(0, 10)
        : null,
      isPrimary,
      source: source as string,
    },
  };
}

export async function createRelationship(
  familyId: string,
  input: CreateRelationshipInput
): Promise<CreatedRelationship> {
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

  assertUuid(input.subjectMemberId, "subjectMemberId");
  assertUuid(input.objectMemberId, "objectMemberId");

  if (input.subjectMemberId === input.objectMemberId) {
    throw new ApiError(
      API_ERROR_CODES.RELATIONSHIP_SELF_LOOP,
      "不能将成员与自身建立关系。",
      400,
      {
        subjectMemberId: "不能与自身建立关系。",
        objectMemberId: "不能与自身建立关系。",
      }
    );
  }

  const members = await prisma.member.findMany({
    where: {
      familyId,
      id: { in: [input.subjectMemberId, input.objectMemberId] },
    },
    select: { id: true },
  });

  const foundIds = new Set(members.map((m) => m.id));

  if (!foundIds.has(input.subjectMemberId)) {
    throw new ApiError(
      API_ERROR_CODES.NOT_FOUND,
      "主体成员在此家族中不存在。",
      404,
      {
        subjectMemberId: "未找到此家族中的主体成员。",
      }
    );
  }

  if (!foundIds.has(input.objectMemberId)) {
    throw new ApiError(
      API_ERROR_CODES.NOT_FOUND,
      "客体成员在此家族中不存在。",
      404,
      {
        objectMemberId: "未找到此家族中的客体成员。",
      }
    );
  }

  let subjectMemberId = input.subjectMemberId;
  let objectMemberId = input.objectMemberId;

  if (
    input.relationshipType === "SPOUSE_OF" ||
    input.relationshipType === "SIBLING_OF"
  ) {
    if (subjectMemberId > objectMemberId) {
      [subjectMemberId, objectMemberId] = [objectMemberId, subjectMemberId];
    }
  }

  const existing = await prisma.relationship.findUnique({
    where: {
      familyId_relationshipType_subjectMemberId_objectMemberId: {
        familyId,
        relationshipType: input.relationshipType as
          | "PARENT_OF"
          | "SPOUSE_OF"
          | "SIBLING_OF",
        subjectMemberId,
        objectMemberId,
      },
    },
    select: { id: true },
  });

  if (existing) {
    throw new ApiError(
      API_ERROR_CODES.CONFLICT,
      "此关系已存在。",
      409,
      {
        relationshipType: "已存在相同的关系。",
      }
    );
  }

  const startDateObj = input.startDate
    ? new Date(input.startDate + "T00:00:00")
    : null;
  const endDateObj = input.endDate
    ? new Date(input.endDate + "T00:00:00")
    : null;

  const relationship = await prisma.relationship.create({
    data: {
      familyId,
      subjectMemberId,
      objectMemberId,
      relationshipType: input.relationshipType as
        | "PARENT_OF"
        | "SPOUSE_OF"
        | "SIBLING_OF",
      startDate: startDateObj,
      endDate: endDateObj,
      isPrimary: input.isPrimary ?? true,
      source: input.source as
        | "SELF_REPORTED"
        | "PROXY_RECORDED"
        | "INTERVIEW"
        | "FAMILY_MEMORY"
        | "IMPORTED"
        | "ADMIN_CREATED",
    },
  });

  return {
    relationship: {
      id: relationship.id,
      familyId: relationship.familyId,
      subjectMemberId: relationship.subjectMemberId,
      objectMemberId: relationship.objectMemberId,
      relationshipType: relationship.relationshipType,
      startDate: toDateString(relationship.startDate),
      endDate: toDateString(relationship.endDate),
      isPrimary: relationship.isPrimary,
      source: relationship.source,
      createdAt: toIsoString(relationship.createdAt),
    },
  };
}

export { validateCreateRelationshipInput };

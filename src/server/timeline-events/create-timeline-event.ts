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

export type CreateTimelineEventInput = {
  title: string;
  description?: string | null;
  eventDate?: string | null;
  sortDate: string;
  dateLabel?: string | null;
  isApproximate?: boolean;
  source?: string;
  maintenanceRole?: string;
  visibility?: string;
};

export type CreatedTimelineEvent = {
  timelineEvent: {
    id: string;
    familyId: string;
    memberId: string;
    title: string;
    description: string | null;
    eventDate: string | null;
    sortDate: string;
    dateLabel: string | null;
    isApproximate: boolean;
    source: string;
    maintenanceRole: string;
    visibility: string;
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

function parseRequiredDate(
  value: unknown,
  fieldName: string,
  fieldErrors: FieldErrors
): Date | undefined {
  if (typeof value !== "string" || value.trim().length === 0) {
    fieldErrors[fieldName] = "不能为空。";
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

function validateCreateTimelineEventInput(value: unknown): {
  data?: CreateTimelineEventInput;
  fieldErrors?: FieldErrors;
} {
  const fieldErrors: FieldErrors = {};

  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return { fieldErrors: { body: "请求体必须是一个 JSON 对象。" } };
  }

  const body = value as Record<string, unknown>;

  const title = body.title;
  if (typeof title !== "string" || title.trim().length === 0) {
    fieldErrors.title = "标题不能为空。";
  } else if (title.trim().length > 160) {
    fieldErrors.title = "标题不能超过 160 个字符。";
  }

  let description: string | null = null;
  if (
    body.description !== null &&
    body.description !== undefined &&
    body.description !== ""
  ) {
    if (typeof body.description === "string") {
      description = body.description;
    } else {
      fieldErrors.description = "描述格式不正确。";
    }
  }

  const eventDateParsed = parseOptionalDate(
    body.eventDate,
    "eventDate",
    fieldErrors
  );

  const sortDateParsed = parseRequiredDate(
    body.sortDate,
    "sortDate",
    fieldErrors
  );

  let dateLabel: string | null = null;
  if (
    body.dateLabel !== null &&
    body.dateLabel !== undefined &&
    body.dateLabel !== ""
  ) {
    if (typeof body.dateLabel === "string" && body.dateLabel.trim().length <= 80) {
      dateLabel = body.dateLabel.trim() || null;
    } else {
      fieldErrors.dateLabel = "日期标签不能超过 80 个字符。";
    }
  }

  let isApproximate: boolean;
  if (body.isApproximate === null || body.isApproximate === undefined) {
    isApproximate = false;
  } else if (typeof body.isApproximate !== "boolean") {
    fieldErrors.isApproximate = "是否近似日期必须为布尔值。";
    isApproximate = false;
  } else {
    isApproximate = body.isApproximate;
  }

  let source = body.source;
  if (source === null || source === undefined || source === "") {
    source = "ADMIN_CREATED";
  } else if (typeof source !== "string" || !DATA_SOURCES.has(source)) {
    fieldErrors.source =
      "来源不存在。";
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
      "维护角色不存在。";
  }

  let visibility = body.visibility;
  if (visibility === null || visibility === undefined || visibility === "") {
    visibility = "FAMILY";
  } else if (
    typeof visibility !== "string" ||
    !VISIBILITIES.has(visibility)
  ) {
    fieldErrors.visibility =
      "可见性不存在。";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  return {
    data: {
      title: (title as string).trim(),
      description,
      eventDate: eventDateParsed
        ? eventDateParsed.toISOString().slice(0, 10)
        : null,
      sortDate: sortDateParsed!.toISOString().slice(0, 10),
      dateLabel,
      isApproximate,
      source: source as string,
      maintenanceRole: maintenanceRole as string,
      visibility: visibility as string,
    },
  };
}

export async function createTimelineEvent(
  familyId: string,
  memberId: string,
  input: CreateTimelineEventInput
): Promise<CreatedTimelineEvent> {
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

  const sortDateObj = new Date(input.sortDate + "T00:00:00");
  const eventDateObj = input.eventDate
    ? new Date(input.eventDate + "T00:00:00")
    : null;

  const timelineEvent = await prisma.timelineEvent.create({
    data: {
      familyId,
      memberId,
      title: input.title,
      description: input.description ?? null,
      eventDate: eventDateObj,
      sortDate: sortDateObj,
      dateLabel: input.dateLabel ?? null,
      isApproximate: input.isApproximate ?? false,
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
    timelineEvent: {
      id: timelineEvent.id,
      familyId: timelineEvent.familyId,
      memberId: timelineEvent.memberId,
      title: timelineEvent.title,
      description: timelineEvent.description,
      eventDate: toDateString(timelineEvent.eventDate),
      sortDate: toDateString(timelineEvent.sortDate) ?? "",
      dateLabel: timelineEvent.dateLabel,
      isApproximate: timelineEvent.isApproximate,
      source: timelineEvent.source,
      maintenanceRole: timelineEvent.maintenanceRole,
      visibility: timelineEvent.visibility,
      createdAt: toIsoString(timelineEvent.createdAt),
      updatedAt: toIsoString(timelineEvent.updatedAt),
    },
  };
}

export { validateCreateTimelineEventInput };

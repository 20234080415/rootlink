"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import TimelineEventCreateDialog from "@/components/member/TimelineEventCreateDialog";
import BiographyEditDialog from "@/components/member/BiographyEditDialog";
import RelationshipInferencePanel from "@/components/member/RelationshipInferencePanel";
import type { MemberDetail } from "@/server/members/read-member";

const ROLE_LABELS: Record<string, string> = {
  SELF: "自述",
  PROXY: "代录",
  GUARDIAN: "监护人",
  FAMILY_ADMIN: "管理员",
  ARCHIVIST: "档案员",
};

function extractYear(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const match = dateStr.match(/^(\d{4})/);
  return match ? parseInt(match[1], 10) : null;
}

function formatDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

interface Props {
  initialData: MemberDetail;
  familyId: string;
  memberId: string;
}

export default function MemberDetailPageClient({
  initialData,
  familyId,
  memberId,
}: Props) {
  const [data, setData] = useState<MemberDetail>(initialData);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [bioDialogOpen, setBioDialogOpen] = useState(false);
  const [bioSubmitting, setBioSubmitting] = useState(false);
  const [bioServerError, setBioServerError] = useState<string | null>(null);
  const [bioDialogKey, setBioDialogKey] = useState(0);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/v1/families/${familyId}/members/${memberId}`
      );
      if (response.ok) {
        const json = await response.json();
        if (json?.data) {
          setData(json.data);
        }
      }
    } catch {
      // silently fail refresh
    }
  }, [familyId, memberId]);

  const handleSubmit = useCallback(
    async (input: {
      title: string;
      description: string | null;
      eventDate: string | null;
      sortDate: string;
      dateLabel: string | null;
      isApproximate: boolean;
      source: string;
      maintenanceRole: string;
      visibility: string;
    }) => {
      setServerError(null);
      setSubmitting(true);

      try {
        const response = await fetch(
          `/api/v1/families/${familyId}/members/${memberId}/timeline-events`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input),
          }
        );

        const json = await response.json();

        if (!response.ok) {
          const apiError = json?.error;
          setServerError(apiError?.message ?? "创建事件失败，请稍后重试。");
          return;
        }

        setDialogOpen(false);
        setServerError(null);
        setSuccessMessage("事件创建成功");

        setTimeout(() => setSuccessMessage(null), 3000);

        await refreshData();
      } catch {
        setServerError("网络错误，请检查连接后重试。");
      } finally {
        setSubmitting(false);
      }
    },
    [familyId, memberId, refreshData]
  );

  const handleBioSubmit = useCallback(
    async (input: {
      contentMd: string;
      source: string;
      maintenanceRole: string;
      visibility: string;
    }) => {
      setBioServerError(null);
      setBioSubmitting(true);

      try {
        const response = await fetch(
          `/api/v1/families/${familyId}/members/${memberId}/biography`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input),
          }
        );

        const json = await response.json();

        if (!response.ok) {
          const apiError = json?.error;
          setBioServerError(apiError?.message ?? "保存传记失败，请稍后重试。");
          return;
        }

        setBioDialogOpen(false);
        setBioServerError(null);
        setSuccessMessage("传记保存成功");

        setTimeout(() => setSuccessMessage(null), 3000);

        await refreshData();
      } catch {
        setBioServerError("网络错误，请检查连接后重试。");
      } finally {
        setBioSubmitting(false);
      }
    },
    [familyId, memberId, refreshData]
  );

  const handleAvatarUpload = useCallback(
    async (file: File | null) => {
      if (!file) return;

      setAvatarError(null);
      setAvatarUploading(true);

      try {
        const formData = new FormData();
        formData.append("avatar", file);

        const response = await fetch(
          `/api/v1/families/${familyId}/members/${memberId}/avatar`,
          {
            method: "POST",
            body: formData,
          }
        );

        const json = await response.json();

        if (!response.ok) {
          const apiError = json?.error;
          setAvatarError(apiError?.message ?? "头像上传失败，请稍后重试。");
          return;
        }

        setSuccessMessage("头像上传成功");
        setTimeout(() => setSuccessMessage(null), 3000);
        await refreshData();
      } catch {
        setAvatarError("网络错误，请检查连接后重试。");
      } finally {
        setAvatarUploading(false);
      }
    },
    [familyId, memberId, refreshData]
  );

  const { member, biography, timelineEvents, relationships } = data;

  const birthYear = extractYear(member.birthDate);
  const deathYear = extractYear(member.deathDate);
  const lifespanLabel =
    member.birthDate && member.deathDate
      ? `${formatDate(member.birthDate)} — ${formatDate(member.deathDate)}`
      : member.birthDate
        ? `出生 ${formatDate(member.birthDate)}`
        : member.deathDate
          ? `去世 ${formatDate(member.deathDate)}`
          : null;

  const parents = relationships.filter(
    (r) => r.relationshipType === "PARENT_OF" && r.direction === "OBJECT"
  );
  const children = relationships.filter(
    (r) => r.relationshipType === "PARENT_OF" && r.direction === "SUBJECT"
  );
  const spouses = relationships.filter(
    (r) => r.relationshipType === "SPOUSE_OF"
  );
  const siblings = relationships.filter(
    (r) => r.relationshipType === "SIBLING_OF"
  );

  const hasRelationships = relationships.length > 0;
  const hasTimeline = timelineEvents.length > 0;

  return (
    <>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
          <Link
            href={`/families/${familyId}`}
            className="transition hover:text-slate-700"
          >
            家族
          </Link>
          {" / "}
          <span className="text-slate-700">{member.fullName}</span>
        </p>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-slate-950">
          {member.fullName}
        </h1>
        <div className="flex gap-2">
          <Link
            href={`/families/${familyId}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            仪表盘
          </Link>
          <Link
            href={`/families/${familyId}/members/${memberId}/edit`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            编辑成员
          </Link>
          <Link
            href={`/families/${familyId}/graph`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <circle cx="5" cy="19" r="2.5" />
              <circle cx="15" cy="5" r="2.5" />
              <circle cx="19" cy="19" r="2.5" />
              <line x1="7.32" y1="17.68" x2="12.68" y2="6.32" />
              <line x1="16.68" y1="6.32" x2="17.32" y2="17.68" />
            </svg>
            查看图谱
          </Link>
          </div>

      {successMessage ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center gap-2">
            {member.avatarUrl ? (
              <Image
                src={member.avatarUrl}
                alt={member.fullName}
                width={72}
                height={72}
                unoptimized
                className="h-[72px] w-[72px] rounded-full border border-slate-200 object-cover"
              />
            ) : (
              <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-500">
                {getInitials(member.fullName)}
              </div>
            )}
            <label className="cursor-pointer rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50">
              {avatarUploading ? "上传中..." : "上传头像"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                disabled={avatarUploading}
                onChange={(event) => {
                  void handleAvatarUpload(event.target.files?.[0] ?? null);
                  event.target.value = "";
                }}
                className="sr-only"
              />
            </label>
            {avatarError ? (
              <p className="max-w-[120px] text-center text-xs text-red-500">
                {avatarError}
              </p>
            ) : null}
            <p className="max-w-[120px] text-center text-[10px] text-slate-400">
              支持 JPG、PNG、WebP、GIF，最大 5MB
            </p>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {birthYear ? (
                <span className="text-sm text-slate-600">
                  {birthYear}{deathYear ? ` — ${deathYear}` : " — 至今"}
                </span>
              ) : null}
              {member.gender ? (
                <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                  {member.gender}
                </span>
              ) : null}
            </div>

            {lifespanLabel ? (
              <p className="text-xs text-slate-400">{lifespanLabel}</p>
            ) : null}

            {member.bioShort ? (
              <p className="text-sm leading-relaxed text-slate-600">
                {member.bioShort}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-1.5 pt-1">
              {member.maintenanceRole ? (
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                  {ROLE_LABELS[member.maintenanceRole] ?? member.maintenanceRole}
                </span>
              ) : null}
              {member.source ? (
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-600">
                  {member.source.replace(/_/g, " ")}
                </span>
              ) : null}
              {member.claimedByUserId ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-green-600">
                  已认领
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">传记</h2>
            <button
              type="button"
              onClick={() => {
                setBioServerError(null);
                setBioDialogKey((k) => k + 1);
                setBioDialogOpen(true);
              }}
              className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-slate-800"
            >
              <svg
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              编辑传记
            </button>
          </div>
          {biography && biography.contentMd ? (
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-center gap-2 pb-3">
                {biography.source ? (
                  <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                    {biography.source.replace(/_/g, " ")}
                  </span>
                ) : null}
                {biography.maintenanceRole ? (
                  <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                    {ROLE_LABELS[biography.maintenanceRole] ?? biography.maintenanceRole}
                  </span>
                ) : null}
                {biography.visibility ? (
                  <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                    {biography.visibility.replace(/_/g, " ")}
                  </span>
                ) : null}
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {biography.contentMd}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-10">
              <svg
                className="h-8 w-8 text-slate-300"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="text-sm font-medium text-slate-400">
                暂无传记
              </p>
              <p className="text-xs text-slate-400">
                暂无传记，可以先记录一段人生经历
              </p>
            </div>
          )}
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">时间线</h2>
            <button
              type="button"
              onClick={() => {
                setServerError(null);
                setDialogOpen(true);
              }}
              className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-slate-800"
            >
              <svg
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              创建事件
            </button>
          </div>
          {hasTimeline ? (
            <div className="rounded-lg border border-slate-200 bg-white">
              <ul className="divide-y divide-slate-100">
                {timelineEvents.map((event) => (
                  <li key={event.id} className="px-4 py-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-50 text-[10px] font-bold text-slate-400">
                        {event.sortDate
                          ? event.sortDate.slice(5)
                          : "?"}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <p className="text-sm font-medium text-slate-800">
                          {event.title}
                        </p>
                        <p className="text-xs text-slate-400">
                          {event.dateLabel
                            ? event.dateLabel
                            : event.eventDate
                              ? formatDate(event.eventDate)
                              : formatDate(event.sortDate)}
                          {event.isApproximate ? " （约）" : ""}
                        </p>
                        {event.description ? (
                          <p className="pt-1 text-xs leading-relaxed text-slate-500">
                            {event.description}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-10">
              <svg
                className="h-8 w-8 text-slate-300"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path d="M8 2v4M16 2v4M3 10h18M21 14V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8" />
                <path d="M15 15v.01M15 19v.01M19 15v.01M19 19v.01M23 15v.01M23 19v.01" />
              </svg>
              <p className="text-sm font-medium text-slate-400">
                暂无时间线事件
              </p>
              <p className="text-xs text-slate-400">
                暂无时间线事件，可以先记录一个重要时刻
              </p>
            </div>
          )}
        </section>
      </div>

      <RelationshipInferencePanel
        familyId={familyId}
        memberId={memberId}
        memberName={member.fullName}
      />

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-slate-900">
          关系
        </h2>
        {hasRelationships ? (
          <div className="flex flex-col gap-3 sm:flex-row">
            {parents.length > 0 ? (
              <RelationshipGroup
                familyId={familyId}
                label="父母"
                items={parents.map((r) => r.relatedMember)}
              />
            ) : null}
            {spouses.length > 0 ? (
              <RelationshipGroup
                familyId={familyId}
                label="配偶"
                items={spouses.map((r) => r.relatedMember)}
              />
            ) : null}
            {children.length > 0 ? (
              <RelationshipGroup
                familyId={familyId}
                label="子女"
                items={children.map((r) => r.relatedMember)}
              />
            ) : null}
            {siblings.length > 0 ? (
              <RelationshipGroup
                familyId={familyId}
                label="兄弟姐妹"
                items={siblings.map((r) => r.relatedMember)}
              />
            ) : null}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-10">
            <svg
              className="h-8 w-8 text-slate-300"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <circle cx="5" cy="19" r="2.5" />
              <circle cx="15" cy="5" r="2.5" />
              <circle cx="19" cy="19" r="2.5" />
              <line x1="7.32" y1="17.68" x2="12.68" y2="6.32" />
              <line x1="16.68" y1="6.32" x2="17.32" y2="17.68" />
            </svg>
            <p className="text-sm font-medium text-slate-400">
              暂无关系
            </p>
            <p className="text-xs text-slate-400">
              该成员尚未与其他成员建立关系。
            </p>
          </div>
        )}
      </section>

      <TimelineEventCreateDialog
        open={dialogOpen}
        onClose={() => {
          setServerError(null);
          setDialogOpen(false);
        }}
        onSubmit={handleSubmit}
        submitting={submitting}
        serverError={serverError}
      />

      <BiographyEditDialog
        key={bioDialogKey}
        open={bioDialogOpen}
        currentContentMd={biography?.contentMd ?? ""}
        currentSource={biography?.source ?? "ADMIN_CREATED"}
        currentMaintenanceRole={biography?.maintenanceRole ?? "PROXY"}
        currentVisibility={biography?.visibility ?? "FAMILY"}
        onClose={() => {
          setBioServerError(null);
          setBioDialogOpen(false);
        }}
        onSubmit={handleBioSubmit}
        submitting={bioSubmitting}
        serverError={bioServerError}
      />
    </>
  );
}

function RelationshipGroup({
  familyId,
  label,
  items,
}: {
  familyId: string;
  label: string;
  items: Array<{ id: string; fullName: string }>;
}) {
  return (
    <div className="flex-1 rounded-lg border border-slate-200 bg-white p-4">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <ul className="flex flex-col gap-1.5">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={`/families/${familyId}/members/${item.id}`}
              className="text-sm font-medium text-slate-700 transition hover:text-slate-900 hover:underline"
            >
              {item.fullName}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

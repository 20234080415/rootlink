import { readMemberDetail } from "@/server/members/read-member";
import { ApiError } from "@/server/api";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

const ROLE_LABELS: Record<string, string> = {
  SELF: "Self",
  PROXY: "Proxy",
  GUARDIAN: "Guardian",
  FAMILY_ADMIN: "Admin",
  ARCHIVIST: "Archivist",
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

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ familyId: string; memberId: string }>;
}) {
  const { familyId, memberId } = await params;

  let data;
  try {
    data = await readMemberDetail(familyId, memberId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  const { member, biography, timelineEvents, relationships } = data;

  const birthYear = extractYear(member.birthDate);
  const deathYear = extractYear(member.deathDate);
  const lifespanLabel =
    member.birthDate && member.deathDate
      ? `${formatDate(member.birthDate)} — ${formatDate(member.deathDate)}`
      : member.birthDate
        ? `Born ${formatDate(member.birthDate)}`
        : member.deathDate
          ? `Died ${formatDate(member.deathDate)}`
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
    <main className="min-h-screen px-6 py-8">
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
            <Link
              href={`/families/${familyId}`}
              className="transition hover:text-slate-700"
            >
              Family
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
              Dashboard
            </Link>
            <Link
              href={`/families/${familyId}/graph`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
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
              View Graph
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-start gap-4">
            {member.avatarUrl ? (
              <Image
                src={member.avatarUrl}
                alt={member.fullName}
                width={64}
                height={64}
                className="h-16 w-16 rounded-full border border-slate-200 object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-500">
                {getInitials(member.fullName)}
              </div>
            )}

            <div className="flex flex-1 flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {birthYear ? (
                  <span className="text-sm text-slate-600">
                    {birthYear}{deathYear ? ` — ${deathYear}` : " — Present"}
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
                    Claimed
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Biography</h2>
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
                  No biography yet
                </p>
                <p className="text-xs text-slate-400">
                  This member doesn&apos;t have a biography recorded.
                </p>
              </div>
            )}
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Timeline</h2>
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
                            {event.isApproximate ? " (approx.)" : ""}
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
                  No timeline events
                </p>
                <p className="text-xs text-slate-400">
                  No life events have been recorded for this member yet.
                </p>
              </div>
            )}
          </section>
        </div>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-slate-900">
            Relationships
          </h2>
          {hasRelationships ? (
            <div className="flex flex-col gap-3 sm:flex-row">
              {parents.length > 0 ? (
                <RelationshipGroup
                  familyId={familyId}
                  label="Parents"
                  items={parents.map((r) => r.relatedMember)}
                />
              ) : null}
              {spouses.length > 0 ? (
                <RelationshipGroup
                  familyId={familyId}
                  label={spouses.length === 1 ? "Spouse" : "Spouses"}
                  items={spouses.map((r) => r.relatedMember)}
                />
              ) : null}
              {children.length > 0 ? (
                <RelationshipGroup
                  familyId={familyId}
                  label={children.length === 1 ? "Child" : "Children"}
                  items={children.map((r) => r.relatedMember)}
                />
              ) : null}
              {siblings.length > 0 ? (
                <RelationshipGroup
                  familyId={familyId}
                  label={siblings.length === 1 ? "Sibling" : "Siblings"}
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
                No relationships
              </p>
              <p className="text-xs text-slate-400">
                This member isn&apos;t connected to anyone in the family yet.
              </p>
            </div>
          )}
        </section>
      </section>
    </main>
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

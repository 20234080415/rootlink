"use client";

import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useState, useCallback } from "react";

const GENDER_OPTIONS = [
  { value: "UNKNOWN", label: "未知" },
  { value: "MALE", label: "男" },
  { value: "FEMALE", label: "女" },
  { value: "OTHER", label: "其他" },
];

const MAINTENANCE_ROLE_OPTIONS = [
  { value: "SELF", label: "本人" },
  { value: "PROXY", label: "家人代写" },
  { value: "GUARDIAN", label: "监护人维护" },
  { value: "FAMILY_ADMIN", label: "家族管理员" },
  { value: "ARCHIVIST", label: "档案整理" },
];

const SOURCE_OPTIONS = [
  { value: "SELF_REPORTED", label: "本人填写" },
  { value: "PROXY_RECORDED", label: "家人代录" },
  { value: "INTERVIEW", label: "采访记录" },
  { value: "FAMILY_MEMORY", label: "家族记忆" },
  { value: "IMPORTED", label: "导入" },
  { value: "ADMIN_CREATED", label: "管理员创建" },
];

interface FieldErrors {
  fullName?: string;
  birthDate?: string;
  deathDate?: string;
  general?: string;
}

export default function NewMemberPage() {
  const router = useRouter();
  const params = useParams<{ familyId: string }>();
  const familyId = params.familyId;

  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("UNKNOWN");
  const [birthDate, setBirthDate] = useState("");
  const [deathDate, setDeathDate] = useState("");
  const [bioShort, setBioShort] = useState("");
  const [maintenanceRole, setMaintenanceRole] = useState("PROXY");
  const [source, setSource] = useState("ADMIN_CREATED");

  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const validate = useCallback((): FieldErrors => {
    const errors: FieldErrors = {};

    if (fullName.trim().length === 0) {
      errors.fullName = "请输入姓名";
    } else if (fullName.trim().length > 120) {
      errors.fullName = "姓名不能超过 120 个字符";
    }

    if (birthDate && deathDate) {
      const b = new Date(birthDate + "T00:00:00");
      const d = new Date(deathDate + "T00:00:00");
      if (!isNaN(b.getTime()) && !isNaN(d.getTime()) && b > d) {
        errors.birthDate = "出生日期不能晚于逝世日期";
        errors.deathDate = "逝世日期不能早于出生日期";
      }
    }

    return errors;
  }, [fullName, birthDate, deathDate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/v1/families/${familyId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          gender: gender || null,
          birthDate: birthDate || null,
          deathDate: deathDate || null,
          bioShort: bioShort.trim() || null,
          maintenanceRole,
          source,
          claimedByUserId: null,
        }),
      });

      const json = await response.json();

      if (!response.ok) {
        const apiError = json?.error;
        if (apiError?.fieldErrors && Object.keys(apiError.fieldErrors).length > 0) {
          const mapped: FieldErrors = {};
          for (const [key, val] of Object.entries(apiError.fieldErrors)) {
            mapped[key as keyof FieldErrors] = val as string;
          }
          setFieldErrors(mapped);
        } else {
          setServerError(apiError?.message ?? "创建成员失败，请稍后重试。");
        }
        return;
      }

      const newMemberId = json?.data?.member?.id;
      if (newMemberId) {
        router.push(`/families/${familyId}/members/${newMemberId}`);
      } else {
        setServerError("创建成功但未获取到成员 ID。");
      }
    } catch {
      setServerError("网络错误，请检查连接后重试。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen px-6 py-8">
      <section className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
            <Link
              href={`/families/${familyId}`}
              className="transition hover:text-slate-700"
            >
              家族
            </Link>
            {" / 创建成员"}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold text-slate-950">创建成员</h1>
            <p className="text-sm text-slate-500">为家族添加新的成员档案</p>
          </div>
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
              返回仪表盘
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
              查看图谱
            </Link>
          </div>
        </div>

        {serverError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {serverError}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-4">
              <FieldGroup label="姓名" required error={fieldErrors.fullName}>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (fieldErrors.fullName) {
                      setFieldErrors((prev) => ({ ...prev, fullName: undefined }));
                    }
                  }}
                  placeholder="请输入成员姓名"
                  maxLength={120}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-200"
                />
              </FieldGroup>

              <FieldGroup label="性别">
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-200"
                >
                  {GENDER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </FieldGroup>

              <div className="grid gap-4 sm:grid-cols-2">
                <FieldGroup label="出生日期" error={fieldErrors.birthDate}>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => {
                      setBirthDate(e.target.value);
                      if (fieldErrors.birthDate || fieldErrors.deathDate) {
                        setFieldErrors((prev) => ({
                          ...prev,
                          birthDate: undefined,
                          deathDate: undefined,
                        }));
                      }
                    }}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-200"
                  />
                </FieldGroup>

                <FieldGroup label="逝世日期" error={fieldErrors.deathDate}>
                  <input
                    type="date"
                    value={deathDate}
                    onChange={(e) => {
                      setDeathDate(e.target.value);
                      if (fieldErrors.birthDate || fieldErrors.deathDate) {
                        setFieldErrors((prev) => ({
                          ...prev,
                          birthDate: undefined,
                          deathDate: undefined,
                        }));
                      }
                    }}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-200"
                  />
                </FieldGroup>
              </div>

              <FieldGroup label="简介">
                <textarea
                  value={bioShort}
                  onChange={(e) => setBioShort(e.target.value)}
                  placeholder="一句话介绍这位成员"
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-200"
                />
              </FieldGroup>

              <FieldGroup label="维护方式">
                <select
                  value={maintenanceRole}
                  onChange={(e) => setMaintenanceRole(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-200"
                >
                  {MAINTENANCE_ROLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </FieldGroup>

              <FieldGroup label="来源">
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-200"
                >
                  {SOURCE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </FieldGroup>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "保存中..." : "保存成员"}
            </button>
            <Link
              href={`/families/${familyId}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              取消
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}

function FieldGroup({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-slate-700">
        {label}
        {required ? (
          <span className="ml-0.5 text-red-500">*</span>
        ) : null}
      </span>
      {children}
      {error ? (
        <p className="text-xs text-red-500">{error}</p>
      ) : null}
    </label>
  );
}

"use client";

import { useState } from "react";

const RELATIONSHIP_TYPE_OPTIONS = [
  { value: "PARENT_OF", label: "父母关系", hint: "成员 A 是父母，成员 B 是子女" },
  { value: "SPOUSE_OF", label: "夫妻关系", hint: "系统自动规范化双方顺序，避免重复" },
  { value: "SIBLING_OF", label: "兄弟姐妹", hint: "系统自动规范化双方顺序，避免重复" },
];

const SOURCE_OPTIONS = [
  { value: "SELF_REPORTED", label: "本人填写" },
  { value: "PROXY_RECORDED", label: "家人代录" },
  { value: "INTERVIEW", label: "采访记录" },
  { value: "FAMILY_MEMORY", label: "家族记忆" },
  { value: "IMPORTED", label: "导入" },
  { value: "ADMIN_CREATED", label: "管理员创建" },
];

export interface MemberOption {
  id: string;
  fullName: string;
}

interface Props {
  open: boolean;
  members: MemberOption[];
  onClose: () => void;
  onSubmit: (input: {
    subjectMemberId: string;
    objectMemberId: string;
    relationshipType: string;
    startDate: string | null;
    endDate: string | null;
    isPrimary: boolean;
    source: string;
  }) => Promise<void>;
  submitting: boolean;
  serverError: string | null;
}

export default function RelationshipCreateDrawer({
  open,
  members,
  onClose,
  onSubmit,
  submitting,
  serverError,
}: Props) {
  const [subjectMemberId, setSubjectMemberId] = useState("");
  const [objectMemberId, setObjectMemberId] = useState("");
  const [relationshipType, setRelationshipType] = useState("PARENT_OF");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isPrimary, setIsPrimary] = useState(true);
  const [source, setSource] = useState("ADMIN_CREATED");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  if (!open) return null;

  const selectedType = RELATIONSHIP_TYPE_OPTIONS.find(
    (o) => o.value === relationshipType
  );

  function validate(): boolean {
    const errors: Record<string, string> = {};

    if (!subjectMemberId) {
      errors.subjectMemberId = "请选择成员 A";
    }

    if (!objectMemberId) {
      errors.objectMemberId = "请选择成员 B";
    }

    if (subjectMemberId && objectMemberId && subjectMemberId === objectMemberId) {
      errors.subjectMemberId = "两个成员不能相同";
      errors.objectMemberId = "两个成员不能相同";
    }

    if (startDate && endDate) {
      const s = new Date(startDate + "T00:00:00");
      const e = new Date(endDate + "T00:00:00");
      if (!isNaN(s.getTime()) && !isNaN(e.getTime()) && s > e) {
        errors.startDate = "开始日期不能晚于结束日期";
        errors.endDate = "结束日期不能早于开始日期";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      subjectMemberId,
      objectMemberId,
      relationshipType,
      startDate: startDate || null,
      endDate: endDate || null,
      isPrimary,
      source,
    });
  }

  function handleClose() {
    setFieldErrors({});
    onClose();
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div
        className="absolute inset-0 bg-black/20"
        onClick={handleClose}
      />
      <div className="relative z-50 flex h-full w-full max-w-md flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-950">创建关系</h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {serverError ? (
          <div className="mx-5 mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {serverError}
          </div>
        ) : null}

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-4"
        >
          <FieldGroup label="成员 A" error={fieldErrors.subjectMemberId}>
            <select
              value={subjectMemberId}
              onChange={(e) => {
                setSubjectMemberId(e.target.value);
                if (fieldErrors.subjectMemberId || fieldErrors.objectMemberId) {
                  setFieldErrors((prev) => ({
                    ...prev,
                    subjectMemberId: "",
                    objectMemberId: "",
                  }));
                }
              }}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-200"
            >
              <option value="">请选择成员</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.fullName}
                </option>
              ))}
            </select>
          </FieldGroup>

          <FieldGroup label="成员 B" error={fieldErrors.objectMemberId}>
            <select
              value={objectMemberId}
              onChange={(e) => {
                setObjectMemberId(e.target.value);
                if (fieldErrors.subjectMemberId || fieldErrors.objectMemberId) {
                  setFieldErrors((prev) => ({
                    ...prev,
                    subjectMemberId: "",
                    objectMemberId: "",
                  }));
                }
              }}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-200"
            >
              <option value="">请选择成员</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.fullName}
                </option>
              ))}
            </select>
          </FieldGroup>

          <FieldGroup label="关系类型" error={fieldErrors.relationshipType}>
            <select
              value={relationshipType}
              onChange={(e) => setRelationshipType(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-200"
            >
              {RELATIONSHIP_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {selectedType?.hint ? (
              <p className="text-xs text-slate-400">{selectedType.hint}</p>
            ) : null}
          </FieldGroup>

          <div className="grid grid-cols-2 gap-3">
            <FieldGroup label="开始日期" error={fieldErrors.startDate}>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (fieldErrors.startDate || fieldErrors.endDate) {
                    setFieldErrors((prev) => ({
                      ...prev,
                      startDate: "",
                      endDate: "",
                    }));
                  }
                }}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-200"
              />
            </FieldGroup>

            <FieldGroup label="结束日期" error={fieldErrors.endDate}>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  if (fieldErrors.startDate || fieldErrors.endDate) {
                    setFieldErrors((prev) => ({
                      ...prev,
                      startDate: "",
                      endDate: "",
                    }));
                  }
                }}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-200"
              />
            </FieldGroup>
          </div>

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

          <label className="flex items-center gap-2 py-1">
            <input
              type="checkbox"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
            />
            <span className="text-sm text-slate-700">设为主要关系</span>
          </label>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "保存中..." : "保存关系"}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FieldGroup({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
      {error ? (
        <p className="text-xs text-red-500">{error}</p>
      ) : null}
    </div>
  );
}

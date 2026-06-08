"use client";

import { useState } from "react";

const SOURCE_OPTIONS = [
  { value: "SELF_REPORTED", label: "本人填写" },
  { value: "PROXY_RECORDED", label: "家人代录" },
  { value: "INTERVIEW", label: "采访记录" },
  { value: "FAMILY_MEMORY", label: "家族记忆" },
  { value: "IMPORTED", label: "导入" },
  { value: "ADMIN_CREATED", label: "管理员创建" },
];

const MAINTENANCE_ROLE_OPTIONS = [
  { value: "SELF", label: "本人" },
  { value: "PROXY", label: "家人代写" },
  { value: "GUARDIAN", label: "监护人维护" },
  { value: "FAMILY_ADMIN", label: "家族管理员" },
  { value: "ARCHIVIST", label: "档案整理" },
];

const VISIBILITY_OPTIONS = [
  { value: "FAMILY", label: "家族可见" },
  { value: "ADMINS_ONLY", label: "仅管理员" },
  { value: "PRIVATE_TO_MAINTAINERS", label: "仅维护者" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: {
    title: string;
    description: string | null;
    eventDate: string | null;
    sortDate: string;
    dateLabel: string | null;
    isApproximate: boolean;
    source: string;
    maintenanceRole: string;
    visibility: string;
  }) => Promise<void>;
  submitting: boolean;
  serverError: string | null;
}

export default function TimelineEventCreateDialog({
  open,
  onClose,
  onSubmit,
  submitting,
  serverError,
}: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [sortDate, setSortDate] = useState("");
  const [dateLabel, setDateLabel] = useState("");
  const [isApproximate, setIsApproximate] = useState(false);
  const [source, setSource] = useState("ADMIN_CREATED");
  const [maintenanceRole, setMaintenanceRole] = useState("PROXY");
  const [visibility, setVisibility] = useState("FAMILY");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  if (!open) return null;

  function validate(): boolean {
    const errors: Record<string, string> = {};

    if (!title.trim()) {
      errors.title = "请输入事件标题";
    } else if (title.trim().length > 160) {
      errors.title = "标题不能超过 160 个字符";
    }

    if (!sortDate) {
      errors.sortDate = "请选择排序日期";
    } else {
      const s = new Date(sortDate + "T00:00:00");
      if (isNaN(s.getTime())) {
        errors.sortDate = "排序日期格式不正确";
      }
    }

    if (eventDate) {
      const e = new Date(eventDate + "T00:00:00");
      if (isNaN(e.getTime())) {
        errors.eventDate = "精确日期格式不正确";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      title: title.trim(),
      description: description.trim() || null,
      eventDate: eventDate || null,
      sortDate,
      dateLabel: dateLabel.trim() || null,
      isApproximate,
      source,
      maintenanceRole,
      visibility,
    });
  }

  function handleClose() {
    setFieldErrors({});
    onClose();
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/20"
        onClick={handleClose}
      />

      <div className="relative z-50 w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-950">创建事件</h2>
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
          className="flex flex-col gap-4 overflow-y-auto px-5 py-4"
        >
          <FieldGroup label="事件标题" required error={fieldErrors.title}>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (fieldErrors.title) {
                  setFieldErrors((prev) => ({ ...prev, title: "" }));
                }
              }}
              placeholder="例如：进入大学、第一次旅行"
              maxLength={160}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-200"
            />
          </FieldGroup>

          <FieldGroup label="事件描述" error={fieldErrors.description}>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="补充描述这次事件（可选）"
              rows={3}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-200"
            />
          </FieldGroup>

          <FieldGroup label="精确日期" error={fieldErrors.eventDate}>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => {
                setEventDate(e.target.value);
                if (fieldErrors.eventDate) {
                  setFieldErrors((prev) => ({ ...prev, eventDate: "" }));
                }
              }}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-200"
            />
            <p className="text-xs text-slate-400">
              如果确定知道精确日期则填写
            </p>
          </FieldGroup>

          <FieldGroup label="排序日期" required error={fieldErrors.sortDate}>
            <input
              type="date"
              value={sortDate}
              onChange={(e) => {
                setSortDate(e.target.value);
                if (fieldErrors.sortDate) {
                  setFieldErrors((prev) => ({ ...prev, sortDate: "" }));
                }
              }}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-200"
            />
            <p className="text-xs text-slate-400">
              必填，用于时间线排序，如果日期不确定可填写近似日期
            </p>
          </FieldGroup>

          <FieldGroup label="展示日期" error={fieldErrors.dateLabel}>
            <input
              type="text"
              value={dateLabel}
              onChange={(e) => {
                setDateLabel(e.target.value);
                if (fieldErrors.dateLabel) {
                  setFieldErrors((prev) => ({ ...prev, dateLabel: "" }));
                }
              }}
              placeholder="例如：1972年春"
              maxLength={80}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-200"
            />
            <p className="text-xs text-slate-400">
              可自定义展示文案，替代精确日期显示
            </p>
          </FieldGroup>

          <label className="flex items-center gap-2 py-1">
            <input
              type="checkbox"
              checked={isApproximate}
              onChange={(e) => setIsApproximate(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
            />
            <span className="text-sm text-slate-700">近似日期（日期不精确）</span>
          </label>

          <div className="grid grid-cols-2 gap-3">
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
          </div>

          <FieldGroup label="可见范围">
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-200"
            >
              {VISIBILITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </FieldGroup>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "保存中..." : "保存事件"}
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
    <div className="flex flex-col gap-1.5">
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
    </div>
  );
}

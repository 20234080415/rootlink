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
  currentContentMd: string;
  currentSource: string;
  currentMaintenanceRole: string;
  currentVisibility: string;
  onClose: () => void;
  onSubmit: (input: {
    contentMd: string;
    source: string;
    maintenanceRole: string;
    visibility: string;
  }) => Promise<void>;
  submitting: boolean;
  serverError: string | null;
}

export default function BiographyEditDialog({
  open,
  currentContentMd,
  currentSource,
  currentMaintenanceRole,
  currentVisibility,
  onClose,
  onSubmit,
  submitting,
  serverError,
}: Props) {
  const [contentMd, setContentMd] = useState(currentContentMd);
  const [source, setSource] = useState(currentSource);
  const [maintenanceRole, setMaintenanceRole] = useState(currentMaintenanceRole);
  const [visibility, setVisibility] = useState(currentVisibility);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit({
      contentMd,
      source,
      maintenanceRole,
      visibility,
    });
  }

  function handleClose() {
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
          <h2 className="text-lg font-semibold text-slate-950">编辑传记</h2>
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
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-slate-700">
              传记内容<span className="ml-0.5 text-red-500">*</span>
            </span>
            <textarea
              value={contentMd}
              onChange={(e) => setContentMd(e.target.value)}
              placeholder="在这里书写成员的人生故事，支持 Markdown 纯文本..."
              rows={14}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-200 font-mono"
            />
            <p className="text-xs text-slate-400">
              支持 Markdown 语法，例如 # 标题、**加粗**、- 列表
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">来源</span>
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
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">维护方式</span>
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
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-slate-700">可见范围</span>
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
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "保存中..." : "保存传记"}
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

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { InferredRelationships } from "@/server/relationship-inference/kinship-types";

type GraphMember = {
  id: string;
  fullName: string;
};

type PathResult = {
  path: string[];
  memberPath: GraphMember[];
  steps: string[];
  relationshipLabel: string;
};

const STEP_LABELS: Record<string, string> = {
  parent: "父母",
  child: "子女",
  spouse: "配偶",
  sibling: "兄弟姐妹",
};

export default function RelationshipInferencePanel({
  familyId,
  memberId,
  memberName,
}: {
  familyId: string;
  memberId: string;
  memberName: string;
}) {
  const [data, setData] = useState<InferredRelationships | null>(null);
  const [members, setMembers] = useState<GraphMember[]>([]);
  const [targetMemberId, setTargetMemberId] = useState("");
  const [pathResult, setPathResult] = useState<PathResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [pathLoading, setPathLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pathError, setPathError] = useState<string | null>(null);
  const [pathOpen, setPathOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const [inferredResponse, graphResponse] = await Promise.all([
          fetch(
            `/api/v1/families/${familyId}/members/${memberId}/relationships/inferred`,
            { signal: controller.signal }
          ),
          fetch(`/api/v1/families/${familyId}/graph`, {
            signal: controller.signal,
          }),
        ]);

        const inferredJson = await inferredResponse.json();
        const graphJson = await graphResponse.json();

        if (!inferredResponse.ok) {
          setError(inferredJson?.error?.message ?? "关系推导加载失败。");
          return;
        }

        if (!graphResponse.ok) {
          setError(graphJson?.error?.message ?? "成员列表加载失败。");
          return;
        }

        setData(inferredJson.data);
        setMembers(
          (graphJson.data?.nodes ?? [])
            .map((node: { data: { memberId: string; fullName: string } }) => ({
              id: node.data.memberId,
              fullName: node.data.fullName,
            }))
            .filter((member: GraphMember) => member.id !== memberId)
        );
      } catch (loadError) {
        if (loadError instanceof DOMException && loadError.name === "AbortError") {
          return;
        }
        setError("网络错误，无法加载关系推导。");
      } finally {
        setLoading(false);
      }
    }

    void load();

    return () => controller.abort();
  }, [familyId, memberId]);

  const selectedTargetName = useMemo(
    () => members.find((member) => member.id === targetMemberId)?.fullName ?? "",
    [members, targetMemberId]
  );

  const analyzePath = useCallback(async () => {
    if (!targetMemberId) {
      setPathError("请选择一个成员。");
      return;
    }

    setPathError(null);
    setPathLoading(true);
    setPathResult(null);

    try {
      const params = new URLSearchParams({
        fromMemberId: memberId,
        toMemberId: targetMemberId,
      });
      const response = await fetch(
        `/api/v1/families/${familyId}/relationships/path?${params.toString()}`
      );
      const json = await response.json();

      if (!response.ok) {
        setPathError(json?.error?.message ?? "关系路径分析失败。");
        return;
      }

      setPathResult(json.data);
    } catch {
      setPathError("网络错误，无法分析关系路径。");
    } finally {
      setPathLoading(false);
    }
  }, [familyId, memberId, targetMemberId]);

  if (loading) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">关系推导</h2>
        <p className="mt-3 text-sm text-slate-400">正在推导家族关系...</p>
      </section>
    );
  }

  if (error || !data) {
    return (
      <section className="rounded-lg border border-red-200 bg-red-50 p-5">
        <h2 className="text-lg font-semibold text-red-900">关系推导</h2>
        <p className="mt-3 text-sm text-red-700">
          {error ?? "关系推导加载失败。"}
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">关系推导</h2>
          <p className="mt-1 text-sm text-slate-500">
            基于已保存的父母、配偶和兄弟姐妹关系实时计算。
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPathOpen((open) => !open)}
          className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          关系路径分析
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <RelativeGroup title="父母" items={[...data.father, ...data.mother]} />
        <RelativeGroup title="祖父母" items={data.grandparents} />
        <RelativeGroup
          title="兄弟姐妹"
          items={[...data.brothers, ...data.sisters]}
        />
        <RelativeGroup
          title="伯伯叔叔姑姑"
          items={[...data.uncles, ...data.aunts].filter((item) =>
            ["伯伯", "叔叔", "伯叔", "姑姑"].includes(item.label)
          )}
        />
        <RelativeGroup
          title="舅舅阿姨"
          items={[...data.uncles, ...data.aunts].filter((item) =>
            ["舅舅", "阿姨"].includes(item.label)
          )}
        />
        <RelativeGroup title="堂表兄妹" items={data.cousins} />
        <RelativeGroup title="配偶" items={data.spouse} />
      </div>

      {pathOpen ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <label className="flex flex-1 flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">
                选择要分析的成员
              </span>
              <select
                value={targetMemberId}
                onChange={(event) => {
                  setTargetMemberId(event.target.value);
                  setPathResult(null);
                  setPathError(null);
                }}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-200"
              >
                <option value="">请选择成员</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.fullName}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={analyzePath}
              disabled={pathLoading}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pathLoading ? "分析中..." : "开始分析"}
            </button>
          </div>

          {pathError ? (
            <p className="mt-3 text-sm text-red-600">{pathError}</p>
          ) : null}

          {pathResult ? (
            <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-900">
                关系：{pathResult.relationshipLabel}
              </p>
              <div className="mt-3 flex flex-col gap-2 text-sm text-slate-600">
                {buildReadablePath(memberName, selectedTargetName, pathResult).map(
                  (item, index) => (
                    <div key={`${item}-${index}`} className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          index % 2 === 0
                            ? "bg-slate-900 text-white"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {item}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function RelativeGroup({
  title,
  items,
}: {
  title: string;
  items: Array<{ id: string; fullName: string; label: string }>;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </p>
      {items.length > 0 ? (
        <ul className="mt-2 flex flex-col gap-1.5">
          {items.map((item) => (
            <li
              key={`${title}-${item.id}-${item.label}`}
              className="flex items-center justify-between gap-2 rounded-md bg-white px-2.5 py-1.5 text-sm"
            >
              <span className="font-medium text-slate-700">{item.fullName}</span>
              <span className="text-xs text-slate-400">{item.label}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-slate-400">暂无推导结果</p>
      )}
    </div>
  );
}

function buildReadablePath(
  fromName: string,
  toName: string,
  pathResult: PathResult
) {
  if (pathResult.memberPath.length <= 1) {
    return [fromName];
  }

  const output: string[] = [fromName];

  pathResult.steps.forEach((step, index) => {
    const isLast = index === pathResult.steps.length - 1;
    output.push(isLast ? pathResult.relationshipLabel : STEP_LABELS[step] ?? step);
    output.push(isLast ? toName : pathResult.memberPath[index + 1]?.fullName ?? "成员");
  });

  return output;
}

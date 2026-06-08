"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  InferredRelationships,
  InferredRelative,
} from "@/server/relationship-inference/kinship-types";

type SummaryGroup = {
  title: string;
  items: InferredRelative[];
};

export default function GraphRelationshipSummary({
  familyId,
  memberId,
  tone = "light",
}: {
  familyId: string;
  memberId: string;
  tone?: "light" | "dark";
}) {
  const [data, setData] = useState<InferredRelationships | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/v1/families/${familyId}/members/${memberId}/relationships/inferred`,
          { signal: controller.signal }
        );
        const json = await response.json();

        if (!response.ok) {
          setError(json?.error?.message ?? "关系推导加载失败");
          return;
        }

        setData(json.data);
      } catch (loadError) {
        if (loadError instanceof DOMException && loadError.name === "AbortError") {
          return;
        }
        setError("关系推导加载失败");
      } finally {
        setLoading(false);
      }
    }

    void load();

    return () => controller.abort();
  }, [familyId, memberId]);

  const groups = useMemo<SummaryGroup[]>(() => {
    if (!data) return [];

    const elderRelatives = [...data.uncles, ...data.aunts];

    return [
      { title: "父母", items: [...data.father, ...data.mother] },
      { title: "祖父母", items: data.grandparents },
      { title: "兄弟姐妹", items: [...data.brothers, ...data.sisters] },
      { title: "配偶", items: data.spouse },
      {
        title: "伯叔姑舅姨",
        items: elderRelatives,
      },
      { title: "堂表兄妹", items: data.cousins },
    ].filter((group) => group.items.length > 0);
  }, [data]);

  const mutedText = tone === "dark" ? "text-slate-400" : "text-slate-500";
  const chipClass =
    tone === "dark"
      ? "bg-white/10 text-slate-100 ring-white/10"
      : "bg-slate-100 text-slate-700 ring-slate-200";
  const labelClass = tone === "dark" ? "text-cyan-100" : "text-slate-900";

  if (loading) {
    return <p className={`text-xs ${mutedText}`}>正在推导关系...</p>;
  }

  if (error) {
    return <p className="text-xs text-red-400">{error}</p>;
  }

  if (groups.length === 0) {
    return <p className={`text-xs ${mutedText}`}>暂无可推导的亲属关系</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {groups.slice(0, 6).map((group) => (
        <div key={group.title} className="flex flex-col gap-1">
          <p className={`text-[11px] font-semibold ${labelClass}`}>
            {group.title}
          </p>
          <div className="flex flex-wrap gap-1">
            {group.items.slice(0, 4).map((item) => (
              <span
                key={`${group.title}-${item.id}-${item.label}`}
                className={`rounded-full px-2 py-0.5 text-[11px] ring-1 ${chipClass}`}
                title={`${item.fullName}：${item.label}`}
              >
                {item.label} · {item.fullName}
              </span>
            ))}
            {group.items.length > 4 ? (
              <span className={`text-[11px] ${mutedText}`}>
                +{group.items.length - 4}
              </span>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

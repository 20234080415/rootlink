import Link from "next/link";

type GraphMode = "2d" | "3d";

export default function GraphModeSwitch({
  familyId,
  activeMode,
  tone = "light",
}: {
  familyId: string;
  activeMode: GraphMode;
  tone?: "light" | "dark";
}) {
  const modes = [
    {
      mode: "2d" as const,
      label: "2D 编辑",
      href: `/families/${familyId}/graph`,
    },
    {
      mode: "3d" as const,
      label: "3D 浏览",
      href: `/families/${familyId}/graph-3d`,
    },
  ];

  return (
    <div
      className={`inline-flex rounded-xl border p-1 shadow-sm ${
        tone === "dark"
          ? "border-white/15 bg-white/10"
          : "border-slate-200 bg-white"
      }`}
    >
      {modes.map((item) => {
        const active = item.mode === activeMode;

        return (
          <Link
            key={item.mode}
            href={item.href}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              active
                ? tone === "dark"
                  ? "bg-cyan-200 text-slate-950 shadow-sm"
                  : "bg-slate-900 text-white shadow-sm"
                : tone === "dark"
                  ? "text-slate-200 hover:bg-white/10 hover:text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

const stack = [
  "Next.js",
  "TypeScript",
  "Tailwind CSS",
  "Prisma",
  "PostgreSQL",
  "React Flow",
];

export default function Home() {
  return (
    <main className="min-h-screen px-6 py-10">
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
            任务-001 已初始化
          </p>
          <h1 className="text-4xl font-semibold text-slate-950">RootLink</h1>
          <p className="max-w-2xl text-base leading-7 text-slate-700">
            V1 家族数字记忆平台的项目基础。
            业务工作流、数据库架构、身份验证、上传功能以及图谱功能
            将推迟到后续任务中实现。
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {stack.map((item) => (
            <div
              className="border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800"
              key={item}
            >
              {item}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

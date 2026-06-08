# RootLink

RootLink 是一个家族数字记忆平台 V1。产品方向、数据库设计、接口契约和路线图都在 `docs/` 目录中。

## 当前状态

本仓库已经完成：

- Task-001：Next.js + TypeScript 项目初始化
- Task-001：Tailwind CSS、ESLint、Prettier 配置
- Task-001：Prisma、PostgreSQL、React Flow 基础依赖安装
- Task-001：基础源码目录结构
- Task-002：Prisma V1 数据模型
- Task-002：PostgreSQL 初始 migration
- Task-003：Demo seed 数据
- Task-004：Prisma Client 服务端封装
- Task-004：数据库健康检查接口与本地检查脚本
- Task-005：统一 API 响应、错误、请求解析基础设施
- Task-005：数据库健康检查接口改为统一响应格式
- Task-006：最小 Family 读取 API

当前还没有实现业务流程页面或接口逻辑。

## 技术栈

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma 6.19.3
- PostgreSQL
- React Flow

## 本地启动

安装依赖：

```bash
npm install
```

创建本地环境变量：

```bash
cp .env.example .env
```

启动开发服务：

```bash
npm run dev
```

打开 `http://localhost:3000`。

## 常用命令

- `npm run dev`：启动 Next.js 开发服务
- `npm run build`：执行生产构建
- `npm run start`：启动生产服务
- `npm run lint`：运行 ESLint
- `npm run format`：用 Prettier 格式化代码
- `npm run format:check`：检查代码格式
- `npm run prisma`：运行 Prisma CLI
- `npm run db:health`：检查数据库连通性
- `npm run db:seed`：运行 Prisma seed

## 数据库初始化

先确保 `.env` 中的 `DATABASE_URL` 指向本地 PostgreSQL 数据库。

校验 Prisma schema：

```bash
npm run prisma -- validate
```

应用初始 migration：

```bash
npm run prisma -- migrate dev
```

写入 demo 数据：

```bash
npm run db:seed
```

检查数据库连通性：

```bash
npm run db:health
```

也可以访问健康检查接口：

```bash
GET /api/health/db
```

读取 family dashboard summary：

```bash
GET /api/v1/families/{familyId}
```

该接口当前只返回 family 基本信息和统计计数，不包含登录鉴权、成员列表、成员 CRUD 或关系图数据。

成功响应格式：

```json
{
  "data": {},
  "meta": {}
}
```

失败响应格式：

```json
{
  "error": {
    "code": "DATABASE_UNAVAILABLE",
    "message": "Database health check failed.",
    "fieldErrors": {}
  }
}
```

Task-003 的 seed 会创建：

- 1 个 demo family：`Tang Demo Family`
- 4 个 users
- 20 个 members
- 31 条 relationships
- 20 条 biographies
- 50 条 timeline events

seed 脚本可以重复执行。它会先清理 `tang-demo-family` 这一组 demo 数据，再重新写入。

## 当前未实现

- 登录
- API 业务逻辑（健康检查和最小 Family 读取除外）
- 成员 CRUD
- 关系图业务
- AI
- 上传
- 支付

## 下一步建议

Task-007：实现只读 Member detail API，继续复用统一响应和错误工具，但仍不做登录、创建、更新或删除。

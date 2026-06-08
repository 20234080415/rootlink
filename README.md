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
- Task-007：只读 Member detail API
- Task-008：只读 family graph payload API
- Task-009：只读 Family Dashboard 页面
- Task-010：只读 Family Graph 前端页面（React Flow 渲染）
- Task-011：只读 Member Detail 前端页面
- Task-012：Member 创建 API
- Task-013：Member 创建前端表单页面

当前还没有实现登录、成员编辑前端表单、图谱编辑等页面逻辑。

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

读取 member detail：

```bash
GET /api/v1/families/{familyId}/members/{memberId}
```

该接口当前只返回单个 member 的基础资料、biography、timeline events 和关系摘要，不提供创建、更新、删除、上传或登录鉴权。

读取 family graph payload：

```bash
GET /api/v1/families/{familyId}/graph
```

该接口返回 family 基本信息、成员节点（nodes）和关系边（edges），数据格式适配 React Flow。nodes 来自 member 表，edges 来自 relationship 表。不包含图谱编辑、前端页面或登录鉴权。

打开 family dashboard 页面：

```bash
http://localhost:3000/families/{familyId}
```

该页面展示 family 名称、统计卡片（成员数、关系数、传记数、时间线事件数）和 View Graph 导航按钮。支持 loading 骨架屏和错误状态。

打开 family graph 页面：

```bash
http://localhost:3000/families/{familyId}/graph
```

该页面使用 React Flow 渲染交互式家族关系图，支持缩放、拖拽和 member 节点点击（跳转成员详情页）。边缘使用不同颜色标注 PARENT_OF / SPOUSE_OF / SIBLING_OF 关系类型。节点按出生年代自动分层布局，无出生年份的成员排在末尾。

打开 member detail 页面：

```bash
http://localhost:3000/families/{familyId}/members/{memberId}
```

该页面展示成员基本信息（姓名、头像/initials、生卒年份、bioShort、maintenance role、source）、传记（Markdown 文本或空状态）、时间线事件列表和关系摘要（父母/配偶/子女/兄弟姐妹分组，可点击跳转相关成员详情页）。

创建 member：

```bash
POST /api/v1/families/{familyId}/members
Content-Type: application/json
```

请求体示例：

```json
{
  "fullName": "Tang Example",
  "gender": "MALE",
  "birthDate": "1999-07-22",
  "deathDate": null,
  "bioShort": "Short introduction.",
  "maintenanceRole": "PROXY",
  "source": "ADMIN_CREATED",
  "claimedByUserId": null
}
```

该接口支持字段验证：fullName 必填且 ≤120 字符，gender/source/maintenanceRole 必须为合法枚举值，birthDate 不能晚于 deathDate，claimedByUserId 必须引用已存在的用户。默认 maintenanceRole=PROXY，默认 source=ADMIN_CREATED。

打开 member 创建表单页面：

```bash
http://localhost:3000/families/{familyId}/members/new
```

该页面提供完整的简体中文表单，包含姓名、性别、出生日期、逝世日期、简介、维护方式和来源字段。提交前进行客户端校验（姓名必填、日期逻辑），成功后自动跳转成员详情页，失败时显示中文错误提示。

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
- API 业务逻辑（健康检查、最小 Family 读取、只读 Member detail、只读 graph payload、Member 创建 API 除外）
- 成员编辑/删除接口
- 关系图编辑和创建
- Timeline event 创建/编辑
- AI
- 上传
- 支付

## 下一步建议

Task-014：实现 Relationship 创建 API（POST /api/v1/families/{familyId}/relationships），支持 PARENT_OF / SPOUSE_OF / SIBLING_OF 关系创建和对称关系规范化。

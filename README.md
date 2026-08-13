# NexFab AI CRM

外贸 AI CRM 前端与业务规划项目，当前重点是前端框架与销售到回款闭环预览。

## 当前版本

- 当前预览版本：v4.8
- 重点能力：完整前端框架、HTML 静态预览、角色工作台、销售到回款闭环看板、客户/询盘/报价/订单/单证/社媒/AI 详情页。

## 本地预览

```bash
pnpm install
DATABASE_URL='postgresql://crm:crm_secret@localhost:5432/crm?schema=public' pnpm run build
DATABASE_URL='postgresql://crm:crm_secret@localhost:5432/crm?schema=public' pnpm exec next start -p 3020
```

访问：

- HTML 预览：<http://localhost:3020/preview.html>
- Next 首页：<http://localhost:3020/>
- 销售闭环看板：<http://localhost:3020/sales-cash>

## 主要目录

```text
src/app/                       Next.js 页面与 API 路由
src/components/                前端通用组件
src/frontend/mockData.tsx      前端模拟数据
prisma/                        Prisma Schema、迁移与 seed
public/preview.html            静态 HTML 预览页
FRONTEND_FRAMEWORK说明.md       前端框架说明
RUNBOOK_本地启动与验证.md       本地启动与验证手册
```

## 当前前端页面

- `/` 工作台
- `/preview.html` HTML 预览
- `/sales-cash` 销售到回款闭环看板
- `/customers`、`/customers/[id]`
- `/inquiries`、`/inquiries/[id]`
- `/quotations`、`/quotations/new`、`/quotations/[id]`
- `/approvals`
- `/orders`、`/orders/[id]`
- `/payments`
- `/documents`、`/documents/[id]`
- `/social`、`/social/[id]`
- `/ai`、`/ai/[id]`
- `/analytics`
- `/settings`

## 状态说明

当前阶段先做完整前端框架，后台/数据库真实落库后续再继续接入。现有 API 与 Prisma 文件保留为后续接口化准备。

# NexFab AI 外贸CRM

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

## v4.9 前端框架更新

新增和完善客户详情、询盘详情、报价编辑、订单详情、回款核销弹窗。重点补齐外贸 CRM 的“询盘 → 报价 → 订单 → 回款”关键页面交互骨架，后台逻辑暂不启用。

本地预览重点路由：

- `/customers/C001` 客户详情
- `/inquiries/I001` 询盘详情
- `/quotations/Q001/edit` 报价编辑
- `/orders/O001` 订单详情
- `/payments` 回款中心与核销弹窗

## v5.0 前端体验补强

完成一次全面审查后的前端补强：全局搜索可跳转、风险/通知抽屉、AI 边界抽屉、跨模块下一步动作面板、报价编辑卡片化。重点提升“看得见下一步、知道风险在哪里、能从任意页面跳转处理”的工作台体验。

## v5.1 前端框架更新

新增审批详情页、报价转订单向导、通知中心和角色权限差异视图，进一步补齐外贸 CRM 从异常审批到订单生成、通知待办、权限校验的前端闭环。

重点路由：`/approvals/A001`、`/quotations/Q001/convert`、`/notifications`、`/settings`。

## 版本升级与同步规则

每一步前端优化完成后，必须同步更新 `UPGRADE_REPORT.md`，并提交推送到 GitHub 仓库。当前升级报告记录 v4.8 起的主要版本、验证结果和远程提交。

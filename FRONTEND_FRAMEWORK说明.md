# NexFab CRM 前端框架说明

更新时间：2026-08-13

## 本轮目标

按规划内容先完成一个完整前端框架，后台功能暂缓。当前版本使用前端模拟数据，重点是把产品结构、角色入口、核心模块和业务闭环先搭起来。

## 已完成页面

| 路径 | 页面 | 内容 |
|------|------|------|
| `/` | 工作台 | KPI、询盘漏斗、销售到回款待办、AI 队列、角色工作台 |
| `/customers` | 客户中心 | 客户列表、分级、风险、查重/防撞单规则 |
| `/inquiries` | 询盘中心 | 询盘收件箱、AI 回复草稿、分配动作 |
| `/quotations` | 报价中心 | 报价列表、毛利底线、状态机、发送硬规则 |
| `/approvals` | 审批中心 | 低毛利报价、异常账期、审批动作 |
| `/orders` | 订单中心 | 订单列表、履约流程、交期与风险 |
| `/payments` | 回款中心 | 收款计划、逾期、部分付款、核销入口 |
| `/documents` | 单证中心 | PI、CI、PL、模板库、人工校验 |
| `/social` | 社媒获客 | 社媒线索池、渠道漏斗、转客户动作 |
| `/ai` | AI 中心 | AI 任务队列、模型模式、安全边界 |
| `/analytics` | 经营分析 | 销售额、毛利率、回款达成、风险归因 |
| `/settings` | 系统设置 | 角色权限、审批规则、AI 安全策略 |

## 前端结构

- `src/components/layout/AppShell.tsx`：统一侧边栏、顶部栏、角色切换、全局搜索。
- `src/components/common/PageHeader.tsx`：页面标题与动作区。
- `src/components/common/KpiCard.tsx`：通用 KPI 卡片。
- `src/components/common/StatusTag.tsx`：状态标签。
- `src/frontend/mockData.tsx`：前端模拟数据与导航配置。
- `src/app/**/page.tsx`：各模块页面。
- `src/app/globals.css`：全局样式。

## 已验证

已通过生产构建：

```bash
pnpm run build
```

已启动本地服务并验证以下页面均返回 HTTP 200：

```text
/
/customers
/inquiries
/quotations
/approvals
/orders
/payments
/documents
/social
/ai
/analytics
/settings
```

## 当前边界

- 当前前端使用 `src/frontend/mockData.tsx` 的模拟数据。
- 暂不继续后台功能开发。
- 现有 API/Prisma 文件保留，但本轮不作为重点。
- 后续接后台时，应逐步把各页面 mock 数据替换成真实接口数据。

## 下一步建议

1. 先确认前端页面结构、字段、文案和模块顺序是否符合你的业务习惯。
2. 再做页面细化：客户详情页、询盘详情页、报价编辑页、订单详情页、回款核销弹窗。
3. 最后再回到后台接口和数据库落地。

## v4.6 更新：HTML 预览、历史版本选择、详情页

本次继续完成以下前端内容：

### 1. HTML 前端预览页

新增两个位置：

- 根目录：`preview.html`
- Next 静态目录：`public/preview.html`

访问方式：

- 直接打开文件：`/Users/dream/Documents/外贸crm系统开发/外贸CRM/新版本/preview.html`
- 本地服务访问：`http://localhost:3020/preview.html`

### 2. 预览页历史版本选择

`preview.html` 顶部已加入“选择历史版本”下拉框，可切换查看：

- `v4.1`：合并工作台规划
- `v4.2`：销售到回款闭环补强
- `v4.3`：业务规则与 API 骨架
- `v4.4`：本地构建与迁移准备
- `v4.5`：完整前端框架
- `v4.6`：HTML 预览与详情页增强

后续每次版本更新，应同步追加到 `preview.html` 的 `versions` 对象中。

### 3. 新增下一步页面

- `/customers/[id]`：客户详情页
- `/inquiries/[id]`：询盘详情页
- `/quotations/new`：新建报价页
- `/quotations/[id]`：报价详情/编辑页
- `/orders/[id]`：订单详情页
- `/payments`：新增回款核销弹窗

### 4. 已验证页面

本次验证以下页面均返回 HTTP 200：

```text
/preview.html
/
/customers
/customers/C001
/inquiries
/inquiries/I001
/quotations
/quotations/new
/quotations/Q001
/orders
/orders/O001
/payments
/documents
/social
/ai
/analytics
/settings
```

## v4.7 更新：取消历史版本选择，继续详情页细化

根据最新要求，原第 3 条“每个版本更新可以在预览上面选择看历史版本”已作废。

### 已调整

- 保留 HTML 预览页：`preview.html`。
- 移除预览页顶部历史版本下拉选择。
- 预览页只展示当前版本信息：`v4.7`。
- `public/preview.html` 已同步更新。

### 继续完成的下一步页面

- `/documents/[id]`：单证详情页。
- `/social/[id]`：社媒线索详情页。
- `/ai/[id]`：AI 任务详情页。
- 单证、社媒、AI 列表页已接入详情入口。

### 已验证

以下页面均返回 HTTP 200：

```text
/preview.html
/documents/D001
/social/S001
/ai/AI001
/customers/C001
/quotations/Q001
/orders/O001
```

## v4.8 更新：销售到回款闭环看板

本次继续前端下一步，新增独立的销售闭环看板。

### 新增页面

- `/sales-cash`：销售到回款闭环看板

### 页面内容

- 询盘、报价、订单、回款四列看板。
- 每列展示当前阻塞事项、负责人、风险和下一步动作。
- KPI：询盘待补字段、待审批报价、待发货订单、逾期回款。
- 闭环里程碑：询盘进入、报价核算、审批锁价、客户确认、订单履约、回款核销。
- 阻塞归因：低毛利报价、客户资料缺失、单证未校验、水单待核销。

### HTML 预览同步

- `preview.html` 当前版本更新为 `v4.8`。
- 预览页新增“销售闭环”入口。
- 历史版本选择仍保持取消状态。

### 已验证

以下页面均返回 HTTP 200：

```text
/preview.html
/sales-cash
/
/customers/C001
/documents/D001
/social/S001
/ai/AI001
```

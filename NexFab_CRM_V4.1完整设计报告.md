# 外贸 AI CRM 系统 — 完整设计报告

> **文档版本**：v2.2（整合版）
> **生成日期**：2026-08-13
> **基于**：原始项目规划 + 外部方案差距分析补缺 + NexFab CRM V4.1 角色工作台规划
> **适用场景**：独立开发者 / 单公司自用 / 混合 AI 方案 / 全流程规划

---

## 目录

1. [项目定位与约束](#一项目定位与约束)
2. [技术选型与架构原则](#二技术选型与架构原则)
3. [系统模块全景](#三系统模块全景)
4. [数据库设计](#四数据库设计)
5. [AI 集成方案](#五ai-集成方案)
6. [数据安全与合规](#六数据安全与合规)
7. [分阶段开发计划](#七分阶段开发计划)
8. [关键技术决策记录](#八关键技术决策记录)
9. [部署与运维](#九部署与运维)
10. [风险与对策](#十风险与对策)

---

## 一、项目定位与约束

### 1.1 项目定位

为单一外贸公司开发的 AI 驱动 CRM 系统，覆盖从客户开发到售后维护的完整外贸链路。

**核心目标**：用 AI 把外贸业务员从重复劳动中解放出来，让一个人干三个人的活。

### 1.2 约束条件

| 维度 | 约束 | 影响 |
|------|------|------|
| 开发者 | 1 人全栈 | 架构必须可独立维护，不搞微服务 |
| 使用规模 | 单公司自用（预留多租户） | 所有表加 `tenant_id`，当前写死为 1 |
| AI 路线 | 混合方案（核心场景用云 API，批量任务用本地模型） | 需要智能路由层 |
| 部署 | 单台 VPS / 云服务器 | Docker Compose 单机部署，不搞 K8s |
| 数据安全 | 客户 PII 加密、数据出境合规 | 从 P0 阶段就嵌入加密和脱敏机制 |

---

## 二、技术选型与架构原则

### 2.1 技术选型

| 层 | 技术选择 | 为什么选它 |
|---|---------|-----------|
| 全栈框架 | Next.js 14 (App Router) + TypeScript | 前后端一体，一个人维护一套代码；SSR + API Routes 省去独立后端 |
| UI 组件 | Ant Design 5 + Tailwind CSS | 企业级表格/表单组件开箱即用，Tailwind 做灵活布局 + 响应式适配 |
| 数据库 | PostgreSQL 16 + pgvector 扩展 | 一个库搞定关系数据 + 向量检索，不用单独装 Milvus |
| 缓存/队列 | Redis + BullMQ | BullMQ 基于 Redis，比 RabbitMQ 轻量，适合单人维护 |
| 文件存储 | MinIO（自建 S3 兼容） | 单机部署够用，API 与 AWS S3 一致，未来可无缝迁移 |
| AI 云端 | OpenAI GPT-4o / Claude 3.5 | 询盘回复、报价建议、邮件生成等核心场景 |
| AI 本地 | Qwen2.5 (7B/14B) via Ollama | 批量翻译、简单分类、文档摘要、PII 敏感场景 |
| OCR | PaddleOCR / 云端 OCR API | 单证识别、名片扫描 |
| 搜索引擎 | PostgreSQL 全文检索 + pgvector | 数据量不大时不需要 ElasticSearch |
| 部署 | Docker Compose | 单机一键部署，不用 K8s |
| 监控 | Uptime Kuma + 日志文件 | 轻量够用 |

### 2.2 架构原则

1. **模块化单体（Modular Monolith）**：代码按业务模块组织，但部署为单个应用。不搞微服务，一个人维护不了。
2. **AI 异步化 + 流式分流**：
   - 实时交互类（RAG 问答、询盘回复生成）→ SSE 流式返回，用户即时看到结果
   - 批量任务类（OCR、批量翻译、客户评分）→ BullMQ 队列异步处理，完成后通知
3. **渐进式增强**：先做好传统 CRUD，再逐步叠加 AI 能力。AI 挂了不影响基本业务流程。
4. **数据预留多租户**：所有表加 `tenant_id` 字段，现在写死为 1，未来 SaaS 化时不用改表结构。
5. **AI 结果必须可审核**：所有 AI 生成的内容（报价、邮件、单证）都要经过业务员确认才生效，AI 是助手不是决策者。
6. **AI 防幻觉硬约束**：所有 RAG 类 Prompt 必须强制来源引用，禁止编造未在资料中出现的信息。
7. **毛利硬校验**：报价毛利底线做成代码级硬规则拦截，不完全依赖 AI 判断。
8. **数据安全从第一天做起**：客户 PII 字段加密存储，数据出境前脱敏，权限隔离防撞单/飞单。

---

## 三、系统模块全景

### 3.1 核心业务模块

```
src/modules/
├── workbench/         # 角色工作台（共享底座 + 按角色配置渲染）
│   ├── 共享 WorkbenchShell 与通用卡片
│   ├── 五类角色首页配置与登录跳转
│   ├── 工作台指标聚合与待办队列
│   └── PermissionGuard / DataScopeFilter
├── auth/              # 认证授权（JWT + RBAC + 数据权限隔离）
├── customer/          # 客户管理
│   ├── 客户档案 CRUD
│   ├── 客户分级 (A/B/C/D)
│   ├── 联系人管理
│   ├── 客户标签
│   └── 客户查重（指纹表：邮箱/电话/公司名标准化）
├── inquiry/           # 询盘管理
│   ├── 询盘录入/导入
│   ├── 询盘分配
│   ├── 跟进记录
│   ├── 询盘状态机
│   ├── 公海池（自动回收 + 认领规则）
│   └── 查重防撞单
├── quotation/         # 报价管理
│   ├── 报价单 CRUD
│   ├── 多版本报价
│   ├── 利润计算
│   ├── 报价模板
│   ├── 毛利硬校验（代码级拦截）
│   └── 异常价格预警（偏离历史均值）
├── sample/            # 样品管理
│   ├── 样品申请与审批
│   ├── 寄送与物流状态
│   ├── 签收后跟进
│   └── 客户测试结果
├── order/             # 订单管理
│   ├── PI 录入
│   ├── 订单审核流
│   ├── 生产排期
│   └── 订单状态跟踪
├── production/        # 生产跟踪
│   ├── 生产进度
│   ├── 质检记录
│   └── 延期预警
├── logistics/         # 物流管理
│   ├── 订舱记录
│   ├── 报关单据
│   ├── 装柜记录
│   └── 物流跟踪
├── document/          # 单证管理
│   ├── CI/PL 生成
│   ├── 提单管理
│   ├── 原产地证
│   └── 单证模板
├── finance/           # 财务管理
│   ├── 收款计划/记录
│   ├── 汇率管理
│   ├── 利润核算
│   └── 退税管理
├── product/           # 产品管理
│   ├── 产品库 CRUD
│   ├── 产品分类
│   ├── 价格体系
│   └── 产品图片
├── knowledge/         # 智能资料库（独立核心模块）
│   ├── 资料上传 + AI 结构化提取
│   ├── RAG 问答（强制来源引用）
│   ├── 多语言资料生成 + 术语表
│   ├── 资料版本管理
│   └── 资料变更通知
├── channel/           # 渠道集成层（可插拔适配器）
│   ├── IMAP/SMTP 邮件渠道
│   ├── B2B 平台 API（阿里国际站/中国制造网）
│   ├── 社媒官方 API（LinkedIn/Meta/WhatsApp Business）
│   ├── 展会名片 OCR 导入
│   └── 统一 Webhook 入口
├── social/            # 社媒获客助手
│   ├── 社媒账号与渠道管理
│   ├── 多语言内容生成、日历与排期
│   ├── 多平台发布（官方 API）
│   ├── 私信/评论统一收件箱与回复辅助
│   ├── 社媒线索去重、转 CRM 与分配
│   └── 内容—线索—报价—订单归因（GDPR 合规）
├── migration/         # 数据迁移
│   ├── Excel 批量导入（客户/产品/历史报价）
│   ├── CSV 字段映射器
│   ├── 数据校验
│   └── 导入记录（可回滚）
└── analytics/         # 经营数据分析（第 10 核心环节 — 贯穿全局）
    ├── 销售业绩分析（趋势/区域/产品/业务员维度 + 询盘→报价→订单转化漏斗）
    ├── 客户分析（获客成本 CAC / 生命周期价值 LTV / 流失率 / 分级分布）
    ├── 利润分析（毛利率趋势 / 利润贡献排名 / 成本结构 / 汇率影响 / 退税贡献）
    ├── 供应链分析（生产周期 / 交付准时率 / 质量合格率 / 延期原因）
    ├── 财务分析（现金流 / 应收账款账龄 / 平均收款周期 / 坏账风险）
    ├── 团队绩效分析（业绩排名 / 跟进效率 / 响应时长 / 转化率）
    ├── 市场分析（区域市场表现 / 产品趋势 / 季节性 / 竞品价格对比）
    ├── 经营报告（定期自动生成周报/月报/季报，导出 PDF/Excel）
    ├── 智能预警（销售额突降 / 利润率异常 / 应收逾期 / 库存积压）
    └── NL2SQL 查询（自然语言提问 → 自动生成 SQL → 返回图表）
```

### 3.2 AI 能力模块

```
src/modules/ai/
├── llm/               # LLM 统一调用层
│   ├── cloud.ts       # OpenAI/Claude API 封装
│   ├── local.ts       # Ollama 本地模型封装
│   └── router.ts      # 智能路由：根据任务类型选择云端/本地 + 降级策略
├── rag/               # RAG 检索增强
│   ├── embedding.ts   # 向量化
│   ├── retriever.ts   # 检索器
│   ├── knowledge.ts   # 知识库管理（产品/FAQ/历史报价）
│   └── anti-hallucination.ts  # 防幻觉约束（强制来源引用）
├── inquiry-ai/        # 询盘 AI
│   ├── auto-reply.ts  # 智能回复生成
│   ├── classify.ts    # 询盘分类评级
│   └── translate.ts   # 多语言翻译（注入术语表）
├── quotation-ai/      # 报价 AI
│   ├── price-suggest.ts  # 智能定价建议
│   └── profit-analysis.ts # 利润预测
├── document-ai/       # 单证 AI
│   ├── ocr.ts         # OCR 识别
│   ├── generate.ts    # 单证自动生成
│   └── verify.ts      # 交叉校验
├── customer-ai/       # 客户 AI
│   ├── scoring.ts     # 客户评分
│   ├── churn-alert.ts # 流失预警
│   └── profile.ts     # 客户画像生成
├── email-ai/          # 邮件 AI
│   ├── generate.ts    # EDM 生成
│   ├── personalize.ts # 个性化
│   └── schedule.ts    # 发送调度
├── analytics-ai/      # 分析 AI
│   ├── nl2sql.ts      # 自然语言转 SQL
│   └── forecast.ts    # 销售预测
└── chatbot/           # 聊天机器人
    ├── router.ts      # 意图识别
    ├── handler.ts     # 对话处理
    └── escalation.ts  # 转人工
```

### 3.3 AI 任务分流策略

```
用户触发 AI 功能
        │
        ├── 实时交互类（用户在等结果）
        │   └── SSE 流式返回（不走队列）
        │       · RAG 问答
        │       · 询盘回复生成
        │       · 邮件撰写
        │       · NL2SQL 查询
        │
        └── 批量任务类（用户可离开）
            └── BullMQ 队列异步处理（完成后通知）
                · OCR 识别
                · 批量翻译
                · 客户评分
                · 单证生成
                · 客户画像生成
```

### 3.4 角色工作台总体规划

系统采用“一套 CRM 业务底座 + 五类角色工作台 + 社媒一级业务模块 + 统一权限中心”。不再要求所有人员共用完全相同的首页。

用户登录后，系统根据主角色、附加权限、数据范围与字段权限进入对应工作台。各工作台复用同一套业务数据、服务层和 UI 组件，仅首页模块、指标、操作入口与可见数据不同。

五类角色明确为：

1. 超级管理员（Super Admin）。
2. 管理层（Management）。
3. 销售主管（Sales Manager）。
4. 销售（Sales）。
5. 财务（Finance）。

核心规则：

- 超级管理员具有全部模块、全部数据、全部操作、权限配置和系统配置权限；高风险操作仍需二次确认并记录审计日志。
- 其他角色采用 RBAC，并叠加本人/团队/部门/全局/自定义数据范围、数据归属、字段权限和审批额度。
- 销售工作台明确聚焦：社媒获客、本人报价、本人样品、本人订单跟单和每日工作内容。
- 社媒不是孤立的内容工具，必须与线索、客户、商机、报价、样品和订单形成可追踪闭环。

```mermaid
flowchart TD
    A["NexFab AI 外贸 CRM"] --> B["角色工作台"]
    A --> C["外贸业务闭环"]
    A --> D["社媒业务模块"]
    A --> E["权限与系统"]

    B --> B1["超级管理员·管理层"]
    B --> B2["销售主管·销售"]
    B --> B3["财务"]

    C --> C1["线索·客户·商机"]
    C --> C2["报价·样品·订单"]
    D --> D1["账号·内容·消息·线索·归因"]
    E --> E1["角色·数据·字段·审批·审计"]
```

### 3.5 登录与工作台分配逻辑

```mermaid
flowchart TD
    L["用户登录"] --> R["识别主角色与附加权限"]
    R --> A["超级管理员工作台"]
    R --> M["管理层工作台"]
    R --> S["销售主管工作台"]
    R --> P["销售工作台"]
    R --> F["财务工作台"]

    A --> A1["全部数据·全部配置"]
    M --> M1["经营分析·风险决策"]
    S --> S1["团队分配·过程管理"]
    P --> P1["社媒·报价·样品·订单跟单"]
    F --> F1["收款·毛利·财务审核"]
```

技术实现统一使用共享的 `WorkbenchShell`、`RoleDashboardRenderer` 和模块组件，通过角色配置生成不同首页，禁止复制五套互不相干的页面代码。用户存在多个角色时，以主角色决定默认首页，附加权限决定可见模块和可执行操作；用户可切换到已授权视图，但不能绕过后端权限检查。

### 3.6 五类角色工作台结构

#### 3.6.1 超级管理员工作台

**定位**：系统最高权限、全局经营与系统治理。

1. 全局风险提醒：低毛利、大额逾期、交付异常、审批超时、接口异常。
2. 全局经营 KPI：报价金额、预计成交、订单金额、综合毛利、应收款、交付风险。
3. 全公司业务漏斗：按团队、国家、渠道、产品线、负责人切换。
4. 五类角色工作台运行概览。
5. 全局审批队列和高风险 AI 任务。
6. 社媒总览：账号状态、内容发布、社媒线索、转化与归因。
7. 权限中心：用户、角色、部门、数据范围、字段权限、审批规则。
8. 系统状态：数据库、任务队列、AI 模型、MCP/API 集成、错误日志。

超级管理员拥有全部权限，但删除、批量改价、权限修改、密钥变更等高风险操作必须二次确认并写入审计日志。

#### 3.6.2 管理层工作台

**定位**：查看经营结果、趋势、风险和资源配置，不承担日常逐条跟进。

1. 经营简报：AI 总结本日/本周最重要的经营变化。
2. 核心 KPI：新增询盘、销售预测、订单金额、综合毛利、回款率、交付准时率。
3. 全局业务漏斗与阶段转化。
4. 团队、区域、渠道、产品线表现对比。
5. 大额商机、重点客户、低毛利报价和逾期回款。
6. 社媒经营：渠道获客量、有效线索率、社媒带来的报价和订单归因。
7. 待决策事项：需要管理层审批或协调的问题。

管理层默认可查看全局经营数据，但不自动获得用户权限配置、系统密钥、接口配置和删除权限；成本、客户和财务数据的导出权限由超级管理员单独授权。

#### 3.6.3 销售主管工作台

**定位**：管理团队销售过程、分配线索、推进报价、样品和订单。

1. 团队今日重点：超时询盘、未分配线索、待审批报价、逾期跟进。
2. 团队 KPI：有效询盘、首次响应时间、报价金额、预计成交、转化率、成员负荷。
3. 团队业务漏斗和成员对比。
4. 线索分配与客户转交。
5. 报价审批与低毛利提醒。
6. 样品进度和签收后跟进。
7. 团队订单跟单、交付风险和待回款提醒。
8. 社媒线索分配、响应时效和团队社媒转化。

销售主管默认只能查看本人团队的数据；跨团队查看、导出成本、修改财务状态和系统配置需要额外授权。

#### 3.6.4 销售工作台

**定位**：销售每天真正使用的业务执行入口，首页围绕“社媒 + 本人报价 + 本人样品 + 本人订单跟单 + 每日工作内容”。

1. 今日优先事项：最多 3 项，包含判断依据、客户、金额、逾期时间和直接操作。
2. 四项 KPI：新增社媒线索、待处理报价、待跟进样品、跟单中订单。
3. 社媒获客区：新消息、新评论、待回复线索、今日内容任务、社媒线索转 CRM。
4. 本人报价：草稿、待审批、待客户确认、即将失效、低毛利提醒。
5. 本人样品：待寄出、运输中、已签收待跟进、客户测试中、结果确认。
6. 本人订单跟单：合同确认、待收款、生产中、待发货、运输中、交付异常。
7. 今日待办：只显示本人或明确分配给本人的业务任务。
8. AI 销售助手：社媒回复、邮件/WhatsApp 回复、报价解释、产品推荐和下一步跟进建议。

销售默认只能查看本人拥有或被分配的社媒线索、客户、商机、报价、样品和订单。销售可查看本人订单的收款、生产和物流状态，但不能修改财务确认、成本、毛利规则，也不能查看其他销售人员的数据或任何社媒平台密钥。

#### 3.6.5 财务工作台

**定位**：确认资金、控制毛利、完成财务审核与对账。

1. 财务风险提醒：逾期应收、异常收款、低毛利报价、汇率波动、大额退款。
2. 核心 KPI：待收款、已收款、逾期金额、回款率、待审核报价、待对账订单。
3. 收款确认和银行流水匹配。
4. 报价毛利与折扣审核。
5. 发票、付款条款和财务单证。
6. 订单财务状态和退款/冲销记录。
7. 财务审批队列与审计日志。

财务默认可查看完成工作所需的客户、订单和报价字段，但不能分配销售线索、修改销售跟进、管理社媒账号或配置系统权限。

### 3.7 工作台共享组件与数据原则

优先复用或抽象以下组件：

- `WorkbenchShell`、`RoleDashboardRenderer`、`AppSidebar`、`WorkspaceHeader`。
- `RiskAlertBar`、`AIDailyBrief`、`KpiCard`、`BusinessFunnel`、`TaskList`。
- `SocialInbox`、`SocialLeadQueue`、`SocialContentCalendar`、`SocialAttribution`。
- `QuotePanel`、`SamplePanel`、`OrderFollowUpPanel`、`FinanceApprovalPanel`。
- `AIReviewQueue`、`AIAssistantDrawer`、`DetailDrawer`。
- `PermissionGuard`、`FieldPermission`、`DataScopeFilter`、`ApprovalGuard`。
- `EmptyState`、`ErrorState`、`LoadingSkeleton`、`AuditTimeline`。

所有工作台数据必须通过统一 service/repository 层读取，禁止把权限过滤只写在前端组件中。指标统一定义口径、基准币种、汇率时间和用户时区；工作台卡片只做聚合展示，点击后进入对应业务模块处理，不在首页复制完整业务页面。

### 3.8 导航与交互规范

建议左侧导航按最终权限动态生成：

1. 角色工作台。
2. 目标线索。
3. 客户档案。
4. 商机与跟进。
5. 社媒运营。
6. 产品资料库。
7. 报价与审批。
8. 样品管理。
9. 合同与订单。
10. 收款管理。
11. 外贸单证。
12. 生产与发货。
13. 售后与复购。
14. AI 与审批中心。
15. 数据分析。
16. 权限中心。
17. 系统管理。

销售默认显示角色工作台、本人线索/客户、社媒运营、产品资料库、报价、样品、本人订单和 AI 助手；财务不默认显示社媒运营；权限中心和系统管理默认仅超级管理员可见。

视觉继续沿用现有 NexFab Business OS 的克制 B2B SaaS 风格与配色，不另建一套设计语言。页面采用左侧导航、顶部工具栏、12 列主内容和可折叠 AI 抽屉；AI 抽屉默认折叠，展开时不永久挤压主内容。无数据、加载、局部失败、无权限、授权过期和危险操作均需提供明确状态与下一步操作。

---

## 四、数据库设计

### 4.1 核心表结构

#### 4.1.1 客户模块

```sql
CREATE TABLE customers (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT DEFAULT 1,          -- 多租户预留
    company_name VARCHAR(255) NOT NULL,
    country VARCHAR(100),
    website VARCHAR(255),
    industry VARCHAR(100),
    customer_level CHAR(1),              -- A/B/C/D
    source VARCHAR(50),                  -- 展会/B2B/海关数据/社媒/介绍
    status VARCHAR(20) DEFAULT 'active', -- active/inactive/lost
    tags TEXT[],
    -- AI 画像字段
    ai_score FLOAT DEFAULT 0,            -- AI 客户评分 0-100
    ai_profile JSONB,                    -- AI 生成的客户画像
    -- 时间戳
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_contact_at TIMESTAMPTZ
);

CREATE TABLE contacts (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT REFERENCES customers(id),
    name VARCHAR(100) NOT NULL,
    email_encrypted TEXT,                -- PII 加密存储
    phone_encrypted TEXT,                -- PII 加密存储
    whatsapp_encrypted TEXT,             -- PII 加密存储
    position VARCHAR(100),
    is_decision_maker BOOLEAN DEFAULT FALSE
);

-- 客户查重指纹表（防撞单）
CREATE TABLE customer_fingerprints (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT REFERENCES customers(id),
    fingerprint_type VARCHAR(30),      -- email / phone / whatsapp / company_name_normalized
    fingerprint_value VARCHAR(255),    -- 标准化后的值（哈希）
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(fingerprint_type, fingerprint_value)
);
```

#### 4.1.2 询盘模块

```sql
CREATE TABLE inquiries (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT DEFAULT 1,
    customer_id BIGINT REFERENCES customers(id),
    inquiry_no VARCHAR(50) UNIQUE,       -- 询盘编号
    source VARCHAR(50),                  -- email/website/whatsapp/exhibition/b2b_alibaba/linkedin
    subject VARCHAR(500),
    content TEXT,                        -- 原始内容
    content_translated TEXT,             -- AI 翻译内容
    language VARCHAR(20),                -- 原始语言
    status VARCHAR(20) DEFAULT 'new',    -- new/assigned/quoted/won/lost/pooled/closed
    assigned_to BIGINT,                  -- 分配给谁
    assigned_at TIMESTAMPTZ,             -- 分配时间
    last_follow_up_at TIMESTAMPTZ,       -- 最后跟进时间
    priority VARCHAR(10) DEFAULT 'normal',-- low/normal/high/urgent
    -- 公海池字段
    is_in_pool BOOLEAN DEFAULT FALSE,    -- 是否在公海池
    pool_entered_at TIMESTAMPTZ,         -- 进入公海时间
    -- AI 字段
    ai_analysis JSONB,                   -- AI 分析结果（意图/产品/数量等）
    ai_reply_draft TEXT,                 -- AI 生成的回复草稿
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 渠道消息表（统一存储所有渠道的原始消息）
CREATE TABLE channel_messages (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT DEFAULT 1,
    channel VARCHAR(50) NOT NULL,        -- email/b2b_alibaba/linkedin/meta/whatsapp/exhibition
    channel_message_id VARCHAR(255),     -- 渠道侧消息ID（用于查重）
    direction VARCHAR(10) DEFAULT 'inbound', -- inbound/outbound
    from_contact JSONB,                  -- 发件人信息
    to_contact JSONB,                    -- 收件人信息
    subject VARCHAR(500),
    content TEXT,
    attachments JSONB,                   -- 附件数组
    raw_data JSONB,                      -- 原始数据（调试用）
    inquiry_id BIGINT,                   -- 关联的询盘ID（如果已转化）
    is_processed BOOLEAN DEFAULT FALSE,  -- 是否已处理
    processed_at TIMESTAMPTZ,
    received_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(channel, channel_message_id)  -- 防重复
);
```

#### 4.1.3 报价模块

```sql
CREATE TABLE quotations (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT DEFAULT 1,
    inquiry_id BIGINT REFERENCES inquiries(id),
    customer_id BIGINT REFERENCES customers(id),
    quote_no VARCHAR(50) UNIQUE,
    version INT DEFAULT 1,               -- 多版本报价
    trade_term VARCHAR(20),              -- FOB/CIF/EXW/DDP
    currency VARCHAR(10) DEFAULT 'USD',
    exchange_rate DECIMAL(10,4),         -- 报价时汇率
    total_amount DECIMAL(15,2),
    total_cost DECIMAL(15,2),            -- 总成本
    profit_rate DECIMAL(5,2),            -- 利润率
    status VARCHAR(20) DEFAULT 'draft',  -- draft/sent/accepted/rejected/expired
    -- AI 字段
    ai_suggestion JSONB,                 -- AI 报价建议
    -- 审核字段
    margin_check_passed BOOLEAN,         -- 毛利硬校验是否通过
    margin_check_reason VARCHAR(500),    -- 校验失败原因
    approved_by BIGINT,                  -- 审批人（低于底线时需要）
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE quotation_items (
    id BIGSERIAL PRIMARY KEY,
    quotation_id BIGINT REFERENCES quotations(id),
    product_id BIGINT REFERENCES products(id),
    product_name VARCHAR(255),
    quantity INT,
    unit VARCHAR(20),                    -- PCS/SET/CTN
    unit_price DECIMAL(15,4),
    cost DECIMAL(15,4),                  -- 单位成本
    -- AI 字段
    ai_price_ref JSONB,                  -- AI 参考的历史价格（含来源订单号）
    price_deviation_flag BOOLEAN DEFAULT FALSE -- 偏离历史均值标记
);
```

#### 4.1.4 订单模块

```sql
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT DEFAULT 1,
    quotation_id BIGINT REFERENCES quotations(id),
    customer_id BIGINT REFERENCES customers(id),
    order_no VARCHAR(50) UNIQUE,
    pi_no VARCHAR(50),                   -- 形式发票号
    status VARCHAR(20) DEFAULT 'pending',-- pending/confirmed/in_production/shipped/completed/cancelled
    total_amount DECIMAL(15,2),
    currency VARCHAR(10),
    payment_term VARCHAR(50),            -- T/T 30% deposit / L/C 60 days
    delivery_date DATE,
    -- AI 字段
    ai_risk_score FLOAT DEFAULT 0,       -- AI 风险评分
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 4.1.5 产品模块

```sql
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT DEFAULT 1,
    product_code VARCHAR(50) UNIQUE,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),                -- 英文名
    category VARCHAR(100),
    specification TEXT,                  -- 规格
    unit VARCHAR(20),
    cost_price DECIMAL(15,4),            -- 成本价
    min_price DECIMAL(15,4),             -- 最低售价（毛利底线参考）
    standard_price DECIMAL(15,4),        -- 标准售价
    -- AI 字段
    embedding VECTOR(1536),              -- 产品向量（用于 RAG 检索）
    keywords TEXT[],                     -- 关键词
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 4.1.6 智能资料库模块

```sql
-- 产品资料库（独立于 products 表，存储原始资料文件和 AI 提取的结构化数据）
CREATE TABLE knowledge_documents (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT DEFAULT 1,
    product_id BIGINT REFERENCES products(id),
    title VARCHAR(500) NOT NULL,
    doc_type VARCHAR(50),              -- pdf/image/excel/word/url
    file_url VARCHAR(500),             -- MinIO 文件地址
    file_size BIGINT,
    -- AI 提取的结构化数据
    extracted_data JSONB,              -- { model, specs, material, certifications, packaging, moq, hs_code, ... }
    extraction_status VARCHAR(20) DEFAULT 'pending', -- pending/processing/completed/failed/reviewed
    extracted_by_model VARCHAR(50),
    -- 向量化
    content_chunks JSONB,              -- 分块后的文本片段（用于 RAG 检索）
    -- 多语言
    translations JSONB,                -- { en: "...", ar: "...", es: "..." }
    -- 版本管理
    is_latest BOOLEAN DEFAULT TRUE,    -- 是否为最新版本
    parent_doc_id BIGINT,              -- 上一版本 ID
    version INT DEFAULT 1,
    -- 审核
    reviewed_by BIGINT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 术语表（保证多语言翻译一致性）
CREATE TABLE glossary (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT DEFAULT 1,
    term_cn VARCHAR(200) NOT NULL,     -- 中文术语
    term_en VARCHAR(200),              -- 英文
    term_ar VARCHAR(200),              -- 阿拉伯语
    term_es VARCHAR(200),              -- 西班牙语
    term_fr VARCHAR(200),              -- 法语
    category VARCHAR(100),             -- 分类：材质/认证/贸易术语/包装...
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 资料变更通知
CREATE TABLE knowledge_notifications (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT DEFAULT 1,
    doc_id BIGINT REFERENCES knowledge_documents(id),
    user_id BIGINT,                    -- 通知谁
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 4.1.7 社媒获客模块

```sql
-- 社媒内容
CREATE TABLE social_posts (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT DEFAULT 1,
    platform VARCHAR(30),              -- linkedin/facebook/instagram/whatsapp_business
    content_type VARCHAR(30),          -- post/story/dm_template/dev_email
    content TEXT NOT NULL,
    content_translated JSONB,          -- 多语言版本
    media_urls TEXT[],                 -- 图片/视频 URL
    product_id BIGINT REFERENCES products(id),
    status VARCHAR(20) DEFAULT 'draft', -- draft/scheduled/published/failed
    scheduled_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    platform_post_id VARCHAR(255),     -- 平台返回的帖子 ID
    -- AI 生成元数据
    ai_generated BOOLEAN DEFAULT FALSE,
    ai_model VARCHAR(50),
    ai_prompt_snapshot TEXT,           -- 生成时的 prompt 快照（可追溯）
    created_by BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 社媒互动记录
CREATE TABLE social_interactions (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT DEFAULT 1,
    post_id BIGINT REFERENCES social_posts(id),
    platform_interaction_id VARCHAR(255), -- 平台互动 ID
    interaction_type VARCHAR(30),         -- comment/dm/like/share
    from_user_name VARCHAR(200),
    from_user_profile VARCHAR(500),
    content TEXT,
    -- AI 分析
    ai_intent VARCHAR(30),               -- inquiry/complaint/info/chitchat
    ai_sentiment VARCHAR(20),            -- positive/neutral/negative
    ai_priority VARCHAR(10),             -- low/normal/high/urgent
    ai_reply_suggestion TEXT,            -- AI 建议回复
    is_handled BOOLEAN DEFAULT FALSE,
    handled_by BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 4.1.8 单证模块

```sql
CREATE TABLE documents (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT DEFAULT 1,
    order_id BIGINT REFERENCES orders(id),
    doc_type VARCHAR(20),                -- CI/PL/BL/CO/Insurance
    doc_no VARCHAR(50),
    file_url VARCHAR(500),               -- MinIO 文件地址
    status VARCHAR(20) DEFAULT 'draft',  -- draft/generated/verified/sent
    -- AI 字段
    ai_generated BOOLEAN DEFAULT FALSE,
    ai_verified BOOLEAN DEFAULT FALSE,
    data JSONB,                          -- 结构化数据
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 4.1.9 财务模块

```sql
CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT DEFAULT 1,
    order_id BIGINT REFERENCES orders(id),
    payment_type VARCHAR(20),            -- deposit/balance/freight
    planned_amount DECIMAL(15,2),
    actual_amount DECIMAL(15,2),
    currency VARCHAR(10),
    exchange_rate DECIMAL(10,4),
    planned_date DATE,
    actual_date DATE,
    status VARCHAR(20) DEFAULT 'pending',-- pending/partial/paid/overdue
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 4.1.10 AI 任务与沟通记录

```sql
-- AI 任务队列
CREATE TABLE ai_tasks (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT DEFAULT 1,
    task_type VARCHAR(50),               -- inquiry_reply/quotation_suggest/doc_ocr/...
    module VARCHAR(50),                  -- inquiry/quotation/document/...
    ref_id BIGINT,                       -- 关联的业务 ID
    status VARCHAR(20) DEFAULT 'pending',-- pending/processing/completed/failed
    input JSONB,                         -- 注意：敏感字段已脱敏
    output JSONB,                        -- 注意：敏感字段已脱敏
    model_used VARCHAR(50),              -- gpt-4o / qwen-14b / ...
    tokens_used INT,
    cost DECIMAL(10,4),                  -- API 费用
    data_sent_to_cloud JSONB,            -- 发送到云端的数据类型审计
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 沟通记录
CREATE TABLE communications (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT DEFAULT 1,
    customer_id BIGINT REFERENCES customers(id),
    channel VARCHAR(20),                 -- email/whatsapp/wechat/phone
    direction VARCHAR(10),               -- inbound/outbound
    subject VARCHAR(500),
    content TEXT,
    -- AI 字段
    ai_summary TEXT,                     -- AI 摘要
    ai_sentiment VARCHAR(20),            -- 情感分析
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 4.1.11 经营数据分析模块

```sql
-- 经营报告快照（定期自动生成的报告）
CREATE TABLE report_snapshots (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT DEFAULT 1,
    report_type VARCHAR(50),             -- daily/weekly/monthly/quarterly/custom
    report_name VARCHAR(200),
    period_start DATE,
    period_end DATE,
    summary TEXT,                        -- AI 生成的经营摘要
    metrics JSONB,                       -- 结构化指标数据
    charts JSONB,                        -- 图表配置（前端渲染用）
    generated_by VARCHAR(20) DEFAULT 'auto', -- auto/manual
    ai_model VARCHAR(50),                -- 生成摘要用的 AI 模型
    file_url VARCHAR(500),               -- 导出的 PDF/Excel 地址
    status VARCHAR(20) DEFAULT 'generated', -- generating/generated/failed
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 预警规则
CREATE TABLE analytics_alerts (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT DEFAULT 1,
    alert_name VARCHAR(200) NOT NULL,
    alert_type VARCHAR(50),              -- sales_drop/profit_abnormal/receivable_overdue/inventory_excess
    condition_config JSONB,              -- { metric, operator, threshold, window }
    notify_channels TEXT[],             -- email/in_app/webhook
    notify_user_ids BIGINT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 预警触发记录
CREATE TABLE analytics_alert_logs (
    id BIGSERIAL PRIMARY KEY,
    alert_id BIGINT REFERENCES analytics_alerts(id),
    tenant_id BIGINT DEFAULT 1,
    triggered_value JSONB,               -- 触发时的实际指标值
    threshold_value JSONB,               -- 阈值
    message TEXT,                        -- 预警消息
    ai_analysis TEXT,                    -- AI 归因分析（为什么触发）
    is_read BOOLEAN DEFAULT FALSE,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_by BIGINT,
    resolved_at TIMESTAMPTZ,
    triggered_at TIMESTAMPTZ DEFAULT NOW()
);

-- 指标缓存（预聚合，加速看板查询）
CREATE TABLE analytics_metrics_cache (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT DEFAULT 1,
    metric_key VARCHAR(100) NOT NULL,    -- 如 sales_monthly_202608
    metric_type VARCHAR(50),             -- sales/profit/customer/supply_chain/finance/team/market
    period_type VARCHAR(20),             -- day/week/month/quarter/year
    period_start DATE,
    period_end DATE,
    dimensions JSONB,                    -- { country, product_category, user_id }
    value JSONB,                         -- { total, count, avg }
    computed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, metric_key)
);
```

### 4.2 向量索引

```sql
-- 产品向量索引（用于 RAG 检索）
CREATE INDEX idx_products_embedding ON products
    USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- 知识库文档向量索引（用于 RAG 问答）
CREATE INDEX idx_knowledge_docs_embedding ON knowledge_documents
    USING ivfflat (content_embedding vector_cosine_ops) WITH (lists = 100);

-- 询盘内容向量索引（用于相似询盘检索）
CREATE INDEX idx_inquiries_embedding ON inquiries
    USING ivfflat (content_embedding vector_cosine_ops) WITH (lists = 100);
```

### 4.3 表关系总览

```
customers ──┬── contacts
            ├── customer_fingerprints (查重)
            ├── inquiries ──┬── channel_messages (渠道来源)
            │                ├── quotations ── quotation_items
            │                └── orders ──┬── productions
            │                              ├── documents
            │                              ├── payments
            │                              └── logistics
            └── communications

products ──── knowledge_documents (资料库) ── glossary (术语表)
          └── social_posts ── social_interactions

users ──── ai_tasks (AI 调用审计)
```

---

## 五、AI 集成方案

### 5.1 AI 路由策略

```
用户请求 → AI Router → 判断任务类型
                        ├─ 实时+高质量 → 云端 (GPT-4o)
                        │   · 询盘回复生成
                        │   · 报价建议
                        │   · 客户邮件撰写
                        │   · 自然语言转 SQL
                        │   · RAG 问答
                        └─ 批量+可等待 → 本地 (Qwen)
                            · 邮件批量翻译
                            · 询盘自动分类
                            · 客户情感分析
                            · 文档摘要
                            · PII 敏感数据分析（客户评分/画像）
```

**降级策略**：云端 API 失败时自动降级到本地模型，反之亦然。确保 AI 功能不因单点故障不可用。

### 5.2 RAG 知识库架构

```
知识来源：
├── 产品知识库（规格/价格/图片描述）
├── 智能资料库（knowledge_documents 表，AI 结构化提取的资料）
├── 历史报价库（成交价格/谈判记录）
├── FAQ 知识库（常见问题及回答）
├── 公司信息库（资质/工厂能力/认证）
└── 行业知识库（贸易条款/运输规则/关税）

流程：
用户提问 → Embedding 向量化 → pgvector 相似检索 top-5
       → 组装 Prompt（防幻觉约束 + 问题 + 检索结果）→ LLM 生成回答
       → 回答中标注引用来源（文件名/章节）
```

### 5.3 AI 防幻觉机制（硬约束）

所有 RAG 类 Prompt 必须包含以下防幻觉前缀：

```typescript
// src/modules/ai/rag/anti-hallucination.ts

export const ANTI_HALLUCINATION_PREFIX = `
严格约束：
1. 你只能基于下方【检索到的资料片段】回答问题
2. 回答末尾必须标注引用来源（文件名/章节/段落）
3. 如果资料片段中没有足够信息，请直接说明"资料库中暂未找到相关信息，建议联系产品部门确认"
4. 禁止编造任何未在资料中出现的参数、认证、价格或承诺
5. 禁止使用"通常""一般来说"等模糊推测性表述替代确切的资料数据
`

export function wrapWithAntiHallucination(prompt: string, retrievedChunks: string): string {
  return `${ANTI_HALLUCINATION_PREFIX}

【检索到的资料片段】
${retrievedChunks}

${prompt}`
}
```

**各场景 Prompt 修改要点：**
- 询盘回复 Prompt：产品参数部分必须引用 RAG 检索结果，不能凭空生成
- 报价建议 Prompt：历史价格参考必须标注来源订单号，不能虚构
- 单证生成 Prompt：数据必须来自订单结构化数据，不能 AI 补充缺失字段

### 5.4 毛利硬校验（代码级拦截）

```typescript
// src/modules/quotation/validation.ts

/**
 * 毛利硬校验 — 代码级拦截，不依赖 AI 判断
 * 低于底线的报价无法提交，必须走审批流程
 */
export function validateMargin(
  totalAmount: number,
  totalCost: number,
  currency: string,
  config: MarginConfig
): MarginValidationResult {
  const marginRate = (totalAmount - totalCost) / totalAmount
  const threshold = config.thresholds[currency] ?? config.defaultThreshold

  if (marginRate < threshold) {
    return {
      passed: false,
      reason: `毛利率 ${(marginRate * 100).toFixed(2)}% 低于底线 ${threshold * 100}%，需主管审批`,
      marginRate,
      threshold,
    }
  }
  return { passed: true, marginRate, threshold }
}

/**
 * 异常价格预警 — 偏离历史均值过大时提示复核
 */
export function checkPriceDeviation(
  unitPrice: number,
  historicalPrices: number[],
  config: { deviationThreshold: number } // 默认偏离 20% 预警
): { isAbnormal: boolean; historicalAvg: number; deviation: number } {
  if (historicalPrices.length === 0) {
    return { isAbnormal: false, historicalAvg: 0, deviation: 0 }
  }
  const historicalAvg = historicalPrices.reduce((a, b) => a + b, 0) / historicalPrices.length
  const deviation = Math.abs(unitPrice - historicalAvg) / historicalAvg
  return { isAbnormal: deviation > config.deviationThreshold, historicalAvg, deviation }
}
```

### 5.5 术语表注入（翻译一致性保障）

```typescript
// src/modules/knowledge/glossary.ts

export function buildGlossaryPrompt(targetLang: string, glossary: GlossaryEntry[]): string {
  const terms = glossary
    .map(g => `${g.termCn} → ${g[`term_${targetLang}`] || g.termEn}`)
    .join('\n')

  return `
以下术语表必须严格遵守，翻译时使用指定术语，不得使用其他表述：

${terms}
`
}
```

### 5.6 流式返回（SSE）

实时交互类 AI 功能不走队列，直接用 SSE 流式返回：

```typescript
// src/app/api/ai/chat/route.ts
export async function POST(req: Request) {
  const { question, context } = await req.json()

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      const response = await cloudClient.chat.completions.create({
        model: CLOUD_MODEL,
        messages: [
          { role: 'system', content: ragQAPrompt },
          { role: 'user', content: question },
        ],
        stream: true,
      })

      for await (const chunk of response) {
        const content = chunk.choices[0]?.delta?.content || ''
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
```

### 5.7 核心 AI Prompt 模板

#### 询盘自动回复

```typescript
const inquiryReplyPrompt = `
你是外贸业务员助手。请根据以下信息生成专业的英文回复邮件。

【客户询盘】
${inquiry.content_translated}

【客户信息】
- 公司: ${customer.company_name}
- 国家: ${customer.country}
- 历史采购: ${customer.orderHistory}

【相关产品信息】（RAG 检索结果 — 仅引用此处信息，不得编造）
${ragResults}

【公司能力】
${companyProfile}

要求：
1. 语气专业、礼貌，符合 ${customer.country} 的商务文化
2. 针对询盘中的每个问题给出明确回答
3. 如果有产品推荐，附上简要参数和参考报价（参数必须来自上方检索结果）
4. 结尾引导下一步行动（寄样/视频会议/详细报价）
5. 控制在 200 词以内
6. 如果检索结果中没有相关产品信息，请明确告知客户将安排产品经理跟进
`;
```

#### 智能报价建议

```typescript
const quotationPrompt = `
你是外贸报价专家。请根据以下信息给出报价建议。

【询盘需求】
- 产品: ${inquiry.productName}
- 数量: ${inquiry.quantity}
- 目的港: ${inquiry.destinationPort}
- 贸易条款: ${inquiry.tradeTerm}

【历史成交参考】（RAG 检索 — 标注来源订单号）
${historicalQuotes}

【当前成本】
- 产品成本: ${product.costPrice} ${currency}
- 运费估算: ${freightEstimate}
- 当前汇率: ${exchangeRate}

【客户画像】
- 客户等级: ${customer.level}
- 价格敏感度: ${customer.priceSensitivity}
- 历史利润率: ${customer.avgProfitRate}

请输出：
1. 建议报价区间（最低价/推荐价/报价策略价）
2. 利润率分析
3. 谈判建议（让步空间、交换条件）

注意：历史价格参考必须标注来源订单号，不得虚构价格数据。
`;
```

### 5.8 AI 任务执行流程

```
1. 用户触发 AI 功能（如"生成回复"）
2. 判断任务类型：
   a. 实时交互类 → 走 SSE 流式返回
   b. 批量任务类 → 创建 ai_tasks 记录（status=pending）
3. [批量任务] 发送 BullMQ 任务到队列
4. [批量任务] Worker 消费任务：
   a. AI Router 判断用云端还是本地
   b. RAG 检索相关知识
   c. 组装 Prompt（含防幻觉约束）
   d. 调用 LLM
   e. 解析结果
   f. 更新 ai_tasks（status=completed, output=结果）
5. [批量任务] 前端通过 WebSocket / 轮询获取结果
6. 用户审核确认后写入业务表
```

### 5.9 经营数据分析 AI

#### NL2SQL 自然语言查询

用户用自然语言提问，AI 自动生成 SQL 查询并返回图表 + 解读：

```typescript
const nl2sqlPrompt = `
你是数据分析助手。请将用户的自然语言问题转换为 PostgreSQL SQL 查询。

可用表：customers, inquiries, quotations, orders, payments, products, productions, communications

【用户问题】
${userQuestion}

要求：
1. 只输出 SQL，不要解释
2. 所有查询自动加 tenant_id = 1 过滤
3. 日期用 NOW() 相对计算（如"上季度" = NOW() - INTERVAL '3 months'）
4. 金额单位保留原始币种
5. 如果问题无法用 SQL 回答，返回 "UNSUPPORTED"
`;
```

查询流程：用户提问 → NL2SQL 生成 SQL → 安全审查（只允许 SELECT）→ 执行查询 → AI 生成分析解读 → 返回数据 + 图表配置 + 文字解读。

#### 自动报告生成

定期（周/月/季）自动生成经营报告：

1. 聚合各维度指标数据（从 `analytics_metrics_cache` 读取）
2. AI 生成经营摘要（趋势分析 + 异常标注 + 建议行动）
3. 生成图表配置（前端可渲染的 ECharts/Recharts 配置）
4. 导出 PDF/Excel 存储到 MinIO
5. 推送通知给管理层

```typescript
const reportPrompt = `
你是外贸经营分析师。请根据以下指标数据生成本${period}经营报告摘要。

【指标数据】
- 销售额: ${metrics.sales.total} (环比 ${metrics.sales.mom}%)
- 新增客户: ${metrics.customer.newCount}
- 询盘转化率: ${metrics.inquiry.conversionRate}%
- 平均毛利率: ${metrics.profit.avgMargin}%
- 应收账款逾期: ${metrics.finance.overdueAmount}
- 交付准时率: ${metrics.supplyChain.onTimeRate}%

请输出：
1. 经营概述（2-3 句话总结本期经营状况）
2. 亮点（表现好的方面）
3. 风险点（需要关注的问题）
4. 建议行动（2-3 条具体建议）
`;
```

#### 智能预警 + 归因分析

预警触发后，AI 自动进行归因分析：

```typescript
const alertAnalysisPrompt = `
预警触发：${alert.alertName}
触发条件：${alert.conditionConfig}
实际值：${log.triggeredValue}
阈值：${log.thresholdValue}

请分析可能的原因并给出建议：
1. 列出 2-3 个可能的原因
2. 推荐下一步排查方向
3. 给出应对建议
`;
```

**预警类型：**
- 销售额突降（环比下降超过阈值）
- 利润率异常（低于历史均值）
- 应收账款逾期（超期未收款）
- 客户流失风险（关键客户沉默超阈值）
- 生产延期风险（排期冲突）

#### 销售预测

基于历史数据预测未来趋势：
- 时间序列预测（按月/季度的销售额预测）
- 季节性分析（识别旺季/淡季模式）
- 客户复购预测（哪些客户可能下复购单）
- 产品趋势预测（哪些产品需求上升/下降）

---

## 六、数据安全与合规

### 6.1 数据加密

客户 PII 数据（邮箱、电话、WhatsApp 号）使用 AES-256-GCM 加密存储：

```typescript
// src/lib/crypto/index.ts
import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const KEY = process.env.ENCRYPTION_KEY // 32 字节密钥

/** 加密敏感字段 */
export function encrypt(plaintext: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return Buffer.concat([iv, authTag, encrypted]).toString('base64')
}

/** 解密 */
export function decrypt(ciphertext: string): string {
  const data = Buffer.from(ciphertext, 'base64')
  const iv = data.subarray(0, 16)
  const authTag = data.subarray(16, 32)
  const encrypted = data.subarray(32)
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv)
  decipher.setAuthTag(authTag)
  return decipher.update(encrypted) + decipher.final('utf8')
}
```

### 6.2 数据出境合规策略

使用境外大模型 API 时的合规处理：

```
1. 敏感数据脱敏后再发送给 LLM：
   - 客户公司名 → 替换为 [COMPANY_A]
   - 客户邮箱/电话 → 完全移除
   - 客户地址 → 仅保留国家
   - 价格数据 → 保留（非 PII）

2. 本地模型处理敏感场景：
   - 客户 PII 数据的分析（评分、画像）优先用本地 Qwen
   - 仅非敏感内容（产品参数、询盘正文）才发云端 API

3. 日志脱敏：
   - AI 调用日志中不记录客户 PII
   - ai_tasks.input/output 中的敏感字段打码

4. 合规声明与审计：
   - 系统设置页面显示数据流向说明
   - 记录每次云端 API 调用的数据类型（data_sent_to_cloud 字段）
   - 支持按时间范围导出审计报告
```

### 6.3 权限隔离（防撞单/飞单）

权限判断不能只依赖角色名称，统一采用：

`最终权限 = 角色权限 × 模块动作权限 × 数据范围 × 数据归属 × 字段权限 × 审批规则`

- 模块动作：`view`、`create`、`edit`、`delete`、`assign`、`transfer`、`approve`、`import`、`export`、`configure`。
- 数据范围：`own`（本人）、`team`（团队）、`department`（部门）、`all`（全局）、`custom`（地区/渠道/产品线/账号等自定义范围）。
- 字段权限：`hidden`、`masked`、`read_only`、`editable`。
- 审批规则：按毛利率、折扣、订单金额、贸易条款、账期、赊销、退款、定制要求和 MOQ 等条件触发。

```typescript
// src/modules/auth/permission.ts

export const ROLE_DEFAULT_POLICIES = {
  super_admin: {
    dataScope: 'all',
    modules: '*',
    actions: '*',
    fieldAccess: 'editable',
  },
  management: {
    dataScope: 'all',
    modules: ['workbench', 'customer', 'opportunity', 'quotation', 'sample', 'order', 'finance', 'social', 'analytics'],
    deniedActions: ['configure_system', 'manage_secret', 'manage_permission', 'delete'],
  },
  sales_manager: {
    dataScope: 'team',
    modules: ['workbench', 'customer', 'inquiry', 'opportunity', 'quotation', 'sample', 'order', 'social'],
    actions: ['view', 'create', 'edit', 'assign', 'transfer', 'approve', 'export'],
  },
  sales: {
    dataScope: 'own',
    modules: ['workbench', 'customer', 'inquiry', 'opportunity', 'quotation', 'sample', 'order', 'social', 'knowledge'],
    actions: ['view', 'create', 'edit'],
    hiddenFields: ['cost_price', 'min_price', 'profit_rate', 'bank_account', 'social_credential'],
    customer: { filter: 'assigned_to = :userId OR created_by = :userId' },
    inquiry: { filter: 'assigned_to = :userId' },
    quotation: { filter: 'created_by = :userId' },
    order: { filter: 'created_by = :userId' },
  },
  finance: {
    dataScope: 'all',
    modules: ['workbench', 'quotation', 'order', 'payment', 'document', 'finance'],
    actions: ['view', 'edit', 'approve', 'import', 'export'],
    maskedFields: ['email', 'phone', 'whatsapp'],
  },
} as const
```

前端菜单、路由、按钮、字段和导出入口均执行权限控制；后端 API 必须再次校验角色、动作、数据范围与字段权限，禁止只隐藏按钮但仍允许直接调用接口。越权请求返回 `403` 并写入安全审计。所有审批、转交、导出、财务确认、社媒发布、批量改价和权限修改均记录审计日志。

### 6.4 公海池与查重

```typescript
// src/modules/inquiry/pool.ts

export const POOL_RULES = {
  autoRecycleDays: 7,        // 7 天未跟进 → 回收到公海池
  autoCloseDays: 30,         // 30 天未认领 → 自动关闭
  maxActivePerUser: 20,      // 每人最多同时持有 20 个活跃询盘
}

/**
 * 查重 — 新询盘录入时检查是否已存在
 */
export async function checkDuplicate(
  customerEmail?: string,
  customerPhone?: string,
  customerCompany?: string
): Promise<{ isDuplicate: boolean; existingInquiryId?: number; existingCustomerId?: number }> {
  // 1. 邮箱查重（查 customer_fingerprints 表）
  // 2. 电话查重
  // 3. 公司名标准化后查重（去除空格、大小写、后缀 Inc/Ltd/Co 等）
}
```

---

## 七、分阶段开发计划

### P0：基础平台搭建（第 1-3 周）

**目标：跑通项目骨架，用户能登录，能看到空的管理界面**

- [ ] 初始化 Next.js 项目 + TypeScript + Tailwind + Ant Design
- [ ] 配置 Prisma + PostgreSQL，创建核心表结构
- [ ] 实现认证模块（JWT 登录/注册 + RBAC 权限 + 数据权限隔离）
- [ ] **建立五角色权限底座：模块动作 + 数据范围 + 数据归属 + 字段权限 + 审批规则 + 审计日志**
- [ ] **建立共享 WorkbenchShell、角色配置、登录跳转与动态导航**
- [ ] **实现数据加密层（PII 字段 AES-256-GCM 加密）**
- [ ] 搭建基础布局（侧边栏导航 + 顶部栏 + 面包屑 + 响应式适配）
- [ ] 配置 Docker Compose（PostgreSQL + Redis + MinIO + Ollama）
- [ ] 实现 API 基础设施（错误处理、日志、参数校验、租户隔离中间件）

### P1：核心业务 CRUD（第 4-8 周）

**目标：外贸全流程跑通，能用系统管理客户和订单（无 AI）**

- [ ] 产品管理：CRUD + 图片上传 + 分类
- [ ] **智能资料库模块：资料上传 + AI 结构化提取（基础版）+ 术语表维护**
- [ ] 客户管理：CRUD + 联系人 + 分级 + 标签 + **查重防撞单**
- [ ] 询盘管理：录入 + 分配 + 状态流转 + 跟进记录 + **公海池**
- [ ] 样品管理：申请/审批 + 寄送 + 签收后跟进 + 客户测试结果
- [ ] **渠道集成层：IMAP 邮件渠道适配器（首个渠道）**
- [ ] 报价管理：报价单 CRUD + 多版本 + 利润计算 + **毛利硬校验** + PDF 导出
- [ ] 订单管理：PI 录入 + 审核流 + 状态跟踪
- [ ] 生产跟踪：进度录入 + 质检记录
- [ ] 物流管理：订舱 + 报关 + 装柜记录
- [ ] 单证管理：CI/PL 模板生成 + 文件管理
- [ ] 财务管理：收款计划 + 收款记录 + 利润核算
- [ ] **完成五类角色工作台：优先销售，再完成销售主管、管理层、财务和超级管理员**
- [ ] 经营数据分析基础：销售业绩看板 + 客户统计 + 利润概览 + 指标预聚合缓存（analytics_metrics_cache）
- [ ] **数据迁移工具：Excel/CSV 导入（客户/产品/历史报价）**

### P2：AI 能力接入（第 9-14 周）

**目标：核心场景有 AI 辅助，业务员效率显著提升**

- [ ] AI 基础设施：LLM 调用封装 + BullMQ 队列 + 任务管理 + **降级策略**
- [ ] RAG 知识库：产品/历史报价/资料库向量化 + 检索 + **防幻觉约束**
- [ ] **流式返回：SSE 接口封装（RAG 问答、询盘回复生成）**
- [ ] 询盘 AI：自动翻译（**注入术语表**）+ 智能分类 + 回复草稿生成
- [ ] 报价 AI：历史价格检索 + 定价建议 + 利润分析 + **异常价格预警**
- [ ] 单证 AI：OCR 识别 + 单证自动生成 + 交叉校验
- [ ] 客户 AI：行为分析 + 自动评分 + 画像生成（**优先用本地模型处理 PII**）
- [ ] 前端 AI 组件：AI 助手面板 + 审核确认交互 + **流式打字效果**
- [ ] 角色工作台 AI：经营简报、今日优先事项、销售回复草稿和下一步跟进建议
- [ ] **资料版本管理：版本追踪 + 变更通知**

### P3：高级智能 + 优化（第 15-20 周）

**目标：系统成熟，AI 深度融入业务**

- [ ] 邮件 AI：EDM 生成 + 个性化 + 批量发送 + 效果追踪
- [ ] **社媒获客助手：多平台内容生成 + 内容日历 + DM 意图分析 + GDPR 合规**
- [ ] **渠道集成层扩展：B2B 平台 API + 社媒官方 API + 展会 OCR**
- [ ] 客户流失预警：沉默检测 + 自动提醒
- [ ] 经营数据分析 AI：NL2SQL 自然语言查询 + 自动报告生成（周报/月报/季报）+ 智能预警 + 归因分析
- [ ] 汇率/利润监控：实时汇率 + 预警
- [ ] 多语言聊天机器人：网站接入 + 转人工
- [ ] 销售预测：基于历史数据的趋势预测
- [ ] **移动端适配优化：响应式 Web + PWA 支持**
- [ ] 性能优化：数据库索引优化 + 缓存策略 + 前端懒加载
- [ ] 部署优化：CI/CD + 备份策略 + 监控告警

### 开发阶段与补缺项对照

| 补缺项 | 优先级 | 落地阶段 | 说明 |
|--------|--------|---------|------|
| 数据安全与合规 | P0 | P0 基础平台 | 从第一天就嵌入加密和权限 |
| 角色工作台与统一权限 | P0→P1 | P0 权限/壳层，P1 五角色页面 | 一套底座按角色配置渲染，禁止复制五套代码 |
| 毛利硬校验 | P0 | P1 报价模块 | 报价功能开发时就做 |
| AI 防幻觉机制 | P0 | P2 AI 接入 | RAG 开发时必须做 |
| 公海池与查重 | P1 | P1 询盘模块 | CRM 基本功 |
| 智能资料库 | P1 | P1 产品模块 | 报价和社媒的数据基础 |
| 渠道集成层 | P1 | P1 询盘模块（邮件）→ P3（全渠道） | 渐进式接入 |
| 数据迁移 | P1 | P1 结束 / 上线前 | 历史数据导入 |
| 流式返回体验 | P2 | P2 AI 接入 | AI 问答体验关键 |
| 术语表 | P2 | P2 AI 接入 | 多语言质量保障 |
| 资料版本管理 | P2 | P2 AI 接入 | 资料更新追踪 |
| 社媒获客助手 | P2 | P3 高级智能 | 获客渠道扩展 |
| 移动端适配 | P3 | P3 优化阶段 | 出差/参展场景 |
| 经营数据分析 | P1→P3 | P1 基础看板，P3 AI 分析 | 贯穿全局的决策中枢 |

---

## 八、关键技术决策记录

### 8.1 为什么用 pgvector 而不是 Milvus
- 单公司数据量（产品几千、询盘几万）pgvector 完全够用
- 少维护一个中间件，部署和备份都简单
- 未来数据量上来再迁移 Milvus，迁移成本可控

### 8.2 为什么用 BullMQ 而不是 RabbitMQ
- BullMQ 基于 Redis，少维护一个组件
- TypeScript 原生支持，类型安全
- 单开发者场景下，任务量不大，Redis 队列完全够用

### 8.3 为什么用 Next.js 而不是前后端分离
- 一个人维护一套代码比两套高效
- API Routes 可以直接写后端逻辑
- SSR 对 SEO 和首屏加载有好处
- 如果未来需要拆分，Next.js 的 API Routes 可以平滑迁移到独立后端

### 8.4 为什么混合 AI 方案
- 云端 API（GPT-4o）：效果好、开发快，但按 token 付费成本高
- 本地模型（Qwen）：一次性部署成本，适合批量处理
- 路由策略：实时交互用云端，批量任务用本地，平衡效果和成本
- **额外考虑**：PII 敏感数据分析优先用本地模型，降低数据出境风险

### 8.5 为什么 AI 任务要分流（流式 vs 队列）
- 实时交互类（RAG 问答、询盘回复）用户在等结果，SSE 流式返回体验最好
- 批量任务类（OCR、批量翻译）用户可以离开，走队列异步处理更合理
- 分流避免队列阻塞实时任务，也避免实时任务占用队列资源

### 8.6 为什么毛利校验做成硬规则而非 AI 判断
- AI 判断不可靠，可能被 Prompt 绕过
- 毛利底线是业务红线，必须代码级拦截
- AI 负责给建议，硬规则负责兜底

### 8.7 多租户预留策略
- 所有表加 tenant_id 字段
- 查询时自动注入 tenant_id 过滤（中间件统一处理）
- 当前写死 tenant_id=1，未来 SaaS 化只需加租户管理模块

### 8.8 为什么社媒集成只用官方 API
- "群控""爆粉"等自动化方式违反平台条款，可能导致封号
- 官方 API 稳定、合规、可持续
- 线索资料整理需符合 GDPR，不涉及未授权的个人数据抓取

---

## 九、部署与运维

### 9.1 环境变量配置

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/crm

# Redis
REDIS_URL=redis://localhost:6379

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=crm-files

# AI - Cloud
OPENAI_API_KEY=sk-xxx
OPENAI_MODEL=gpt-4o

# AI - Local (Ollama)
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=qwen2.5:14b

# Security
ENCRYPTION_KEY=your-32-byte-encryption-key
JWT_SECRET=your-jwt-secret

# App
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 9.2 Docker Compose 部署

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file: .env
    depends_on: [postgres, redis, minio, ollama]
    restart: always

  worker:
    build: .
    command: node workers/index.js
    env_file: .env
    depends_on: [redis]
    restart: always

  postgres:
    image: pgvector/pgvector:pg16
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: crm
      POSTGRES_USER: crm
      POSTGRES_PASSWORD: crm_secret
    volumes:
      - pg_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  minio:
    image: minio/minio
    ports:
      - "9000:9000"
      - "9001:9001"
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio_data:/data

  ollama:
    image: ollama/ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]

volumes:
  pg_data:
  redis_data:
  minio_data:
  ollama_data:
```

### 9.3 启动步骤

1. 复制 `.env.example` 为 `.env`，填入 OpenAI API Key、加密密钥等配置
2. `docker compose up -d` 启动数据库、Redis、MinIO、Ollama
3. `npm install` 安装依赖
4. `npx prisma db push` 创建数据库表
5. `npm run dev` 启动开发服务器
6. `node workers/index.js` 启动 Worker 进程（AI 任务处理）

---

## 十、风险与对策

| 风险 | 影响 | 对策 |
|------|------|------|
| 独立开发周期长 | 20 周才能完整交付 | P0+P1 先交付可用版本，P2/P3 逐步迭代 |
| AI API 费用不可控 | 月度成本超预期 | 批量任务用本地模型 + token 用量监控 + 超限告警 |
| 本地模型效果不够好 | 翻译/分类质量差 | 关键场景始终用云端 API，本地只做非核心任务 |
| 单点部署无高可用 | 服务器挂了系统不可用 | 定期 pg_dump 备份 + MinIO 数据备份到云存储 |
| 外贸业务变化快 | 需求频繁变更 | 模块化设计 + 低耦合，单个模块改动不影响其他 |
| AI 幻觉导致错误信息 | AI 编造产品参数/认证，伤害业务 | 所有 RAG Prompt 强制来源引用 + 禁止编造约束 |
| 报价低于毛利底线 | 亏本接单 | 代码级硬校验拦截 + 主管审批流程 |
| 客户数据泄露 | 致命风险 | PII 加密存储 + 数据出境脱敏 + 权限隔离 |
| 业务员撞单/飞单 | 内部管理混乱 | 公海池机制 + 查重指纹表 + 权限隔离 |
| 社媒平台封号 | 获客渠道中断 | 只用官方 API + 不做自动化群发 + GDPR 合规 |

---

## 附录：项目目录结构

```
外贸CRM系统开发/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (auth)/                 # 认证相关页面
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/            # 主业务界面
│   │   │   ├── workbench/          # 角色工作台（按主角色进入不同首页）
│   │   │   ├── customers/          # 客户管理
│   │   │   ├── inquiries/          # 询盘管理
│   │   │   ├── quotations/         # 报价管理
│   │   │   ├── samples/            # 样品管理
│   │   │   ├── orders/             # 订单管理
│   │   │   ├── production/         # 生产跟踪
│   │   │   ├── logistics/          # 物流管理
│   │   │   ├── documents/          # 单证管理
│   │   │   ├── finance/            # 财务管理
│   │   │   ├── products/           # 产品管理
│   │   │   ├── knowledge/          # 智能资料库
│   │   │   ├── social/             # 社媒获客
│   │   │   ├── analytics/          # 数据分析
│   │   │   └── settings/           # 系统设置
│   │   ├── api/                    # API Routes
│   │   │   ├── customers/
│   │   │   ├── inquiries/
│   │   │   ├── quotations/
│   │   │   ├── orders/
│   │   │   ├── ai/                 # AI 相关接口（含 SSE 流式）
│   │   │   └── webhooks/           # 外部 webhook（渠道集成）
│   │   └── layout.tsx
│   ├── modules/                    # 业务模块（逻辑层）
│   │   ├── workbench/              # 共享工作台壳层、角色配置与聚合服务
│   │   ├── auth/
│   │   ├── customer/
│   │   ├── inquiry/
│   │   ├── quotation/
│   │   ├── sample/
│   │   ├── order/
│   │   ├── production/
│   │   ├── logistics/
│   │   ├── document/
│   │   ├── finance/
│   │   ├── product/
│   │   ├── knowledge/              # 智能资料库
│   │   ├── channel/                # 渠道集成层
│   │   ├── social/                 # 社媒获客
│   │   ├── migration/              # 数据迁移
│   │   └── ai/                     # AI 能力模块
│   ├── lib/                        # 基础设施
│   │   ├── db/                     # Prisma 客户端
│   │   ├── redis/                  # Redis 客户端
│   │   ├── queue/                  # BullMQ 队列定义
│   │   ├── minio/                  # 文件存储
│   │   ├── crypto/                 # 加密/解密
│   │   └── utils/                  # 工具函数
│   ├── components/                 # 通用组件
│   │   ├── workbench/              # KPI、风险、待办、漏斗和角色面板
│   │   ├── permission/             # 权限、字段、数据范围和审批守卫
│   │   ├── ui/                     # 基础 UI 组件
│   │   ├── table/                  # 表格组件
│   │   ├── form/                   # 表单组件
│   │   └── ai/                     # AI 相关组件（助手面板、流式输出等）
│   └── types/                      # TypeScript 类型定义
├── prisma/
│   ├── schema.prisma               # Prisma Schema
│   ├── migrations/                 # 数据库迁移
│   └── seed.ts                     # 种子数据
├── workers/                        # BullMQ Worker（独立进程）
│   ├── ai-worker.ts                # AI 任务处理
│   ├── email-worker.ts             # 邮件发送
│   └── sync-worker.ts              # 数据同步
├── public/                         # 静态资源
├── docker-compose.yml              # 容器编排
├── Dockerfile                      # 应用镜像
├── .env.example                    # 环境变量模板
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

---

---

## 十一、V4.2 全面审查结论与补强方案（2026-08-13）

### 11.1 本轮审查范围

本轮审查覆盖四类材料：

1. `NexFab_CRM_V4.1_合并工作台最新版本.md`：产品定位、业务流程、数据库、AI、安全、阶段计划。
2. `schema.prisma`：核心数据模型是否能支撑真实外贸业务闭环。
3. `router.ts`：AI 调用层是否具备任务分流、敏感数据边界、降级策略和人工确认机制。
4. `page.tsx`：首页工作台是否把业务最关键的待办暴露给用户，而不是只展示统计数字。

### 11.2 已发现的主要不足

| 分类 | 不足 | 影响 | 本轮处理 |
|------|------|------|---------|
| 销售到回款闭环 | 报价、订单、回款虽然有表，但状态不够细，不能严格表达“成本核算、低毛利审批、发送、客户确认、转订单、收款核销” | 容易变成普通 CRM 记录系统，无法承载外贸成交主链路 | 已补强报价状态、订单明细、定金/尾款、审批与回款核销字段 |
| 报价风控 | 报价表只有 `draft/sent/accepted` 等粗状态，缺少成本校验、毛利底线、人工锁价 | AI 或业务员可能绕过底价逻辑直接发正式报价 | 已增加 `minProfitRate`、`approvalStatus`、`lowMarginReason`、`priceLocked` 等字段 |
| 订单结构 | 订单缺少 `order_items`，无法从报价明细稳定转成订单明细 | 后续生产、单证、装箱、发票金额无法可靠追溯 | 已新增 `OrderItem` 模型并关联 `Order`、`Product` |
| 审批机制 | 没有通用审批表 | 低毛利报价、异常账期、大额折扣无法形成闭环 | 已新增 `ApprovalRequest` |
| 单证模板 | 单证表只有文件和数据，缺少模板版本 | PI、Sales Contract、CI、PL 等单据无法稳定复用和审计版本 | 已新增 `DocumentTemplate` 并关联 `Document` |
| 附件沉淀 | 缺少统一附件表 | 水单、合同、客户图纸、物流文件分散，后续难以检索 | 已新增 `Attachment`，支持客户、报价、订单等模块 |
| 审计追踪 | 缺少统一操作日志 | 价格修改、审批、发送、收款核销无法追责 | 已新增 `AuditLog` |
| AI 边界 | AI 路由允许云端/本地互相降级，但没有敏感数据和人工确认硬边界 | 客户资料、报价、付款凭证可能被静默发往云端；AI 结果可能被误当正式结论 | 已加入任务策略、敏感任务禁止静默云端降级、人工确认标记 |
| 工作台任务可见性 | 首页有客户/询盘/AI，但缺少“报价→订单→回款”的直接待办区 | 管理者和业务员无法一眼看到成交链路阻塞点 | 已新增销售到回款闭环待办区 |
| 版本一致性 | 文件名为 V4.1，但变更日志仍沿用 v2.x | 后续开发容易混淆版本基线 | 本节作为 V4.2 补强说明，并在变更日志新增 v4.2 |

### 11.3 补强后的核心业务状态机

#### 11.3.1 报价状态

推荐报价状态从简单 `draft/sent/accepted` 改为：

```text
draft → cost_check → calculated → approval → sent → customer_confirmed → converted
                         ↓            ↓        ↓
                      rejected      expired  rejected
```

执行规则：

- `draft`：业务员录入客户需求和产品明细。
- `cost_check`：系统读取产品成本、汇率、运费、包装和付款条款，计算底价。
- `calculated`：形成系统建议价和毛利率。
- `approval`：低于毛利底线、账期异常、大额折扣时强制审批。
- `sent`：只有人工锁价且审批通过后，才能对外发送。
- `customer_confirmed`：客户确认价格、数量、交期和付款条款。
- `converted`：生成订单，报价明细冻结为订单明细。

#### 11.3.2 订单状态

```text
pending → confirmed → deposit_paid → in_production → ready_to_ship → shipped → completed
                 ↓                                             ↓
              cancelled                                      cancelled
```

执行规则：

- 未收定金不得进入正式生产排期，除非管理层审批。
- `ready_to_ship` 前必须完成 CI / PL / PI 或 Sales Contract 的关键字段校验。
- `completed` 必须满足：已发货、尾款已核销、必要单证已归档。

#### 11.3.3 回款状态

```text
pending → partial → paid → verified
     ↓        ↓
  overdue  overdue
```

执行规则：

- 上传水单只代表 `paid`，财务核销后才是 `verified`。
- 逾期状态由计划收款日和实际核销日自动判断。
- 汇率差异、短付、手续费需形成异常记录并进入审批或备注。

### 11.4 AI 能力边界补强

AI 在本系统中只能做四类事情：

1. **草稿**：询盘回复、邮件、单证初稿。
2. **建议**：报价参考、客户分级、跟进优先级。
3. **摘要**：客户沟通、历史订单、付款记录。
4. **风险提示**：低毛利、逾期、异常账期、疑似撞单。

AI 不允许直接执行：

- 设置正式成交价格；
- 绕过毛利底线；
- 自动发送正式报价；
- 自动确认订单；
- 自动核销回款；
- 自动删除或覆盖客户关键资料。

代码层已在 `router.ts` 中增加任务策略：敏感任务默认不允许静默降级到云端，且返回 `requiresHumanApproval` 和 `warnings`，前端/后端应据此强制进入人工确认流程。

### 11.5 数据模型补强清单

本轮已补强或新增以下模型/字段：

- `Quotation`：增加 `minProfitRate`、`approvalStatus`、`lowMarginReason`、`validUntil`、`sentAt`、`confirmedAt`。
- `QuotationItem`：增加 `targetProfitRate`、`lineAmount`、`lineCost`、`priceLocked`。
- `Order`：增加 `incoterm`、`depositRate`、`shipDate`，并扩展订单状态。
- `OrderItem`：新增订单明细，确保报价转订单后明细冻结。
- `Payment`：增加 `bankSlipUrl`、`verifiedBy`、`verifiedAt`、`updatedAt`。
- `DocumentTemplate`：新增单证模板与版本控制。
- `Attachment`：新增统一附件模型。
- `ApprovalRequest`：新增通用审批模型。
- `AuditLog`：新增统一操作日志模型。

### 11.6 工作台补强

`page.tsx` 已新增“报价 → 订单 → 回款闭环待办”区块，目的是让用户打开系统后优先看到真正影响成交和现金流的事项：

- 低毛利报价待审批；
- 订单待收定金；
- 尾款/水单待财务核销；
- AI 建议需要人工确认。

该区块后续应接真实接口，建议接口聚合字段为：

```ts
type SalesCashTodo = {
  node: 'quote' | 'order' | 'payment'
  refId: string
  no: string
  customerName: string
  amount: string
  currency: string
  status: string
  risk: string
  ownerName: string
  dueAt?: string
}
```

### 11.7 下一步开发优先级

| 优先级 | 要做的事 | 验收标准 |
|--------|----------|---------|
| P0-1 | 落库迁移并生成 Prisma Client | 新增模型可迁移，基础 CRUD 可运行 |
| P0-2 | 报价毛利计算服务 | 给定产品成本、数量、贸易条款后能输出建议价、毛利率、是否触发审批 |
| P0-3 | 报价审批流 | 低毛利报价必须生成审批，未通过不能发送 |
| P0-4 | 报价转订单 | 报价明细冻结为订单明细，订单金额与报价一致 |
| P0-5 | 回款计划与核销 | 定金/尾款可计划、上传水单、财务核销、逾期预警 |
| P1 | 单证模板生成 | PI、Sales Contract、CI、PL 可由订单数据生成草稿并人工确认 |
| P1 | 统一附件与审计日志 | 价格、审批、发送、核销均有日志和文件可追溯 |
| P2 | AI 接入真实业务 | AI 输出只进入草稿/建议，不自动改变正式业务状态 |

### 11.8 本轮修改文件

- `schema.prisma`：补强销售到回款闭环相关数据模型。
- `router.ts`：补强 AI 敏感数据、降级和人工确认策略。
- `page.tsx`：补强首页成交链路待办。
- `NexFab_CRM_V4.1_合并工作台最新版本.md`：追加本审查与 V4.2 补强方案。

### 11.9 P0 工程化补充（继续完善）

在 V4.2 审查后，已继续把关键逻辑落到可开发工程结构中：

- 新增 `src/domain/salesCashRules.ts`：封装报价核算、毛利底线、发送校验、报价转订单、回款状态判断和工作台待办聚合。
- 新增 `tests/salesCashRules.test.ts`：覆盖低毛利审批、未锁价阻断、报价转订单、逾期回款和待办生成。
- 新增 API 入口：`/api/quotations/calculate`、`/api/quotations/validate-send`、`/api/quotations/convert-to-order`、`/api/payments/evaluate`、`/api/workbench/sales-cash-todos`、`/api/health`。
- 新增基础工程文件：`package.json`、`tsconfig.json`、`next.config.mjs`、`Dockerfile`、`.env.example`、`src/app/layout.tsx`、`workers/index.ts`。
- 将 `schema.prisma` 同步到正式位置 `prisma/schema.prisma`。
- 修正 `docker-compose.yml` 的 worker 启动命令为 `npm run worker`，并补充 worker 对 PostgreSQL 的健康依赖。
- 将 Prisma 固定到 `6.19.3`，避免 `latest` 自动升级到 Prisma 7 后与当前 schema 写法冲突。

验证结果：

- `salesCashRules.test.ts` 已通过。
- `prisma/schema.prisma` 已通过 Prisma 6.19.3 validate。

详见同目录 `P0_落地说明.md`。

### 11.10 本地构建、服务与迁移准备验证

继续工程化后，已完成本地可运行验证：

- 已安装依赖并生成 `pnpm-lock.yaml`。
- 已新增 `prisma.config.ts`，替代已废弃的 `package.json#prisma` 配置。
- 已生成 Prisma Client。
- 已通过 `pnpm run build`，Next.js 生产构建成功。
- 已启动本地服务 `http://localhost:3020` 并验证首页返回 HTTP 200。
- 已验证 `/api/health`、报价计算、发送前校验、报价转订单、回款判断和销售到回款待办 API。
- 已生成初始迁移 SQL：`prisma/migrations/20260813_init_sales_cash/migration.sql`。
- 已新增 `prisma/seed.ts`，准备基础用户、客户、产品、低毛利报价、审批和审计日志示例数据。
- 已新增 `src/server/db/prisma.ts`，用于后续 API 接入真实数据库。
- 已更新 Dockerfile 为 `pnpm` 锁定安装，并新增 `.dockerignore`。

当前环境未检测到 Docker，因此 PostgreSQL 容器和真实迁移执行尚未完成。详细操作见 `RUNBOOK_本地启动与验证.md`。

### 11.11 完整前端框架优先落地

根据“后台功能先不做，先做完整前端框架”的调整，本阶段已暂停继续扩展后端事务能力，优先完成前端产品骨架：

- 新增统一前端壳 `AppShell`：侧边导航、顶部搜索、角色切换、提醒入口和用户入口。
- 新增通用组件：`PageHeader`、`KpiCard`、`StatusTag`。
- 新增前端模拟数据：`src/frontend/mockData.tsx`。
- 已完成 12 个前端页面：工作台、客户、询盘、报价、审批、订单、回款、单证、社媒获客、AI 中心、经营分析、系统设置。
- 每个页面均围绕规划中的核心业务逻辑呈现：报价→订单→回款闭环、AI 人工确认边界、低毛利审批、防撞单、单证人工校验和财务核销。
- 已通过生产构建，并验证所有前端页面 HTTP 200。

详见 `FRONTEND_FRAMEWORK说明.md`。

### 11.12 HTML 前端预览与历史版本选择

根据“做一个 HTML 前端页面预览，并且每个版本更新可以在预览上选择历史版本”的要求，已完成：

- 新增独立预览页 `preview.html`，可直接用浏览器打开。
- 同步复制到 `public/preview.html`，本地服务启动后可访问 `/preview.html`。
- 预览页顶部新增“选择历史版本”下拉框，可查看 v4.1 至 v4.6 的版本说明。
- 后续每次版本更新，应同步追加 `preview.html` 中的 `versions` 配置。
- 继续补齐下一步前端页面：客户详情、询盘详情、报价新建、报价详情/编辑、订单详情、回款核销弹窗。
- 已完成生产构建，并验证预览页、主页面、详情页均返回 HTTP 200。

详见 `FRONTEND_FRAMEWORK说明.md`。

### 11.13 历史版本选择作废与详情页继续细化

根据最新要求，原“每个版本更新可以在预览上面选择看历史版本”已作废，本阶段调整为：

- 保留 `preview.html` HTML 前端预览页。
- 移除预览页顶部历史版本下拉选择器。
- 预览页只展示当前版本 `v4.7` 和当前前端框架说明。
- 继续补充下一步前端细化页面：单证详情、社媒线索详情、AI 任务详情。
- 单证、社媒、AI 列表页已接入详情入口。
- 已重新构建并重启本地服务，验证预览页和新增详情页均可访问。

详见 `FRONTEND_FRAMEWORK说明.md`。

### 11.14 销售到回款闭环看板

继续前端下一步，已新增独立页面 `/sales-cash`，用于把询盘、报价、订单、回款放在同一张业务看板中：

- 四列看板：询盘、报价、订单、回款。
- 每张卡展示单号、客户、金额、负责人、风险和下一步动作。
- 顶部 KPI 暴露关键阻塞：询盘待补字段、待审批报价、待发货订单、逾期回款。
- 下方补充闭环里程碑和阻塞归因。
- 侧边导航已新增“销售闭环”。
- `preview.html` 已同步为 v4.8，并新增销售闭环入口；历史版本选择保持取消。
- 已构建并验证 `/sales-cash` 与预览页均可访问。

详见 `FRONTEND_FRAMEWORK说明.md`。

## 变更日志

| 版本 | 日期 | 变更内容 |
|------|------|---------|
| v1.0 | 2026-08-12 | 初始项目规划（PROJECT_PLAN.md） |
| v1.1 | 2026-08-12 | 差距分析（GAP_ANALYSIS.md）— 12 项补缺 |
| v2.0 | 2026-08-13 | 整合版：原始规划 + 12 项补缺融合为完整设计报告 |
| v2.1 | 2026-08-13 | 补充经营数据分析核心环节（7 大分析维度 + 4 张数据表 + AI 分析能力） |
| v2.2 | 2026-08-13 | 增量整合 V4.1 角色工作台：五角色首页、登录分配、共享组件、细粒度权限与实施顺序；其余章节保持原结构 |
| v4.2 | 2026-08-13 | 全面审查并补强报价→订单→回款闭环、审批、附件、单证模板、审计日志、AI 人工确认边界和首页待办逻辑 |
| v4.3 | 2026-08-13 | 继续工程化落地：新增业务规则层、API 入口、测试用例、工程启动骨架、Prisma 版本固定和验证说明 |
| v4.4 | 2026-08-13 | 完成本地依赖安装、Prisma 配置迁移、生产构建、服务/API 验证、初始迁移 SQL、种子脚本和本地验证手册 |
| v4.5 | 2026-08-13 | 按前端优先策略完成完整前端框架：统一导航、角色工作台、12 个模块页面、模拟数据、通用组件和页面访问验证 |
| v4.6 | 2026-08-13 | 新增 HTML 前端预览页、预览页历史版本选择器、客户/询盘/报价/订单详情页、新建报价页和回款核销弹窗 |
| v4.7 | 2026-08-13 | 按最新要求取消预览页历史版本选择器，保留当前 HTML 预览，并新增单证、社媒线索、AI 任务详情页及入口验证 |
| v4.8 | 2026-08-13 | 新增销售到回款闭环看板 `/sales-cash`，同步侧边导航和 HTML 预览入口，展示阻塞事项、里程碑和归因 |

## v4.9 前端框架阶段记录

根据“后台功能先不做，先完成完整前端框架”的规划，本版本补齐客户详情页、询盘详情页、报价编辑页、订单详情页、回款核销弹窗五个关键交易页面。页面重点覆盖联系人/跟进、询盘条件补齐、报价明细与毛利审批、订单履约与单证回款闭环、财务核销检查清单。所有数据仍为 mock 数据，正式保存、发送、审批、核销需后续接入后台 API、权限和审计日志。

## v5.0 审查与完善记录

本阶段对当前前端框架做了体验与业务逻辑审查，发现全局搜索、通知、AI 边界、跨模块下一步动作和报价编辑可读性仍不足。已补充可跳转全局搜索、风险与待办抽屉、AI 边界规则抽屉、通用下一步动作面板，并将报价编辑明细从宽表格优化为卡片化结构。后台功能仍暂不启用，保存、发送、审批和核销动作继续保持前端占位。

## v5.1 前端阶段记录

本阶段补齐审批详情、报价转订单、通知中心和角色权限差异视图。前端已能展示审批申请、规则命中、审计日志、转订单前置检查、通知待办聚合和角色权限矩阵。后台功能仍暂不启用，正式审批、生成订单、通知状态更新、权限保存必须后续接入服务端权限、审计日志和真实数据库。

# NexFab CRM 本地启动与验证手册

更新时间：2026-08-13

## 1. 当前已验证结论

当前工程已经完成以下验证：

- 依赖已通过 `pnpm install` 安装。
- Prisma Client 已生成。
- Prisma schema 已通过校验。
- Next.js 生产构建已通过。
- 本地服务已启动并验证首页 HTTP 200。
- `/api/health` 已返回 `ok: true`。
- 报价、发送校验、报价转订单、回款判断、工作台待办 API 已验证。
- 业务规则测试已通过。
- 初始迁移 SQL 已生成：`prisma/migrations/20260813_init_sales_cash/migration.sql`。

## 2. 本地命令

进入目录：

```bash
cd /Users/dream/Documents/外贸crm系统开发/外贸CRM/新版本
```

安装依赖：

```bash
pnpm install
```

生成 Prisma Client：

```bash
DATABASE_URL='postgresql://crm:crm_secret@localhost:5432/crm?schema=public' pnpm run db:generate
```

校验 Prisma schema：

```bash
DATABASE_URL='postgresql://crm:crm_secret@localhost:5432/crm?schema=public' pnpm run db:validate
```

业务规则测试：

```bash
pnpm run test:rules
```

生产构建：

```bash
DATABASE_URL='postgresql://crm:crm_secret@localhost:5432/crm?schema=public' pnpm run build
```

启动服务：

```bash
DATABASE_URL='postgresql://crm:crm_secret@localhost:5432/crm?schema=public' pnpm exec next start -p 3020
```

访问：

- 首页：`http://localhost:3020/`
- 健康检查：`http://localhost:3020/api/health`

## 3. 数据库迁移

当前环境没有检测到 Docker，因此尚未直接启动 PostgreSQL 容器。迁移文件已经生成，可在有 PostgreSQL + pgvector 的环境执行：

```bash
DATABASE_URL='postgresql://crm:crm_secret@localhost:5432/crm?schema=public' pnpm run db:migrate
```

生产环境使用：

```bash
DATABASE_URL='postgresql://crm:crm_secret@postgres:5432/crm?schema=public' pnpm run db:deploy
```

种子数据：

```bash
DATABASE_URL='postgresql://crm:crm_secret@localhost:5432/crm?schema=public' pnpm run db:seed
```

## 4. 已验证 API 示例

健康检查：

```bash
curl -fsS http://localhost:3020/api/health
```

报价计算：

```bash
curl -fsS -X POST http://localhost:3020/api/quotations/calculate \
  -H 'Content-Type: application/json' \
  --data '{"currency":"USD","minProfitRate":18,"targetProfitRate":22,"now":"2026-08-13T00:00:00.000Z","items":[{"productName":"PLA Filament","quantity":1000,"unitCost":5.2,"manualUnitPrice":6.2},{"productName":"PETG Filament","quantity":500,"unitCost":6.1}],"expenses":[{"name":"freight","amount":600}]}'
```

预期重点：

- 低毛利时 `approvalRequired: true`。
- `approvalStatus: pending`。
- 返回人工确认/锁价提醒。

## 5. 当前限制

- 当前 API 仍主要调用规则层，尚未把写操作接入真实数据库事务。
- 当前环境没有 Docker，未能实际启动 PostgreSQL 容器执行迁移。
- 种子脚本已准备，但需在数据库可连接后执行。
- 登录、权限中间件、真实用户会话尚未接入。

## 6. 下一步建议

1. 在有 Docker 的环境启动 PostgreSQL / Redis / MinIO。
2. 执行 `pnpm run db:migrate` 和 `pnpm run db:seed`。
3. 把报价 API 改为数据库事务：创建报价、报价明细、审批、审计日志。
4. 增加登录与角色权限中间件。
5. 把首页静态数据替换为 `/api/workbench/sales-cash-todos` 实际接口数据。

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateTable
CREATE TABLE "users" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL DEFAULT 1,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'sales',
    "avatar" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL DEFAULT 1,
    "company_name" TEXT NOT NULL,
    "country" TEXT,
    "website" TEXT,
    "industry" TEXT,
    "customer_level" TEXT,
    "source" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "tags" TEXT[],
    "ai_score" DOUBLE PRECISION DEFAULT 0,
    "ai_profile" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_contact_at" TIMESTAMP(3),

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL DEFAULT 1,
    "customer_id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "whatsapp" TEXT,
    "position" TEXT,
    "is_decision_maker" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inquiries" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL DEFAULT 1,
    "customer_id" BIGINT NOT NULL,
    "inquiry_no" TEXT NOT NULL,
    "source" TEXT,
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "content_translated" TEXT,
    "language" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "assigned_to" BIGINT,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "ai_analysis" JSONB,
    "ai_reply_draft" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotations" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL DEFAULT 1,
    "inquiry_id" BIGINT,
    "customer_id" BIGINT NOT NULL,
    "quote_no" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "trade_term" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "exchange_rate" DECIMAL(10,4),
    "total_amount" DECIMAL(15,2),
    "total_cost" DECIMAL(15,2),
    "profit_rate" DECIMAL(5,2),
    "min_profit_rate" DECIMAL(5,2),
    "status" TEXT NOT NULL DEFAULT 'draft',
    "approval_status" TEXT NOT NULL DEFAULT 'not_required',
    "low_margin_reason" TEXT,
    "valid_until" TIMESTAMP(3),
    "sent_at" TIMESTAMP(3),
    "confirmed_at" TIMESTAMP(3),
    "ai_suggestion" JSONB,
    "created_by" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quotations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotation_items" (
    "id" BIGSERIAL NOT NULL,
    "quotation_id" BIGINT NOT NULL,
    "product_id" BIGINT,
    "product_name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'PCS',
    "unit_price" DECIMAL(15,4) NOT NULL,
    "cost" DECIMAL(15,4),
    "target_profit_rate" DECIMAL(5,2),
    "line_amount" DECIMAL(15,2),
    "line_cost" DECIMAL(15,2),
    "ai_price_ref" JSONB,
    "price_locked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "quotation_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL DEFAULT 1,
    "quotation_id" BIGINT,
    "customer_id" BIGINT NOT NULL,
    "order_no" TEXT NOT NULL,
    "pi_no" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "total_amount" DECIMAL(15,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "payment_term" TEXT,
    "incoterm" TEXT,
    "deposit_rate" DECIMAL(5,2),
    "delivery_date" TIMESTAMP(3),
    "ship_date" TIMESTAMP(3),
    "ai_risk_score" DOUBLE PRECISION DEFAULT 0,
    "created_by" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" BIGSERIAL NOT NULL,
    "order_id" BIGINT NOT NULL,
    "product_id" BIGINT,
    "product_name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'PCS',
    "unit_price" DECIMAL(15,4) NOT NULL,
    "line_amount" DECIMAL(15,2) NOT NULL,
    "specification" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL DEFAULT 1,
    "product_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_en" TEXT,
    "category" TEXT,
    "specification" TEXT,
    "unit" TEXT NOT NULL DEFAULT 'PCS',
    "cost_price" DECIMAL(15,4) NOT NULL,
    "min_price" DECIMAL(15,4),
    "standard_price" DECIMAL(15,4),
    "keywords" TEXT[],
    "image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productions" (
    "id" BIGSERIAL NOT NULL,
    "order_id" BIGINT NOT NULL,
    "stage" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "productions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL DEFAULT 1,
    "order_id" BIGINT NOT NULL,
    "doc_type" TEXT NOT NULL,
    "doc_no" TEXT,
    "file_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "ai_generated" BOOLEAN NOT NULL DEFAULT false,
    "ai_verified" BOOLEAN NOT NULL DEFAULT false,
    "human_verified_by" BIGINT,
    "template_id" BIGINT,
    "data" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL DEFAULT 1,
    "order_id" BIGINT NOT NULL,
    "payment_type" TEXT NOT NULL,
    "planned_amount" DECIMAL(15,2) NOT NULL,
    "actual_amount" DECIMAL(15,2),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "exchange_rate" DECIMAL(10,4),
    "planned_date" TIMESTAMP(3),
    "actual_date" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "bank_slip_url" TEXT,
    "verified_by" BIGINT,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "communications" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL DEFAULT 1,
    "customer_id" BIGINT NOT NULL,
    "channel" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "ai_summary" TEXT,
    "ai_sentiment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "communications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_templates" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL DEFAULT 1,
    "doc_type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "content" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" BIGINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL DEFAULT 1,
    "module" TEXT NOT NULL,
    "ref_id" BIGINT NOT NULL,
    "customer_id" BIGINT,
    "quotation_id" BIGINT,
    "order_id" BIGINT,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "mime_type" TEXT,
    "sha256" TEXT,
    "uploaded_by" BIGINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_requests" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL DEFAULT 1,
    "module" TEXT NOT NULL,
    "ref_id" BIGINT NOT NULL,
    "quotation_id" BIGINT,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "requested_by" BIGINT NOT NULL,
    "approver_id" BIGINT,
    "decided_at" TIMESTAMP(3),
    "decision_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "approval_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL DEFAULT 1,
    "actor_id" BIGINT,
    "action" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "ref_id" BIGINT,
    "before" JSONB,
    "after" JSONB,
    "ip" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_tasks" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL DEFAULT 1,
    "task_type" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "ref_id" BIGINT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "input" JSONB,
    "output" JSONB,
    "model_used" TEXT,
    "tokens_used" INTEGER DEFAULT 0,
    "cost" DECIMAL(10,4),
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "ai_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "customers_tenant_id_idx" ON "customers"("tenant_id");

-- CreateIndex
CREATE INDEX "customers_country_idx" ON "customers"("country");

-- CreateIndex
CREATE INDEX "customers_customer_level_idx" ON "customers"("customer_level");

-- CreateIndex
CREATE INDEX "contacts_customer_id_idx" ON "contacts"("customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "inquiries_inquiry_no_key" ON "inquiries"("inquiry_no");

-- CreateIndex
CREATE INDEX "inquiries_customer_id_idx" ON "inquiries"("customer_id");

-- CreateIndex
CREATE INDEX "inquiries_status_idx" ON "inquiries"("status");

-- CreateIndex
CREATE INDEX "inquiries_assigned_to_idx" ON "inquiries"("assigned_to");

-- CreateIndex
CREATE UNIQUE INDEX "quotations_quote_no_key" ON "quotations"("quote_no");

-- CreateIndex
CREATE INDEX "quotations_customer_id_idx" ON "quotations"("customer_id");

-- CreateIndex
CREATE INDEX "quotations_inquiry_id_idx" ON "quotations"("inquiry_id");

-- CreateIndex
CREATE INDEX "quotations_status_idx" ON "quotations"("status");

-- CreateIndex
CREATE INDEX "quotation_items_quotation_id_idx" ON "quotation_items"("quotation_id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_no_key" ON "orders"("order_no");

-- CreateIndex
CREATE INDEX "orders_customer_id_idx" ON "orders"("customer_id");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");

-- CreateIndex
CREATE INDEX "order_items_product_id_idx" ON "order_items"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "products_product_code_key" ON "products"("product_code");

-- CreateIndex
CREATE INDEX "products_tenant_id_idx" ON "products"("tenant_id");

-- CreateIndex
CREATE INDEX "products_category_idx" ON "products"("category");

-- CreateIndex
CREATE INDEX "productions_order_id_idx" ON "productions"("order_id");

-- CreateIndex
CREATE INDEX "documents_order_id_idx" ON "documents"("order_id");

-- CreateIndex
CREATE INDEX "documents_doc_type_status_idx" ON "documents"("doc_type", "status");

-- CreateIndex
CREATE INDEX "payments_order_id_idx" ON "payments"("order_id");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "communications_customer_id_idx" ON "communications"("customer_id");

-- CreateIndex
CREATE INDEX "communications_channel_idx" ON "communications"("channel");

-- CreateIndex
CREATE INDEX "document_templates_tenant_id_doc_type_is_active_idx" ON "document_templates"("tenant_id", "doc_type", "is_active");

-- CreateIndex
CREATE INDEX "attachments_module_ref_id_idx" ON "attachments"("module", "ref_id");

-- CreateIndex
CREATE INDEX "attachments_customer_id_idx" ON "attachments"("customer_id");

-- CreateIndex
CREATE INDEX "attachments_quotation_id_idx" ON "attachments"("quotation_id");

-- CreateIndex
CREATE INDEX "attachments_order_id_idx" ON "attachments"("order_id");

-- CreateIndex
CREATE INDEX "approval_requests_module_ref_id_idx" ON "approval_requests"("module", "ref_id");

-- CreateIndex
CREATE INDEX "approval_requests_status_idx" ON "approval_requests"("status");

-- CreateIndex
CREATE INDEX "audit_logs_module_ref_id_idx" ON "audit_logs"("module", "ref_id");

-- CreateIndex
CREATE INDEX "audit_logs_actor_id_idx" ON "audit_logs"("actor_id");

-- CreateIndex
CREATE INDEX "ai_tasks_status_idx" ON "ai_tasks"("status");

-- CreateIndex
CREATE INDEX "ai_tasks_module_ref_id_idx" ON "ai_tasks"("module", "ref_id");

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_inquiry_id_fkey" FOREIGN KEY ("inquiry_id") REFERENCES "inquiries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_items" ADD CONSTRAINT "quotation_items_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "quotations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_items" ADD CONSTRAINT "quotation_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "quotations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productions" ADD CONSTRAINT "productions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "document_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "communications" ADD CONSTRAINT "communications_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_templates" ADD CONSTRAINT "document_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "quotations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_requests" ADD CONSTRAINT "approval_requests_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "quotations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_requests" ADD CONSTRAINT "approval_requests_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_requests" ADD CONSTRAINT "approval_requests_approver_id_fkey" FOREIGN KEY ("approver_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;


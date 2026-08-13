import { Prisma, type PrismaClient } from '@prisma/client'
import {
  calculateQuotation,
  convertQuotationToOrder,
  validateQuotationCanSend,
  buildSalesCashTodos,
  type ApprovalStatus,
  type CalculateQuotationInput,
  type QuotationStatus,
} from '@/domain/salesCashRules'
import { prisma } from '@/server/db/prisma'

type Db = PrismaClient | Prisma.TransactionClient

type CreateQuotationPayload = CalculateQuotationInput & {
  customerId: string | number
  inquiryId?: string | number
  quoteNo?: string
  tradeTerm?: string
  exchangeRate?: number
  createdBy: string | number
}

type DecideApprovalPayload = {
  approvalId: string | number
  approverId: string | number
  decision: 'approved' | 'rejected'
  decisionNote?: string
}

type SendQuotationPayload = {
  quotationId: string | number
  actorId: string | number
  now?: string
}

type ConfirmQuotationPayload = {
  quotationId: string | number
  actorId: string | number
}

type ConvertQuotationPayload = {
  quotationId: string | number
  actorId: string | number
  orderNo?: string
  depositRate: number
  plannedDepositDate?: string
  plannedBalanceDate?: string
  paymentTerm?: string
  deliveryDate?: string
}

type VerifyPaymentPayload = {
  paymentId: string | number
  verifiedBy: string | number
  actualAmount?: number
  actualDate?: string
  bankSlipUrl?: string
  exchangeRate?: number
}

function toBigInt(value: string | number | bigint, field: string): bigint {
  try {
    return BigInt(value)
  } catch {
    throw new Error(`${field} must be a valid id`)
  }
}

function toDecimal(value: number | string | Prisma.Decimal | null | undefined): Prisma.Decimal | undefined {
  if (value === null || value === undefined) return undefined
  return new Prisma.Decimal(value)
}

function decimalToNumber(value: Prisma.Decimal | number | string | null | undefined): number {
  if (value === null || value === undefined) return 0
  return Number(value.toString())
}

function makeBusinessNo(prefix: string, now = new Date()) {
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const tail = `${now.getTime()}`.slice(-6)
  return `${prefix}-${yyyy}${mm}${dd}-${tail}`
}

async function writeAudit(db: Db, input: {
  actorId?: bigint
  action: string
  module: string
  refId?: bigint
  before?: Prisma.InputJsonValue
  after?: Prisma.InputJsonValue
}) {
  return db.auditLog.create({
    data: {
      actorId: input.actorId,
      action: input.action,
      module: input.module,
      refId: input.refId,
      before: input.before,
      after: input.after,
    },
  })
}

function quotationForSendCheck(quotation: {
  status: string
  approvalStatus: string
  profitRate: Prisma.Decimal | null
  minProfitRate: Prisma.Decimal | null
  validUntil: Date | null
  items: Array<{ priceLocked: boolean }>
}) {
  return {
    status: quotation.status as QuotationStatus,
    approvalStatus: quotation.approvalStatus as ApprovalStatus,
    profitRate: decimalToNumber(quotation.profitRate),
    minProfitRate: decimalToNumber(quotation.minProfitRate),
    validUntil: quotation.validUntil?.toISOString(),
    items: quotation.items,
  }
}

export async function createQuotationTransaction(payload: CreateQuotationPayload) {
  const customerId = toBigInt(payload.customerId, 'customerId')
  const createdBy = toBigInt(payload.createdBy, 'createdBy')
  const inquiryId = payload.inquiryId ? toBigInt(payload.inquiryId, 'inquiryId') : undefined
  const calculated = calculateQuotation({
    currency: payload.currency,
    minProfitRate: payload.minProfitRate,
    targetProfitRate: payload.targetProfitRate,
    items: payload.items,
    expenses: payload.expenses,
    validDays: payload.validDays,
    now: payload.now ? new Date(payload.now) : undefined,
  })

  return prisma.$transaction(async (tx) => {
    const quotation = await tx.quotation.create({
      data: {
        customerId,
        inquiryId,
        quoteNo: payload.quoteNo || makeBusinessNo('QT'),
        tradeTerm: payload.tradeTerm,
        currency: calculated.currency,
        exchangeRate: toDecimal(payload.exchangeRate),
        totalAmount: toDecimal(calculated.totalAmount),
        totalCost: toDecimal(calculated.totalCost),
        profitRate: toDecimal(calculated.profitRate),
        minProfitRate: toDecimal(calculated.minProfitRate),
        status: calculated.status,
        approvalStatus: calculated.approvalStatus,
        lowMarginReason: calculated.lowMarginReason,
        validUntil: new Date(calculated.validUntil),
        aiSuggestion: { warnings: calculated.warnings },
        createdBy,
        items: {
          create: calculated.items.map((item) => ({
            productId: item.productId ? toBigInt(item.productId, 'productId') : undefined,
            productName: item.productName,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: toDecimal(item.unitPrice)!,
            cost: toDecimal(item.unitCost),
            targetProfitRate: toDecimal(item.targetProfitRate ?? payload.targetProfitRate),
            lineAmount: toDecimal(item.lineAmount),
            lineCost: toDecimal(item.lineCost),
            aiPriceRef: { profitRate: item.profitRate },
            priceLocked: item.priceLocked,
          })),
        },
      },
      include: { items: true },
    })

    const approval = calculated.approvalRequired
      ? await tx.approvalRequest.create({
          data: {
            module: 'quotation',
            refId: quotation.id,
            quotationId: quotation.id,
            reason: calculated.lowMarginReason || '报价触发审批规则',
            requestedBy: createdBy,
          },
        })
      : null

    await writeAudit(tx, {
      actorId: createdBy,
      action: 'quotation.create',
      module: 'quotation',
      refId: quotation.id,
      after: { quoteNo: quotation.quoteNo, approvalRequired: calculated.approvalRequired },
    })

    return { quotation, approval, calculated }
  })
}

export async function decideApprovalTransaction(payload: DecideApprovalPayload) {
  const approvalId = toBigInt(payload.approvalId, 'approvalId')
  const approverId = toBigInt(payload.approverId, 'approverId')

  return prisma.$transaction(async (tx) => {
    const before = await tx.approvalRequest.findUniqueOrThrow({ where: { id: approvalId } })
    if (before.status !== 'pending') {
      throw new Error('only pending approval can be decided')
    }

    const approval = await tx.approvalRequest.update({
      where: { id: approvalId },
      data: {
        status: payload.decision,
        approverId,
        decidedAt: new Date(),
        decisionNote: payload.decisionNote,
      },
    })

    let quotation = null
    if (approval.module === 'quotation' && approval.quotationId) {
      quotation = await tx.quotation.update({
        where: { id: approval.quotationId },
        data: {
          approvalStatus: payload.decision,
          status: payload.decision === 'rejected' ? 'rejected' : 'calculated',
        },
        include: { items: true },
      })
    }

    await writeAudit(tx, {
      actorId: approverId,
      action: `approval.${payload.decision}`,
      module: approval.module,
      refId: approval.refId,
      before: { status: before.status },
      after: { approvalId: approval.id.toString(), status: approval.status },
    })

    return { approval, quotation }
  })
}

export async function sendQuotationTransaction(payload: SendQuotationPayload) {
  const quotationId = toBigInt(payload.quotationId, 'quotationId')
  const actorId = toBigInt(payload.actorId, 'actorId')
  const now = payload.now ? new Date(payload.now) : new Date()

  return prisma.$transaction(async (tx) => {
    const quotation = await tx.quotation.findUniqueOrThrow({
      where: { id: quotationId },
      include: { items: true },
    })
    const check = validateQuotationCanSend(quotationForSendCheck(quotation), now)
    if (!check.ok) {
      throw new Error(check.errors.join('；'))
    }

    const updated = await tx.quotation.update({
      where: { id: quotationId },
      data: { status: 'sent', sentAt: now },
      include: { items: true },
    })

    await writeAudit(tx, {
      actorId,
      action: 'quotation.send',
      module: 'quotation',
      refId: quotationId,
      before: { status: quotation.status },
      after: { status: updated.status, sentAt: updated.sentAt?.toISOString() },
    })

    return updated
  })
}

export async function confirmQuotationTransaction(payload: ConfirmQuotationPayload) {
  const quotationId = toBigInt(payload.quotationId, 'quotationId')
  const actorId = toBigInt(payload.actorId, 'actorId')

  return prisma.$transaction(async (tx) => {
    const quotation = await tx.quotation.findUniqueOrThrow({ where: { id: quotationId } })
    if (quotation.status !== 'sent' && quotation.status !== 'calculated') {
      throw new Error('only sent or calculated quotation can be customer-confirmed')
    }
    if (quotation.approvalStatus === 'pending' || quotation.approvalStatus === 'rejected') {
      throw new Error('quotation approval is not satisfied')
    }

    const updated = await tx.quotation.update({
      where: { id: quotationId },
      data: { status: 'customer_confirmed', confirmedAt: new Date() },
      include: { items: true },
    })

    await writeAudit(tx, {
      actorId,
      action: 'quotation.customer_confirm',
      module: 'quotation',
      refId: quotationId,
      before: { status: quotation.status },
      after: { status: updated.status },
    })

    return updated
  })
}

export async function convertQuotationToOrderTransaction(payload: ConvertQuotationPayload) {
  const quotationId = toBigInt(payload.quotationId, 'quotationId')
  const actorId = toBigInt(payload.actorId, 'actorId')

  return prisma.$transaction(async (tx) => {
    const quotation = await tx.quotation.findUniqueOrThrow({
      where: { id: quotationId },
      include: { items: true },
    })

    const approvalRequired = decimalToNumber(quotation.profitRate) < decimalToNumber(quotation.minProfitRate)
    const draft = convertQuotationToOrder({
      quotation: {
        currency: quotation.currency,
        status: quotation.status as QuotationStatus,
        approvalStatus: quotation.approvalStatus as ApprovalStatus,
        totalCost: decimalToNumber(quotation.totalCost),
        totalAmount: decimalToNumber(quotation.totalAmount),
        grossProfit: decimalToNumber(quotation.totalAmount) - decimalToNumber(quotation.totalCost),
        profitRate: decimalToNumber(quotation.profitRate),
        minProfitRate: decimalToNumber(quotation.minProfitRate),
        approvalRequired,
        validUntil: quotation.validUntil?.toISOString() || new Date().toISOString(),
        items: quotation.items.map((item) => ({
          productId: item.productId?.toString(),
          productName: item.productName,
          quantity: item.quantity,
          unit: item.unit,
          unitCost: decimalToNumber(item.cost),
          unitPrice: decimalToNumber(item.unitPrice),
          lineCost: decimalToNumber(item.lineCost),
          lineAmount: decimalToNumber(item.lineAmount),
          profitRate: 0,
          priceLocked: item.priceLocked,
        })),
        warnings: [],
      },
      depositRate: payload.depositRate,
      plannedDepositDate: payload.plannedDepositDate,
      plannedBalanceDate: payload.plannedBalanceDate,
    })

    const order = await tx.order.create({
      data: {
        quotationId: quotation.id,
        customerId: quotation.customerId,
        orderNo: payload.orderNo || makeBusinessNo('SO'),
        status: draft.status,
        totalAmount: toDecimal(draft.totalAmount)!,
        currency: draft.currency,
        paymentTerm: payload.paymentTerm,
        incoterm: quotation.tradeTerm,
        depositRate: toDecimal(payload.depositRate),
        deliveryDate: payload.deliveryDate ? new Date(payload.deliveryDate) : undefined,
        createdBy: actorId,
        items: {
          create: draft.items.map((item) => ({
            productId: item.productId ? toBigInt(item.productId, 'productId') : undefined,
            productName: item.productName,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: toDecimal(item.unitPrice)!,
            lineAmount: toDecimal(item.lineAmount)!,
          })),
        },
        payments: {
          create: draft.payments.map((payment) => ({
            paymentType: payment.paymentType,
            plannedAmount: toDecimal(payment.plannedAmount)!,
            currency: payment.currency,
            plannedDate: payment.plannedDate ? new Date(payment.plannedDate) : undefined,
            status: payment.status,
          })),
        },
      },
      include: { items: true, payments: true },
    })

    const updatedQuotation = await tx.quotation.update({
      where: { id: quotation.id },
      data: { status: 'converted' },
    })

    await writeAudit(tx, {
      actorId,
      action: 'quotation.convert_to_order',
      module: 'order',
      refId: order.id,
      before: { quotationStatus: quotation.status },
      after: { orderNo: order.orderNo, quotationStatus: updatedQuotation.status },
    })

    return { order, quotation: updatedQuotation }
  })
}

export async function verifyPaymentTransaction(payload: VerifyPaymentPayload) {
  const paymentId = toBigInt(payload.paymentId, 'paymentId')
  const verifiedBy = toBigInt(payload.verifiedBy, 'verifiedBy')
  const actualDate = payload.actualDate ? new Date(payload.actualDate) : new Date()

  return prisma.$transaction(async (tx) => {
    const before = await tx.payment.findUniqueOrThrow({ where: { id: paymentId } })
    const actualAmount = payload.actualAmount ?? (decimalToNumber(before.actualAmount) || decimalToNumber(before.plannedAmount))
    if (actualAmount <= 0) throw new Error('actualAmount must be greater than 0')

    const payment = await tx.payment.update({
      where: { id: paymentId },
      data: {
        actualAmount: toDecimal(actualAmount),
        actualDate,
        bankSlipUrl: payload.bankSlipUrl,
        exchangeRate: toDecimal(payload.exchangeRate),
        verifiedBy,
        verifiedAt: new Date(),
        status: 'verified',
      },
    })

    await writeAudit(tx, {
      actorId: verifiedBy,
      action: 'payment.verify',
      module: 'payment',
      refId: payment.id,
      before: { status: before.status, actualAmount: before.actualAmount?.toString() },
      after: { status: payment.status, actualAmount: payment.actualAmount?.toString() },
    })

    return payment
  })
}


export async function getSalesCashTodosFromDatabase(limit = 20) {
  const [quotations, orders, payments] = await prisma.$transaction([
    prisma.quotation.findMany({
      where: {
        OR: [
          { approvalStatus: 'pending' },
          { status: 'approval' },
        ],
      },
      include: { customer: true, creator: true },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    }),
    prisma.order.findMany({
      where: { status: { in: ['pending', 'confirmed', 'ready_to_ship'] } },
      include: { customer: true, creator: true },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    }),
    prisma.payment.findMany({
      where: { status: { in: ['pending', 'partial', 'paid', 'overdue'] } },
      include: { order: { include: { customer: true, creator: true } } },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    }),
  ])

  return buildSalesCashTodos({
    quotations: quotations.map((quotation) => ({
      quoteNo: quotation.quoteNo,
      customerName: quotation.customer.companyName,
      amount: decimalToNumber(quotation.totalAmount),
      currency: quotation.currency,
      approvalStatus: quotation.approvalStatus as ApprovalStatus,
      status: quotation.status as QuotationStatus,
      ownerName: quotation.creator.name,
      lowMarginReason: quotation.lowMarginReason || undefined,
    })),
    orders: orders.map((order) => ({
      orderNo: order.orderNo,
      customerName: order.customer.companyName,
      amount: decimalToNumber(order.totalAmount),
      currency: order.currency,
      status: order.status,
      ownerName: order.creator.name,
      deliveryDate: order.deliveryDate?.toISOString(),
    })),
    payments: payments.map((payment) => ({
      paymentNo: `PAY-${payment.id.toString()}`,
      customerName: payment.order.customer.companyName,
      amount: decimalToNumber(payment.plannedAmount),
      currency: payment.currency,
      status: payment.status,
      ownerName: payment.order.creator.name,
      plannedDate: payment.plannedDate?.toISOString(),
      risk: payment.status === 'paid' ? '待财务核销' : payment.status === 'overdue' ? '回款逾期' : undefined,
    })),
  })
}

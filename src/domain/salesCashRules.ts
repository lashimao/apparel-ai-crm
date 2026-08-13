/**
 * 报价 → 订单 → 回款核心业务规则
 *
 * 这些函数不依赖数据库和 UI，可被 API、Worker、测试脚本复用。
 * 硬规则：AI 只能给建议；正式报价、低毛利审批、转订单、回款核销都必须由人工动作触发。
 */

export type Currency = 'USD' | 'CNY' | 'EUR' | string

export type QuotationStatus =
  | 'draft'
  | 'cost_check'
  | 'calculated'
  | 'approval'
  | 'sent'
  | 'customer_confirmed'
  | 'expired'
  | 'converted'
  | 'rejected'

export type ApprovalStatus = 'not_required' | 'pending' | 'approved' | 'rejected'

export type QuotationInputItem = {
  productId?: string
  productName: string
  quantity: number
  unit?: string
  unitCost: number
  targetProfitRate?: number
  manualUnitPrice?: number
}

export type QuotationExpense = {
  name: string
  amount: number
}

export type CalculateQuotationInput = {
  currency: Currency
  minProfitRate: number
  targetProfitRate: number
  items: QuotationInputItem[]
  expenses?: QuotationExpense[]
  validDays?: number
  now?: Date
}

export type CalculatedQuotationItem = QuotationInputItem & {
  unit: string
  unitPrice: number
  lineCost: number
  lineAmount: number
  profitRate: number
  priceLocked: boolean
}

export type CalculatedQuotation = {
  currency: Currency
  status: QuotationStatus
  approvalStatus: ApprovalStatus
  totalCost: number
  totalAmount: number
  grossProfit: number
  profitRate: number
  minProfitRate: number
  approvalRequired: boolean
  lowMarginReason?: string
  validUntil: string
  items: CalculatedQuotationItem[]
  warnings: string[]
}

export type SendQuotationCheck = {
  ok: boolean
  errors: string[]
}

export type PaymentPlan = {
  paymentType: 'deposit' | 'balance' | 'freight' | string
  plannedAmount: number
  currency: Currency
  plannedDate?: string
  status: 'pending' | 'partial' | 'paid' | 'overdue' | 'verified'
}

export type OrderDraft = {
  status: 'pending'
  currency: Currency
  totalAmount: number
  depositRate: number
  items: Array<{
    productId?: string
    productName: string
    quantity: number
    unit: string
    unitPrice: number
    lineAmount: number
  }>
  payments: PaymentPlan[]
  auditAction: 'quotation.convert_to_order'
}

export type PaymentRecord = {
  paymentType: string
  plannedAmount: number
  actualAmount?: number
  plannedDate?: string
  verifiedAt?: string
}

export type PaymentEvaluation = PaymentRecord & {
  status: 'pending' | 'partial' | 'paid' | 'overdue' | 'verified'
  remainingAmount: number
  risk?: string
}

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function roundRate(value: number): number {
  return Math.round((value + Number.EPSILON) * 10000) / 100
}

function assertPositiveNumber(value: number, field: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${field} must be a positive number`)
  }
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

export function calculateQuotation(input: CalculateQuotationInput): CalculatedQuotation {
  if (!input.items.length) throw new Error('quotation must include at least one item')
  assertPositiveNumber(input.minProfitRate, 'minProfitRate')
  assertPositiveNumber(input.targetProfitRate, 'targetProfitRate')

  const expenseTotal = roundMoney((input.expenses || []).reduce((sum, expense) => {
    assertPositiveNumber(expense.amount, `expense.${expense.name}.amount`)
    return sum + expense.amount
  }, 0))
  const quantityTotal = input.items.reduce((sum, item) => sum + item.quantity, 0)
  assertPositiveNumber(quantityTotal, 'total quantity')

  const items = input.items.map((item) => {
    assertPositiveNumber(item.quantity, `${item.productName}.quantity`)
    assertPositiveNumber(item.unitCost, `${item.productName}.unitCost`)

    const allocatedExpense = expenseTotal * (item.quantity / quantityTotal)
    const allocatedExpensePerUnit = allocatedExpense / item.quantity
    const lineCost = roundMoney(item.unitCost * item.quantity + allocatedExpense)
    const targetRate = item.targetProfitRate ?? input.targetProfitRate
    assertPositiveNumber(targetRate, `${item.productName}.targetProfitRate`)

    // 建议价必须把运费、包装、保险等分摊费用计入成本基数；否则看似达标，实际毛利会被费用吃掉。
    const calculatedUnitPrice = (item.unitCost + allocatedExpensePerUnit) / (1 - targetRate / 100)
    const unitPrice = roundMoney(item.manualUnitPrice ?? calculatedUnitPrice)
    const lineAmount = roundMoney(unitPrice * item.quantity)
    const profitRate = lineAmount > 0 ? roundRate((lineAmount - lineCost) / lineAmount) : 0

    return {
      ...item,
      unit: item.unit || 'PCS',
      unitPrice,
      lineCost,
      lineAmount,
      profitRate,
      priceLocked: Boolean(item.manualUnitPrice),
    }
  })

  const totalCost = roundMoney(items.reduce((sum, item) => sum + item.lineCost, 0))
  const totalAmount = roundMoney(items.reduce((sum, item) => sum + item.lineAmount, 0))
  const grossProfit = roundMoney(totalAmount - totalCost)
  const profitRate = totalAmount > 0 ? roundRate(grossProfit / totalAmount) : 0
  const approvalRequired = profitRate < input.minProfitRate || items.some((item) => item.profitRate < input.minProfitRate)
  const warnings: string[] = []

  if (approvalRequired) {
    warnings.push('报价毛利低于底线，必须进入审批，未审批通过不得发送。')
  }
  if (items.some((item) => !item.priceLocked)) {
    warnings.push('存在未人工锁价的明细，发送前必须由业务员确认价格。')
  }

  const now = input.now || new Date()
  const validUntil = addDays(now, input.validDays ?? 14).toISOString()

  return {
    currency: input.currency,
    status: approvalRequired ? 'approval' : 'calculated',
    approvalStatus: approvalRequired ? 'pending' : 'not_required',
    totalCost,
    totalAmount,
    grossProfit,
    profitRate,
    minProfitRate: input.minProfitRate,
    approvalRequired,
    lowMarginReason: approvalRequired ? `综合毛利率 ${profitRate}% 低于底线 ${input.minProfitRate}%` : undefined,
    validUntil,
    items,
    warnings,
  }
}

export function validateQuotationCanSend(quotation: {
  status: QuotationStatus
  approvalStatus: ApprovalStatus
  profitRate: number
  minProfitRate: number
  validUntil?: string
  items: Array<{ priceLocked: boolean }>
}, now: Date = new Date()): SendQuotationCheck {
  const errors: string[] = []

  if (!['calculated', 'approval'].includes(quotation.status)) {
    errors.push('报价必须处于 calculated 或 approval 状态，才能进入发送前校验。')
  }
  if (quotation.profitRate < quotation.minProfitRate && quotation.approvalStatus !== 'approved') {
    errors.push('低毛利报价必须审批通过后才能发送。')
  }
  if (quotation.approvalStatus === 'rejected') {
    errors.push('审批被拒绝的报价不能发送。')
  }
  if (quotation.items.some((item) => !item.priceLocked)) {
    errors.push('所有报价明细必须人工锁价后才能发送。')
  }
  if (quotation.validUntil && new Date(quotation.validUntil).getTime() < now.getTime()) {
    errors.push('报价已过有效期，需重新核价。')
  }

  return { ok: errors.length === 0, errors }
}

export function convertQuotationToOrder(input: {
  quotation: CalculatedQuotation & { status: QuotationStatus; approvalStatus: ApprovalStatus }
  depositRate: number
  plannedDepositDate?: string
  plannedBalanceDate?: string
}): OrderDraft {
  const { quotation, depositRate } = input
  assertPositiveNumber(depositRate, 'depositRate')
  if (depositRate >= 100) throw new Error('depositRate must be lower than 100')

  if (quotation.status !== 'customer_confirmed') {
    throw new Error('only customer_confirmed quotation can be converted to order')
  }
  if (quotation.approvalRequired && quotation.approvalStatus !== 'approved') {
    throw new Error('approval quotation must be approved before converting to order')
  }

  const deposit = roundMoney(quotation.totalAmount * (depositRate / 100))
  const balance = roundMoney(quotation.totalAmount - deposit)

  return {
    status: 'pending',
    currency: quotation.currency,
    totalAmount: quotation.totalAmount,
    depositRate,
    items: quotation.items.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      lineAmount: item.lineAmount,
    })),
    payments: [
      { paymentType: 'deposit', plannedAmount: deposit, currency: quotation.currency, plannedDate: input.plannedDepositDate, status: 'pending' },
      { paymentType: 'balance', plannedAmount: balance, currency: quotation.currency, plannedDate: input.plannedBalanceDate, status: 'pending' },
    ],
    auditAction: 'quotation.convert_to_order',
  }
}

export function evaluatePayment(record: PaymentRecord, now: Date = new Date()): PaymentEvaluation {
  assertPositiveNumber(record.plannedAmount, 'plannedAmount')
  const actual = record.actualAmount ?? 0
  if (actual < 0) throw new Error('actualAmount cannot be negative')

  const remainingAmount = roundMoney(Math.max(record.plannedAmount - actual, 0))
  let status: PaymentEvaluation['status'] = 'pending'
  let risk: string | undefined

  if (record.verifiedAt) {
    status = 'verified'
  } else if (actual >= record.plannedAmount) {
    status = 'paid'
  } else if (actual > 0) {
    status = 'partial'
  }

  if (status !== 'verified' && record.plannedDate && new Date(record.plannedDate).getTime() < now.getTime()) {
    status = 'overdue'
    risk = actual > 0 ? '部分回款逾期，需催收尾款。' : '计划回款逾期，需催收。'
  }

  return { ...record, status, remainingAmount, risk }
}

export function buildSalesCashTodos(input: {
  quotations: Array<{ quoteNo: string; customerName: string; amount: number; currency: Currency; approvalStatus: ApprovalStatus; status: QuotationStatus; ownerName: string; lowMarginReason?: string }>
  orders: Array<{ orderNo: string; customerName: string; amount: number; currency: Currency; status: string; ownerName: string; deliveryDate?: string }>
  payments: Array<{ paymentNo: string; customerName: string; amount: number; currency: Currency; status: string; ownerName: string; plannedDate?: string; risk?: string }>
}) {
  return [
    ...input.quotations
      .filter((q) => q.approvalStatus === 'pending' || q.status === 'approval')
      .map((q) => ({ node: 'quote' as const, no: q.quoteNo, customerName: q.customerName, amount: q.amount, currency: q.currency, status: '待报价审批', risk: q.lowMarginReason || '需人工复核', ownerName: q.ownerName })),
    ...input.orders
      .filter((o) => ['pending', 'confirmed', 'ready_to_ship'].includes(o.status))
      .map((o) => ({ node: 'order' as const, no: o.orderNo, customerName: o.customerName, amount: o.amount, currency: o.currency, status: o.status, risk: o.status === 'pending' ? '待收定金/确认生产' : '需跟进交付节点', ownerName: o.ownerName, dueAt: o.deliveryDate })),
    ...input.payments
      .filter((p) => ['pending', 'partial', 'paid', 'overdue'].includes(p.status))
      .map((p) => ({ node: 'payment' as const, no: p.paymentNo, customerName: p.customerName, amount: p.amount, currency: p.currency, status: p.status, risk: p.risk || (p.status === 'paid' ? '待财务核销' : '待回款'), ownerName: p.ownerName, dueAt: p.plannedDate })),
  ]
}

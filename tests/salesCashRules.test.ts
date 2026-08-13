import assert from 'node:assert/strict'
import {
  buildSalesCashTodos,
  calculateQuotation,
  convertQuotationToOrder,
  evaluatePayment,
  validateQuotationCanSend,
} from '../src/domain/salesCashRules.ts'

const now = new Date('2026-08-13T00:00:00.000Z')

const quotation = calculateQuotation({
  currency: 'USD',
  minProfitRate: 18,
  targetProfitRate: 22,
  now,
  items: [
    { productId: 'P1001', productName: 'PLA Filament', quantity: 1000, unitCost: 5.2, manualUnitPrice: 6.2 },
    { productId: 'P1002', productName: 'PETG Filament', quantity: 500, unitCost: 6.1 },
  ],
  expenses: [{ name: 'freight', amount: 600 }],
})

assert.equal(quotation.currency, 'USD')
assert.equal(quotation.items.length, 2)
assert.equal(quotation.approvalRequired, true)
assert.equal(quotation.approvalStatus, 'pending')
assert.match(quotation.lowMarginReason || '', /低于底线/)

const sendCheck = validateQuotationCanSend(quotation, now)
assert.equal(sendCheck.ok, false)
assert.ok(sendCheck.errors.some((error) => error.includes('审批')))
assert.ok(sendCheck.errors.some((error) => error.includes('人工锁价')))

const approvedQuotation = {
  ...quotation,
  status: 'customer_confirmed' as const,
  approvalStatus: 'approved' as const,
  items: quotation.items.map((item) => ({ ...item, priceLocked: true })),
}

const orderDraft = convertQuotationToOrder({
  quotation: approvedQuotation,
  depositRate: 30,
  plannedDepositDate: '2026-08-15',
  plannedBalanceDate: '2026-09-15',
})

assert.equal(orderDraft.status, 'pending')
assert.equal(orderDraft.payments.length, 2)
assert.equal(orderDraft.payments[0].plannedAmount + orderDraft.payments[1].plannedAmount, approvedQuotation.totalAmount)

const overduePayment = evaluatePayment({
  paymentType: 'balance',
  plannedAmount: 10000,
  actualAmount: 3000,
  plannedDate: '2026-08-01',
}, now)

assert.equal(overduePayment.status, 'overdue')
assert.equal(overduePayment.remainingAmount, 7000)
assert.match(overduePayment.risk || '', /逾期/)

const todos = buildSalesCashTodos({
  quotations: [{ quoteNo: 'QT-1', customerName: 'Demo Buyer', amount: quotation.totalAmount, currency: 'USD', approvalStatus: 'pending', status: 'approval', ownerName: 'Lina', lowMarginReason: quotation.lowMarginReason }],
  orders: [{ orderNo: 'SO-1', customerName: 'Demo Buyer', amount: orderDraft.totalAmount, currency: 'USD', status: 'pending', ownerName: 'Lina' }],
  payments: [{ paymentNo: 'PAY-1', customerName: 'Demo Buyer', amount: overduePayment.plannedAmount, currency: 'USD', status: overduePayment.status, ownerName: 'Finance', risk: overduePayment.risk }],
})

assert.equal(todos.length, 3)
assert.deepEqual(todos.map((todo) => todo.node), ['quote', 'order', 'payment'])

console.log('salesCashRules tests passed')

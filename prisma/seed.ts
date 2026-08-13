import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: 'admin@nexfab.local' },
    update: {},
    create: {
      email: 'admin@nexfab.local',
      password: 'CHANGE_ME_HASHED_PASSWORD',
      name: '系统管理员',
      role: 'admin',
    },
  })

  const sales = await prisma.user.upsert({
    where: { email: 'sales@nexfab.local' },
    update: {},
    create: {
      email: 'sales@nexfab.local',
      password: 'CHANGE_ME_HASHED_PASSWORD',
      name: 'Lina',
      role: 'sales',
    },
  })

  const finance = await prisma.user.upsert({
    where: { email: 'finance@nexfab.local' },
    update: {},
    create: {
      email: 'finance@nexfab.local',
      password: 'CHANGE_ME_HASHED_PASSWORD',
      name: 'Finance',
      role: 'finance',
    },
  })

  const customer = await prisma.customer.create({
    data: {
      companyName: 'Demo Buyer Ltd.',
      country: 'United States',
      industry: '3D Printing Distribution',
      customerLevel: 'A',
      source: 'website',
      tags: ['demo', 'sales-cash'],
      aiScore: 86,
      contacts: {
        create: [{ name: 'Alex Morgan', email: 'alex@example.com', position: 'Purchasing Manager', isDecisionMaker: true }],
      },
    },
  })

  const pla = await prisma.product.create({
    data: {
      productCode: 'PLA-175-1KG-DEMO',
      name: 'PLA 1.75mm 1kg',
      nameEn: 'PLA Filament 1.75mm 1kg',
      category: 'filament',
      unit: 'PCS',
      costPrice: '5.20',
      minPrice: '6.80',
      standardPrice: '8.20',
      keywords: ['PLA', 'filament'],
    },
  })

  const quotation = await prisma.quotation.create({
    data: {
      customerId: customer.id,
      quoteNo: 'QT-DEMO-0001',
      tradeTerm: 'FOB',
      currency: 'USD',
      totalAmount: '10365.00',
      totalCost: '8850.00',
      profitRate: '14.62',
      minProfitRate: '18.00',
      status: 'approval',
      approvalStatus: 'pending',
      lowMarginReason: '综合毛利率 14.62% 低于底线 18%',
      validUntil: new Date('2026-08-27T00:00:00.000Z'),
      createdBy: sales.id,
      items: {
        create: [
          {
            productId: pla.id,
            productName: 'PLA Filament',
            quantity: 1000,
            unit: 'PCS',
            unitPrice: '6.20',
            cost: '5.20',
            targetProfitRate: '22.00',
            lineAmount: '6200.00',
            lineCost: '5600.00',
            priceLocked: true,
          },
        ],
      },
    },
  })

  await prisma.approvalRequest.create({
    data: {
      module: 'quotation',
      refId: quotation.id,
      quotationId: quotation.id,
      reason: '低毛利报价审批示例',
      requestedBy: sales.id,
    },
  })

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: 'seed.demo_data_created',
      module: 'system',
      refId: quotation.id,
      after: { customerId: customer.id.toString(), quotationId: quotation.id.toString(), financeId: finance.id.toString() },
    },
  })

  console.log('Seed completed:', {
    admin: admin.email,
    sales: sales.email,
    finance: finance.email,
    customerId: customer.id.toString(),
    quotationId: quotation.id.toString(),
  })
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

import type { ReactNode } from 'react'
import {
  AuditOutlined,
  BankOutlined,
  BarChartOutlined,
  CustomerServiceOutlined,
  DollarOutlined,
  FileDoneOutlined,
  FileSearchOutlined,
  HomeOutlined,
  MailOutlined,
  RobotOutlined,
  SafetyCertificateOutlined,
  SwapOutlined,
  SettingOutlined,
  ShareAltOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
} from '@ant-design/icons'

export type RoleKey = 'admin' | 'management' | 'sales_manager' | 'sales' | 'finance'

export const roleOptions = [
  { value: 'admin', label: '超级管理员' },
  { value: 'management', label: '管理层' },
  { value: 'sales_manager', label: '销售主管' },
  { value: 'sales', label: '销售' },
  { value: 'finance', label: '财务' },
] satisfies Array<{ value: RoleKey; label: string }>

export const navItems: Array<{ key: string; label: string; href: string; icon: ReactNode; roles?: RoleKey[] }> = [
  { key: 'dashboard', label: '工作台', href: '/', icon: <HomeOutlined /> },
  { key: 'sales-cash', label: '销售闭环', href: '/sales-cash', icon: <SwapOutlined /> },
  { key: 'customers', label: '客户', href: '/customers', icon: <TeamOutlined /> },
  { key: 'inquiries', label: '询盘', href: '/inquiries', icon: <MailOutlined /> },
  { key: 'quotations', label: '报价', href: '/quotations', icon: <DollarOutlined /> },
  { key: 'approvals', label: '审批', href: '/approvals', icon: <AuditOutlined /> },
  { key: 'orders', label: '订单', href: '/orders', icon: <ShoppingCartOutlined /> },
  { key: 'payments', label: '回款', href: '/payments', icon: <BankOutlined /> },
  { key: 'documents', label: '单证', href: '/documents', icon: <FileDoneOutlined /> },
  { key: 'social', label: '社媒获客', href: '/social', icon: <ShareAltOutlined /> },
  { key: 'ai', label: 'AI 中心', href: '/ai', icon: <RobotOutlined /> },
  { key: 'analytics', label: '经营分析', href: '/analytics', icon: <BarChartOutlined /> },
  { key: 'settings', label: '系统设置', href: '/settings', icon: <SettingOutlined />, roles: ['admin'] },
]

export const kpis = [
  { title: '活跃客户', value: 128, suffix: '家', trend: '+12%', color: '#185fa5' },
  { title: '待处理询盘', value: 12, suffix: '条', trend: '紧急 3', color: '#0f6e56' },
  { title: '进行中订单', value: 8, suffix: '单', trend: '2 单预警', color: '#854f0b' },
  { title: '本月销售额', value: 328560, suffix: 'USD', trend: '毛利率 22.8%', color: '#534ab7' },
]

export const customers = [
  { key: 'C001', company: 'Atlas Import LLC', level: 'A', country: 'United States', source: 'Website', owner: 'Lina', value: 'USD 186k', stage: '订单交付', nextAction: '确认 40HQ 生产排期', risk: '交期逼近', lastContact: '今天' },
  { key: 'C002', company: 'Pacific Buildmart', level: 'B', country: 'Australia', source: 'Alibaba', owner: 'Marco', value: 'USD 73k', stage: '报价审批', nextAction: '复核 DDP 报价毛利', risk: '毛利偏低', lastContact: '昨天' },
  { key: 'C003', company: 'EuroNova GmbH', level: 'A', country: 'Germany', source: 'Exhibition', owner: 'Anna', value: 'USD 142k', stage: '尾款催收', nextAction: '催收尾款水单', risk: '应收逾期', lastContact: '2 天前' },
  { key: 'C004', company: 'Gulf Star Trading', level: 'C', country: 'UAE', source: 'WhatsApp', owner: 'Lina', value: 'USD 29k', stage: '样品确认', nextAction: '发送样品跟进邮件', risk: '需求不明确', lastContact: '3 天前' },
]

export const inquiries = [
  { key: 'I001', inquiryNo: 'INQ-2026-0813-018', customer: 'Nordic Retail Group', country: 'Germany', source: 'Alibaba', priority: 'urgent', status: 'new', aiScore: 92, owner: 'Lina', product: 'PLA / PETG Filament', receivedAt: '09:12' },
  { key: 'I002', inquiryNo: 'INQ-2026-0813-011', customer: 'Andes Supply Co.', country: 'Chile', source: 'Website', priority: 'high', status: 'assigned', aiScore: 84, owner: 'Marco', product: 'ABS Filament', receivedAt: '10:44' },
  { key: 'I003', inquiryNo: 'INQ-2026-0812-044', customer: 'Gulf Star Trading', country: 'UAE', source: 'WhatsApp', priority: 'normal', status: 'quoted', aiScore: 71, owner: 'Anna', product: '3D Printer Spare Parts', receivedAt: '昨天' },
]

export const quotations = [
  { key: 'Q001', quoteNo: 'QT-2026-0813-006', customer: 'Pacific Buildmart', amount: 42800, currency: 'USD', profitRate: 14.6, minProfitRate: 18, status: 'approval', approvalStatus: 'pending', owner: 'Marco', validUntil: '2026-08-27', risk: '毛利偏低' },
  { key: 'Q002', quoteNo: 'QT-2026-0813-004', customer: 'Nordic Retail Group', amount: 28600, currency: 'USD', profitRate: 24.2, minProfitRate: 18, status: 'calculated', approvalStatus: 'not_required', owner: 'Lina', validUntil: '2026-08-24', risk: '待人工锁价' },
  { key: 'Q003', quoteNo: 'QT-2026-0812-019', customer: 'Atlas Import LLC', amount: 86400, currency: 'USD', profitRate: 22.8, minProfitRate: 18, status: 'sent', approvalStatus: 'approved', owner: 'Lina', validUntil: '2026-08-22', risk: '待客户确认' },
]

export const approvals = [
  { key: 'A001', type: '低毛利报价', refNo: 'QT-2026-0813-006', customer: 'Pacific Buildmart', requester: 'Marco', amount: 'USD 42,800', reason: 'DDP 运费上升，综合毛利 14.6%', status: 'pending', priority: 'high' },
  { key: 'A002', type: '异常账期', refNo: 'SO-2026-0809-003', customer: 'Atlas Import LLC', requester: 'Lina', amount: 'USD 86,400', reason: '客户要求尾款发货后 15 天支付', status: 'pending', priority: 'normal' },
]

export const orders = [
  { key: 'O001', orderNo: 'SO-2026-0809-003', customer: 'Atlas Import LLC', amount: 'USD 86,400', status: 'confirmed', progress: 38, deliveryDate: '2026-09-05', owner: 'Lina', risk: '待收定金' },
  { key: 'O002', orderNo: 'SO-2026-0804-009', customer: 'EuroNova GmbH', amount: 'USD 142,000', status: 'ready_to_ship', progress: 82, deliveryDate: '2026-08-18', owner: 'Anna', risk: '尾款未清' },
  { key: 'O003', orderNo: 'SO-2026-0729-016', customer: 'Andes Supply Co.', amount: 'USD 37,500', status: 'in_production', progress: 56, deliveryDate: '2026-08-29', owner: 'Marco', risk: '正常' },
]

export const payments = [
  { key: 'P001', paymentNo: 'PAY-2026-0801-014', orderNo: 'SO-2026-0804-009', customer: 'EuroNova GmbH', type: 'balance', planned: 'USD 18,200', actual: 'USD 0', status: 'overdue', plannedDate: '2026-08-01', owner: 'Finance' },
  { key: 'P002', paymentNo: 'PAY-2026-0810-003', orderNo: 'SO-2026-0809-003', customer: 'Atlas Import LLC', type: 'deposit', planned: 'USD 25,920', actual: 'USD 25,920', status: 'paid', plannedDate: '2026-08-15', owner: 'Finance' },
  { key: 'P003', paymentNo: 'PAY-2026-0811-008', orderNo: 'SO-2026-0729-016', customer: 'Andes Supply Co.', type: 'balance', planned: 'USD 11,250', actual: 'USD 5,000', status: 'partial', plannedDate: '2026-08-20', owner: 'Finance' },
]

export const documents = [
  { key: 'D001', docNo: 'PI-2026-0813-003', type: 'PI', orderNo: 'SO-2026-0809-003', customer: 'Atlas Import LLC', status: 'draft', ai: true, owner: 'Lina' },
  { key: 'D002', docNo: 'CI-2026-0804-009', type: 'CI', orderNo: 'SO-2026-0804-009', customer: 'EuroNova GmbH', status: 'verified', ai: false, owner: 'Anna' },
  { key: 'D003', docNo: 'PL-2026-0804-009', type: 'PL', orderNo: 'SO-2026-0804-009', customer: 'EuroNova GmbH', status: 'generated', ai: true, owner: 'Anna' },
]

export const socialLeads = [
  { key: 'S001', platform: 'LinkedIn', name: 'Michael Chen', company: 'Maker Supply Inc.', country: 'Canada', intent: 88, status: '待建档', owner: 'Lina' },
  { key: 'S002', platform: 'Facebook', name: 'Sofia Rossi', company: 'PrintLab EU', country: 'Italy', intent: 76, status: '待触达', owner: 'Marco' },
  { key: 'S003', platform: 'YouTube', name: 'Channel Inquiry', company: 'DIY Lab', country: 'United States', intent: 63, status: '已跟进', owner: 'Anna' },
]

export const aiTasks = [
  { key: 'AI001', title: '询盘回复草稿', module: '询盘', mode: '实时', status: '待人工确认', desc: '4 条高优先级询盘等待业务员确认后发送', icon: <MailOutlined /> },
  { key: 'AI002', title: '报价建议', module: '报价', mode: '云端', status: '需审批', desc: '2 份报价低于历史均价，需要复核毛利底线', icon: <DollarOutlined /> },
  { key: 'AI003', title: '单证 OCR', module: '单证', mode: '队列', status: '处理中', desc: '7 份 PI / PL 已进入队列，完成后通知审核', icon: <FileSearchOutlined /> },
  { key: 'AI004', title: '客户评分', module: '客户', mode: '本地', status: '已完成', desc: '批量更新 128 个客户画像与流失风险', icon: <CustomerServiceOutlined /> },
]

export const riskRules = [
  { key: 'R001', rule: '低毛利报价', owner: '销售主管', action: '强制审批', enabled: true },
  { key: 'R002', rule: '客户撞单/公海查重', owner: '系统', action: '阻断并提示', enabled: true },
  { key: 'R003', rule: '尾款逾期', owner: '财务', action: '预警并生成待办', enabled: true },
  { key: 'R004', rule: 'AI 对外发送', owner: '业务员', action: '必须人工确认', enabled: true },
]

export const pipeline = [
  { label: '新询盘', value: 46, color: '#1677ff' },
  { label: '已分配', value: 31, color: '#13c2c2' },
  { label: '已报价', value: 18, color: '#faad14' },
  { label: '已成交', value: 7, color: '#52c41a' },
]

export const roleCards = [
  { role: '超级管理员', focus: '系统健康、权限、AI 边界、数据安全', todos: ['配置审批规则', '检查 API Key 权限', '审计异常操作'] },
  { role: '管理层', focus: '销售额、毛利、回款、风险', todos: ['查看低毛利报价', '复盘本月漏斗', '关注逾期尾款'] },
  { role: '销售主管', focus: '线索分配、报价审批、团队跟进', todos: ['分配高优询盘', '审批异常报价', '检查撞单提醒'] },
  { role: '销售', focus: '客户跟进、询盘回复、报价推进', todos: ['处理今日询盘', '确认 AI 回复草稿', '跟进客户确认'] },
  { role: '财务', focus: '收款计划、核销、逾期预警', todos: ['核销水单', '催收逾期尾款', '检查账期异常'] },
]

export const salesCashTodos = [
  { key: 'T001', node: 'quote', no: 'QT-2026-0813-006', customer: 'Pacific Buildmart', amount: 'USD 42,800', status: '待毛利审批', risk: '毛利偏低', owner: 'Marco' },
  { key: 'T002', node: 'order', no: 'SO-2026-0809-003', customer: 'Atlas Import LLC', amount: 'USD 86,400', status: '待收定金', risk: '交期锁定前置', owner: 'Lina' },
  { key: 'T003', node: 'payment', no: 'PAY-2026-0801-014', customer: 'EuroNova GmbH', amount: 'USD 18,200', status: '待核销', risk: '尾款逾期', owner: 'Finance' },
]

export const statusColor: Record<string, string> = {
  missing: 'red',
  risk: 'orange',
  processing: 'blue',
  not_required: 'default',
  new: 'blue', assigned: 'cyan', quoted: 'gold', approval: 'red', pending: 'orange', approved: 'green', rejected: 'red', calculated: 'blue', sent: 'purple', customer_confirmed: 'green', converted: 'green', confirmed: 'blue', ready_to_ship: 'gold', in_production: 'purple', paid: 'blue', partial: 'orange', overdue: 'red', verified: 'green', draft: 'default', generated: 'blue', completed: 'green', '待人工确认': 'red', '需审批': 'red', '处理中': 'blue', '已完成': 'green', '待建档': 'orange', '待触达': 'blue', '已跟进': 'green',
}

export function formatMoney(value: number, currency = 'USD') {
  return `${currency} ${value.toLocaleString()}`
}


export const salesCashBoard = [
  {
    key: 'inquiry',
    title: '询盘',
    color: '#1677ff',
    summary: '识别需求、补齐报价条件',
    items: [
      { key: 'B001', no: 'INQ-2026-0813-018', customer: 'Nordic Retail Group', amount: '待核价', owner: 'Lina', risk: '缺目的港', next: '确认数量/包装/目的港' },
      { key: 'B002', no: 'INQ-2026-0813-011', customer: 'Andes Supply Co.', amount: '待核价', owner: 'Marco', risk: '需翻译确认', next: '生成回复草稿' },
    ],
  },
  {
    key: 'quotation',
    title: '报价',
    color: '#faad14',
    summary: '成本核算、毛利审批、人工锁价',
    items: [
      { key: 'B003', no: 'QT-2026-0813-006', customer: 'Pacific Buildmart', amount: 'USD 42,800', owner: 'Marco', risk: '毛利偏低', next: '提交主管审批' },
      { key: 'B004', no: 'QT-2026-0813-004', customer: 'Nordic Retail Group', amount: 'USD 28,600', owner: 'Lina', risk: '待锁价', next: '人工确认价格' },
    ],
  },
  {
    key: 'order',
    title: '订单',
    color: '#722ed1',
    summary: '定金、生产、单证、交期',
    items: [
      { key: 'B005', no: 'SO-2026-0809-003', customer: 'Atlas Import LLC', amount: 'USD 86,400', owner: 'Lina', risk: '待收定金', next: '财务确认到账' },
      { key: 'B006', no: 'SO-2026-0804-009', customer: 'EuroNova GmbH', amount: 'USD 142,000', owner: 'Anna', risk: '待发货', next: '补齐 CI / PL' },
    ],
  },
  {
    key: 'payment',
    title: '回款',
    color: '#52c41a',
    summary: '水单、核销、逾期催收',
    items: [
      { key: 'B007', no: 'PAY-2026-0801-014', customer: 'EuroNova GmbH', amount: 'USD 18,200', owner: 'Finance', risk: '尾款逾期', next: '催收尾款水单' },
      { key: 'B008', no: 'PAY-2026-0810-003', customer: 'Atlas Import LLC', amount: 'USD 25,920', owner: 'Finance', risk: '待核销', next: '核对银行到账' },
    ],
  },
]



export const customerContacts = [
  { key: 'CT001', customerKey: 'C001', name: 'Emily Carter', role: 'Purchasing Manager', email: 'emily.carter@atlas.example', phone: '+1 312 555 0188', whatsapp: '+1 312 555 0188', preference: '邮件 + WhatsApp', decision: '核心决策人' },
  { key: 'CT002', customerKey: 'C001', name: 'James Miller', role: 'Logistics Coordinator', email: 'james.miller@atlas.example', phone: '+1 312 555 0120', whatsapp: '+1 312 555 0120', preference: '邮件', decision: '物流确认' },
  { key: 'CT003', customerKey: 'C002', name: 'Oliver Smith', role: 'Sourcing Lead', email: 'oliver@buildmart.example', phone: '+61 2 5550 1212', whatsapp: '+61 455 000 212', preference: 'WhatsApp', decision: '询价负责人' },
  { key: 'CT004', customerKey: 'C003', name: 'Klara Weiss', role: 'Finance Controller', email: 'finance@euronova.example', phone: '+49 30 5550 1188', whatsapp: '+49 170 000 1188', preference: '邮件', decision: '付款确认' },
]

export const customerFollowUps = [
  { key: 'FU001', customerKey: 'C001', time: '2026-08-13 16:40', type: 'WhatsApp', owner: 'Lina', content: '客户确认 40HQ 排期，希望 9 月第一周前完成装柜。', next: '向生产确认最晚交货日期', sentiment: '积极' },
  { key: 'FU002', customerKey: 'C001', time: '2026-08-12 10:20', type: 'Email', owner: 'Lina', content: '发送 PI 草稿并补充付款条款。', next: '等待财务确认定金到账', sentiment: '中性' },
  { key: 'FU003', customerKey: 'C002', time: '2026-08-13 11:30', type: 'Call', owner: 'Marco', content: '客户反馈 DDP 总价高，要求拆分海运费与本地派送费。', next: '复核 DDP 报价毛利并提交审批', sentiment: '价格敏感' },
  { key: 'FU004', customerKey: 'C003', time: '2026-08-11 09:05', type: 'Email', owner: 'Anna', content: '已催收尾款水单，客户财务承诺本周内处理。', next: '财务跟进到账截图', sentiment: '需催促' },
]

export const inquiryRequirements = [
  { key: 'RQ001', inquiryKey: 'I001', field: '产品型号', value: 'PLA / PETG Filament', status: 'completed', source: 'AI 已识别' },
  { key: 'RQ002', inquiryKey: 'I001', field: '数量', value: '待确认', status: 'missing', source: '原文缺失' },
  { key: 'RQ003', inquiryKey: 'I001', field: '目的港', value: 'Hamburg / 待客户确认', status: 'risk', source: 'AI 推断' },
  { key: 'RQ004', inquiryKey: 'I001', field: '包装方式', value: 'Neutral box / OEM 待确认', status: 'missing', source: '需业务员追问' },
  { key: 'RQ005', inquiryKey: 'I002', field: '产品型号', value: 'ABS Filament', status: 'completed', source: 'AI 已识别' },
  { key: 'RQ006', inquiryKey: 'I002', field: '数量', value: '800 kg', status: 'completed', source: '客户原文' },
  { key: 'RQ007', inquiryKey: 'I002', field: '目的港', value: 'Valparaiso', status: 'completed', source: '客户原文' },
]

export const inquiryMessages = [
  { key: 'IM001', inquiryKey: 'I001', sender: 'customer', time: '2026-08-13 09:12', channel: 'Alibaba', content: 'Hello, we are looking for PLA and PETG filament for Germany market. Please send best price and lead time.' },
  { key: 'IM002', inquiryKey: 'I001', sender: 'ai', time: '2026-08-13 09:13', channel: 'AI', content: '识别为高意向批发询盘，但缺少数量、包装、目的港和付款条款。建议先追问关键报价条件。' },
  { key: 'IM003', inquiryKey: 'I002', sender: 'customer', time: '2026-08-13 10:44', channel: 'Website', content: 'Need 800kg ABS filament to Chile, Valparaiso port. Please quote CIF and production time.' },
]

export const quotationLineItems = [
  { key: 'QL001', quoteKey: 'Q001', product: 'PLA Filament 1.75mm', spec: '1kg/spool, neutral box', qty: 3200, unit: 'kg', cost: 5.18, price: 6.05, freight: 0.42, fee: 0.16, locked: true, profitRate: 14.4 },
  { key: 'QL002', quoteKey: 'Q001', product: 'PETG Filament 1.75mm', spec: '1kg/spool, neutral box', qty: 1800, unit: 'kg', cost: 6.08, price: 7.28, freight: 0.48, fee: 0.18, locked: false, profitRate: 15.2 },
  { key: 'QL003', quoteKey: 'Q002', product: 'PLA Matte Filament', spec: '12 colors mixed', qty: 2400, unit: 'kg', cost: 5.25, price: 7.2, freight: 0.36, fee: 0.15, locked: false, profitRate: 24.2 },
  { key: 'QL004', quoteKey: 'Q003', product: 'PLA Filament 1.75mm', spec: 'OEM color box', qty: 8000, unit: 'kg', cost: 5.12, price: 6.95, freight: 0.31, fee: 0.14, locked: true, profitRate: 22.8 },
]

export const quotationCostItems = [
  { key: 'QC001', quoteKey: 'Q001', name: '产品成本', amount: 27600, note: '按最近供应价 + 安全库存成本' },
  { key: 'QC002', quoteKey: 'Q001', name: '国际运费', amount: 4200, note: 'DDP 分摊，需二次确认' },
  { key: 'QC003', quoteKey: 'Q001', name: '平台/银行手续费', amount: 860, note: '按 2.0% 估算' },
  { key: 'QC004', quoteKey: 'Q001', name: '包装与贴标', amount: 1380, note: '客户要求中性包装' },
  { key: 'QC005', quoteKey: 'Q002', name: '产品成本', amount: 18100, note: '常规产品成本' },
  { key: 'QC006', quoteKey: 'Q002', name: '国际运费', amount: 2300, note: 'CIF Hamburg 预估' },
]

export const orderMilestones = [
  { key: 'OM001', orderKey: 'O001', title: '订单确认', date: '2026-08-09', status: 'completed', owner: 'Lina', note: '报价转订单，PI 已生成' },
  { key: 'OM002', orderKey: 'O001', title: '定金核销', date: '2026-08-15', status: 'completed', owner: 'Finance', note: '定金 USD 25,920 已到账' },
  { key: 'OM003', orderKey: 'O001', title: '生产排期', date: '2026-08-18', status: 'processing', owner: '跟单', note: '等待 40HQ 排产确认' },
  { key: 'OM004', orderKey: 'O001', title: '单证准备', date: '2026-08-28', status: 'pending', owner: 'Lina', note: 'CI / PL / BL 草稿待生成' },
  { key: 'OM005', orderKey: 'O002', title: '订单确认', date: '2026-08-04', status: 'completed', owner: 'Anna', note: '客户已确认生产' },
  { key: 'OM006', orderKey: 'O002', title: '尾款核销', date: '2026-08-01', status: 'risk', owner: 'Finance', note: '尾款逾期，发货前必须核销' },
]

export const orderProducts = [
  { key: 'OP001', orderKey: 'O001', sku: 'PLA-175-NW', product: 'PLA Filament 1.75mm', qty: 7200, shipped: 0, unit: 'kg', status: '生产中' },
  { key: 'OP002', orderKey: 'O001', sku: 'PETG-175-NW', product: 'PETG Filament 1.75mm', qty: 4200, shipped: 0, unit: 'kg', status: '待排产' },
  { key: 'OP003', orderKey: 'O002', sku: 'PLA-OEM-EU', product: 'PLA OEM Box', qty: 15000, shipped: 0, unit: 'kg', status: '待发货' },
]

export const paymentVerificationChecklist = [
  { key: 'PV001', label: '银行到账金额与订单收款计划一致', required: true },
  { key: 'PV002', label: '付款主体与客户/合同主体一致', required: true },
  { key: 'PV003', label: '汇率差、手续费和短付金额已记录', required: true },
  { key: 'PV004', label: '水单、银行流水或平台截图已归档', required: true },
  { key: 'PV005', label: '异常付款已提交财务主管复核', required: false },
]

export const paymentReceipts = [
  { key: 'PR001', paymentKey: 'P001', file: 'EuroNova_balance_remittance.pdf', amount: 'USD 18,200', uploadedAt: '待上传', status: 'missing' },
  { key: 'PR002', paymentKey: 'P002', file: 'Atlas_deposit_bank_slip.pdf', amount: 'USD 25,920', uploadedAt: '2026-08-10 15:20', status: 'verified' },
  { key: 'PR003', paymentKey: 'P003', file: 'Andes_partial_receipt.png', amount: 'USD 5,000', uploadedAt: '2026-08-11 17:05', status: 'pending' },
]
export const salesCashMilestones = [
  { key: 'M001', title: '询盘进入', desc: 'AI 识别产品、数量、语言、意向与缺失字段', owner: '销售' },
  { key: 'M002', title: '报价核算', desc: '成本、费用、运费、汇率、毛利底线全部可见', owner: '销售' },
  { key: 'M003', title: '审批锁价', desc: '低毛利和异常账期必须审批，报价明细必须人工锁价', owner: '销售主管' },
  { key: 'M004', title: '客户确认', desc: '确认价格、数量、交期、付款条款后才能转订单', owner: '销售' },
  { key: 'M005', title: '订单履约', desc: '定金、生产、单证、发货节点串联', owner: '销售/跟单' },
  { key: 'M006', title: '回款核销', desc: '水单上传不等于核销，财务到账确认后才完结', owner: '财务' },
]

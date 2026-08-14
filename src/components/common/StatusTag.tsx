'use client'

import { Tag } from 'antd'
import { statusColor } from '@/frontend/mockData'

const labelMap: Record<string, string> = {
  new: '新询盘',
  assigned: '已分配',
  quoted: '已报价',
  approval: '待审批',
  pending: '待处理',
  approved: '已通过',
  rejected: '已拒绝',
  calculated: '已核价',
  sent: '已发送',
  customer_confirmed: '客户确认',
  converted: '已转订单',
  confirmed: '已确认',
  ready_to_ship: '待发货',
  in_production: '生产中',
  paid: '已付款',
  partial: '部分付款',
  overdue: '逾期',
  verified: '已核销',
  draft: '草稿',
  generated: '已生成',
  completed: '已完成',
  missing: '缺失',
  risk: '有风险',
  processing: '处理中',
  not_required: '无需审批',
}

export function StatusTag({ value }: { value: string }) {
  return <Tag color={statusColor[value] || 'default'}>{labelMap[value] || value}</Tag>
}

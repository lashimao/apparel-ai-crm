'use client'

import { Alert, Button, Card, Col, Row, Space, Table, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { AuditOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons'
import Link from 'next/link'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusTag } from '@/components/common/StatusTag'
import { approvals } from '@/frontend/mockData'

const { Text } = Typography

const columns: ColumnsType<(typeof approvals)[number]> = [
  { title: '审批类型', dataIndex: 'type', render: (value, record) => <Space orientation="vertical" size={0}><Link href={`/approvals/${record.key}`}><Text strong>{value}</Text></Link><Text type="secondary">{record.refNo}</Text></Space> },
  { title: '客户', dataIndex: 'customer' },
  { title: '申请人', dataIndex: 'requester' },
  { title: '金额', dataIndex: 'amount' },
  { title: '原因', dataIndex: 'reason' },
  { title: '状态', dataIndex: 'status', render: (status) => <StatusTag value={status} /> },
  { title: '优先级', dataIndex: 'priority', render: (value) => <Tag color={value === 'high' ? 'red' : 'blue'}>{value === 'high' ? '高' : '普通'}</Tag> },
  { title: '动作', render: (_, record) => <Space><Link href={`/approvals/${record.key}`}><Button size="small">查看</Button></Link><Button size="small" icon={<CheckOutlined />} type="primary">通过</Button><Button size="small" danger icon={<CloseOutlined />}>拒绝</Button></Space> },
]

export default function ApprovalsPage() {
  return <AppShell><Space orientation="vertical" size={20} style={{ width: '100%' }}><PageHeader title="审批中心" subtitle="低毛利报价、异常账期、特殊折扣和交付例外审批" actions={<Button type="primary" icon={<AuditOutlined />}>审批规则</Button>} /><Alert showIcon type="warning" title="审批通过只代表允许进入下一步，仍需业务员人工发送报价或确认订单。" /><Row gutter={[16, 16]}><Col xs={24} xl={17}><Card variant="borderless" title="待审批事项"><Table columns={columns} dataSource={approvals} scroll={{ x: 1100 }} /></Card></Col><Col xs={24} xl={7}><Card variant="borderless" title="审批原则"><Space orientation="vertical" size={12}><div className="crm-card-soft"><Text strong>低毛利</Text><br /><Text type="secondary">低于底线必须说明原因，并记录审批人。</Text></div><div className="crm-card-soft"><Text strong>异常账期</Text><br /><Text type="secondary">影响现金流的账期调整必须管理层确认。</Text></div><div className="crm-card-soft"><Text strong>全程审计</Text><br /><Text type="secondary">提交、通过、拒绝和撤回均要写入操作日志。</Text></div></Space></Card></Col></Row></Space></AppShell>
}

'use client'

import { Alert, Button, Card, Col, Progress, Row, Space, Steps, Table, Tag, Typography } from 'antd'
import Link from 'next/link'
import type { ColumnsType } from 'antd/es/table'
import { CalculatorOutlined, DollarOutlined, FileProtectOutlined } from '@ant-design/icons'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusTag } from '@/components/common/StatusTag'
import { formatMoney, quotations } from '@/frontend/mockData'

const { Text } = Typography

const columns: ColumnsType<(typeof quotations)[number]> = [
  { title: '报价号', dataIndex: 'quoteNo', render: (value, record) => <Space direction="vertical" size={0}><Link href={`/quotations/${record.key}`}><Text strong>{value}</Text></Link><Text type="secondary">{record.customer}</Text></Space> },
  { title: '金额', render: (_, record) => formatMoney(record.amount, record.currency) },
  { title: '毛利率', dataIndex: 'profitRate', render: (rate, record) => <Space direction="vertical" size={0}><Progress percent={rate} size="small" strokeColor={rate < record.minProfitRate ? '#ff4d4f' : '#52c41a'} /><Text type="secondary">底线 {record.minProfitRate}%</Text></Space> },
  { title: '状态', dataIndex: 'status', render: (status) => <StatusTag value={status} /> },
  { title: '审批', dataIndex: 'approvalStatus', render: (status) => <StatusTag value={status} /> },
  { title: '有效期', dataIndex: 'validUntil' },
  { title: '风险', dataIndex: 'risk', render: (risk) => <Tag color={risk.includes('低') ? 'red' : 'gold'}>{risk}</Tag> },
  { title: '动作', render: () => <Space><Button size="small">核价</Button><Button size="small" type="primary">提交审批</Button></Space> },
]

export default function QuotationsPage() {
  return (
    <AppShell>
      <Space direction="vertical" size={20} style={{ width: '100%' }}>
        <PageHeader title="报价中心" subtitle="成本核算、毛利底线、AI 建议、人工锁价、审批和发送管控" actions={<Space><Button icon={<CalculatorOutlined />}>报价模拟器</Button><Link href="/quotations/new"><Button type="primary" icon={<DollarOutlined />}>新建报价</Button></Link></Space>} />
        <Alert showIcon type="warning" message="低毛利、异常账期、大额折扣必须进入审批；AI 只能提供建议价，不能设置正式价格。" />
        <Row gutter={[16, 16]}><Col xs={24} xl={17}><Card bordered={false} title="报价列表"><Table columns={columns} dataSource={quotations} scroll={{ x: 1100 }} /></Card></Col><Col xs={24} xl={7}><Card bordered={false} title="报价状态机"><Steps direction="vertical" current={3} items={[{ title: '草稿' }, { title: '成本核算' }, { title: '系统核价' }, { title: '审批/锁价' }, { title: '发送客户' }, { title: '客户确认' }, { title: '转订单' }]} /></Card><Card bordered={false} style={{ marginTop: 16 }} title={<Space><FileProtectOutlined /> 发送硬规则</Space>}><Text>所有明细必须人工锁价；低于毛利底线必须审批通过；过期报价必须重新核价。</Text></Card></Col></Row>
      </Space>
    </AppShell>
  )
}

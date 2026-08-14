'use client'

import { Alert, Button, Card, Col, Descriptions, Form, InputNumber, Row, Space, Steps, Table, Tag, Typography } from 'antd'
import { ArrowLeftOutlined, CalculatorOutlined, SendOutlined } from '@ant-design/icons'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusTag } from '@/components/common/StatusTag'
import { quotations } from '@/frontend/mockData'

const { Text } = Typography

export default function QuotationDetailPage() {
  const params = useParams<{ id: string }>()
  const quote = quotations.find((item) => item.key === params.id) || quotations[0]
  const items = [
    { key: '1', product: 'PLA Filament', qty: 1000, cost: 5.2, price: 6.2, locked: true, profit: 9.68 },
    { key: '2', product: 'PETG Filament', qty: 500, cost: 6.1, price: 8.33, locked: false, profit: 21.97 },
  ]
  return <AppShell><Space direction="vertical" size={20} style={{ width: '100%' }}><PageHeader title={quote.quoteNo} subtitle="报价编辑、成本核算、毛利审批、人工锁价和发送前校验" actions={<Space><Link href="/quotations"><Button icon={<ArrowLeftOutlined />}>返回报价</Button></Link><Link href={`/quotations/${quote.key}/edit`}><Button icon={<CalculatorOutlined />}>编辑报价</Button></Link><Button type="primary" icon={<SendOutlined />}>发送前校验</Button></Space>} /><Alert showIcon type="warning" message="此页面为前端框架预览：正式发送前必须满足人工锁价、毛利审批、有效期三项硬规则。" /><Row gutter={[16, 16]}><Col xs={24} xl={16}><Card bordered={false} title="报价摘要"><Descriptions bordered size="small" column={2} items={[{ key: 'customer', label: '客户', children: quote.customer }, { key: 'amount', label: '金额', children: `${quote.currency} ${quote.amount.toLocaleString()}` }, { key: 'profit', label: '毛利率', children: <Tag color={quote.profitRate < quote.minProfitRate ? 'red' : 'green'}>{quote.profitRate}%</Tag> }, { key: 'status', label: '状态', children: <StatusTag value={quote.status} /> }, { key: 'approval', label: '审批', children: <StatusTag value={quote.approvalStatus} /> }, { key: 'valid', label: '有效期', children: quote.validUntil }]} /></Card><Card bordered={false} title="报价明细" style={{ marginTop: 16 }}><Table pagination={false} dataSource={items} columns={[{ title: '产品', dataIndex: 'product' }, { title: '数量', dataIndex: 'qty' }, { title: '成本', dataIndex: 'cost' }, { title: '报价', dataIndex: 'price', render: (value) => <InputNumber defaultValue={value} prefix="$" /> }, { title: '毛利率', dataIndex: 'profit', render: (value) => <Tag color={value < quote.minProfitRate ? 'red' : 'green'}>{value}%</Tag> }, { title: '锁价', dataIndex: 'locked', render: (value) => <Tag color={value ? 'green' : 'orange'}>{value ? '已锁价' : '待锁价'}</Tag> }]} /></Card></Col><Col xs={24} xl={8}><Card bordered={false} title="状态机"><Steps direction="vertical" current={quote.status === 'approval' ? 3 : 2} items={[{ title: '草稿' }, { title: '成本核算' }, { title: '系统核价' }, { title: '审批/锁价' }, { title: '发送客户' }, { title: '客户确认' }, { title: '转订单' }]} /></Card><Card bordered={false} title="费用与条款" style={{ marginTop: 16 }}><Form layout="vertical"><Form.Item label="贸易条款"><InputNumber style={{ width: '100%' }} placeholder="FOB/CIF/DDP 占位" /></Form.Item><Form.Item label="目标毛利率"><InputNumber defaultValue={22} suffix="%" style={{ width: '100%' }} /></Form.Item><Form.Item label="毛利底线"><InputNumber defaultValue={18} suffix="%" style={{ width: '100%' }} /></Form.Item></Form></Card></Col></Row></Space></AppShell>
}

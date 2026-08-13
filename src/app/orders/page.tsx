'use client'

import { Button, Card, Col, Progress, Row, Space, Steps, Table, Tag, Typography } from 'antd'
import Link from 'next/link'
import type { ColumnsType } from 'antd/es/table'
import { ShoppingCartOutlined } from '@ant-design/icons'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusTag } from '@/components/common/StatusTag'
import { orders } from '@/frontend/mockData'

const { Text } = Typography

const columns: ColumnsType<(typeof orders)[number]> = [
  { title: '订单号', dataIndex: 'orderNo', render: (value, record) => <Space direction="vertical" size={0}><Link href={`/orders/${record.key}`}><Text strong>{value}</Text></Link><Text type="secondary">{record.customer}</Text></Space> },
  { title: '金额', dataIndex: 'amount' },
  { title: '状态', dataIndex: 'status', render: (status) => <StatusTag value={status} /> },
  { title: '进度', dataIndex: 'progress', render: (value) => <Progress percent={value} size="small" /> },
  { title: '交期', dataIndex: 'deliveryDate' },
  { title: '负责人', dataIndex: 'owner' },
  { title: '风险', dataIndex: 'risk', render: (risk) => <Tag color={risk === '正常' ? 'green' : 'orange'}>{risk}</Tag> },
  { title: '动作', render: () => <Space><Button size="small">生产跟进</Button><Button size="small">生成单证</Button></Space> },
]

export default function OrdersPage() {
  return <AppShell><Space direction="vertical" size={20} style={{ width: '100%' }}><PageHeader title="订单中心" subtitle="报价转订单、定金、生产、质检、发货和完结状态追踪" actions={<Button type="primary" icon={<ShoppingCartOutlined />}>新建订单</Button>} /><Row gutter={[16, 16]}><Col xs={24} xl={17}><Card bordered={false} title="订单列表"><Table columns={columns} dataSource={orders} scroll={{ x: 1100 }} /></Card></Col><Col xs={24} xl={7}><Card bordered={false} title="订单履约流程"><Steps direction="vertical" current={2} items={[{ title: '待确认' }, { title: '已确认' }, { title: '定金已收' }, { title: '生产中' }, { title: '待发货' }, { title: '已发货' }, { title: '已完成' }]} /></Card></Col></Row></Space></AppShell>
}

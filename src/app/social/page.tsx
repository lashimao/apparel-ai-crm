'use client'

import { Alert, Button, Card, Col, Progress, Row, Space, Table, Tag, Typography } from 'antd'
import Link from 'next/link'
import type { ColumnsType } from 'antd/es/table'
import { ShareAltOutlined } from '@ant-design/icons'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/common/PageHeader'
import { socialLeads } from '@/frontend/mockData'

const { Text } = Typography

const columns: ColumnsType<(typeof socialLeads)[number]> = [
  { title: '线索', dataIndex: 'name', render: (value, record) => <Space direction="vertical" size={0}><Link href={`/social/${record.key}`}><Text strong>{value}</Text></Link><Text type="secondary">{record.company}</Text></Space> },
  { title: '平台', dataIndex: 'platform', render: (platform) => <Tag color="blue">{platform}</Tag> },
  { title: '国家', dataIndex: 'country' },
  { title: '意向分', dataIndex: 'intent', render: (score) => <Progress percent={score} size="small" /> },
  { title: '状态', dataIndex: 'status', render: (status) => <Tag color={status === '待建档' ? 'orange' : status === '待触达' ? 'blue' : 'green'}>{status}</Tag> },
  { title: '负责人', dataIndex: 'owner' },
  { title: '动作', render: () => <Space><Button size="small">建客户</Button><Button size="small" type="primary">生成私信</Button></Space> },
]

export default function SocialPage() {
  return <AppShell><Space direction="vertical" size={20} style={{ width: '100%' }}><PageHeader title="社媒获客" subtitle="LinkedIn、Facebook、YouTube 等公开线索沉淀、评分、触达和转客户" actions={<Button type="primary" icon={<ShareAltOutlined />}>导入线索</Button>} /><Alert showIcon type="warning" message="社媒集成优先使用官方 API；AI 只生成触达建议，不承诺成交结果，不自动群发。" /><Row gutter={[16, 16]}><Col xs={24} xl={17}><Card bordered={false} title="社媒线索池"><Table columns={columns} dataSource={socialLeads} scroll={{ x: 1000 }} /></Card></Col><Col xs={24} xl={7}><Card bordered={false} title="渠道漏斗"><Space direction="vertical" style={{ width: '100%' }}><Text>浏览/互动</Text><Progress percent={100} /><Text>有效线索</Text><Progress percent={42} /><Text>已触达</Text><Progress percent={28} /><Text>转询盘</Text><Progress percent={11} /></Space></Card></Col></Row></Space></AppShell>
}

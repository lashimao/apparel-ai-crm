'use client'

import { Alert, Button, Card, Col, Progress, Row, Space, Table, Tag, Typography } from 'antd'
import Link from 'next/link'
import type { ColumnsType } from 'antd/es/table'
import { MailOutlined, RobotOutlined, SendOutlined } from '@ant-design/icons'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/common/PageHeader'
import { inquiries } from '@/frontend/mockData'

const { Paragraph, Text } = Typography

const columns: ColumnsType<(typeof inquiries)[number]> = [
  { title: '询盘号', dataIndex: 'inquiryNo', render: (value, record) => <Space direction="vertical" size={0}><Link href={`/inquiries/${record.key}`}><Text strong>{value}</Text></Link><Text type="secondary">{record.receivedAt} · {record.product}</Text></Space> },
  { title: '客户', dataIndex: 'customer' },
  { title: '国家/来源', render: (_, record) => <>{record.country}<br /><Text type="secondary">{record.source}</Text></> },
  { title: '优先级', dataIndex: 'priority', render: (priority) => <Tag color={priority === 'urgent' ? 'red' : priority === 'high' ? 'orange' : 'blue'}>{priority}</Tag> },
  { title: 'AI 成交评分', dataIndex: 'aiScore', render: (score) => <Progress percent={score} size="small" /> },
  { title: '负责人', dataIndex: 'owner' },
  { title: '动作', render: () => <Space><Button size="small">分配</Button><Button size="small" type="primary" icon={<RobotOutlined />}>回复草稿</Button></Space> },
]

export default function InquiriesPage() {
  return (
    <AppShell>
      <Space direction="vertical" size={20} style={{ width: '100%' }}>
        <PageHeader title="询盘中心" subtitle="邮件、网站、WhatsApp、B2B 平台询盘统一接入、翻译、评分和分配" actions={<Space><Button icon={<MailOutlined />}>同步渠道</Button><Button type="primary" icon={<SendOutlined />}>批量分配</Button></Space>} />
        <Alert showIcon type="info" message="AI 可生成回复草稿、识别产品与数量、提示风险；所有对外回复必须由业务员确认后发送。" />
        <Row gutter={[16, 16]}><Col xs={24} xl={16}><Card bordered={false} title="询盘收件箱"><Table columns={columns} dataSource={inquiries} scroll={{ x: 1000 }} /></Card></Col><Col xs={24} xl={8}><Card bordered={false} title="AI 回复草稿预览"><Space direction="vertical" size={12}><Tag color="red">待人工确认</Tag><Paragraph>Dear customer, thanks for your inquiry about PLA / PETG filament. We can offer FOB and CIF options. Please confirm quantity, color mix, packaging and destination port.</Paragraph><div className="crm-card-soft"><Text strong>系统提示</Text><br /><Text type="secondary">缺少目标港口、付款条款和包装要求，报价前需补齐。</Text></div><Button type="primary" block>确认后发送</Button></Space></Card></Col></Row>
      </Space>
    </AppShell>
  )
}

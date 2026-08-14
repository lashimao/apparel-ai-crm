'use client'

import { Alert, Button, Card, Col, Row, Space, Table, Tag, Typography } from 'antd'
import Link from 'next/link'
import type { ColumnsType } from 'antd/es/table'
import { RobotOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusTag } from '@/components/common/StatusTag'
import { aiTasks, riskRules } from '@/frontend/mockData'

const { Text } = Typography

const columns: ColumnsType<(typeof aiTasks)[number]> = [
  { title: '任务', dataIndex: 'title', render: (value, record) => <Space><Button shape="circle" icon={record.icon} /><Space orientation="vertical" size={0}><Link href={`/ai/${record.key}`}><Text strong>{value}</Text></Link><Text type="secondary">{record.desc}</Text></Space></Space> },
  { title: '模块', dataIndex: 'module' },
  { title: '模式', dataIndex: 'mode', render: (mode) => <Tag color={mode === '云端' ? 'blue' : mode === '本地' ? 'green' : 'purple'}>{mode}</Tag> },
  { title: '状态', dataIndex: 'status', render: (status) => <StatusTag value={status} /> },
  { title: '动作', render: () => <Button size="small">查看输出</Button> },
]

export default function AiPage() {
  return <AppShell><Space orientation="vertical" size={20} style={{ width: '100%' }}><PageHeader title="AI 中心" subtitle="AI 任务队列、模型路由、RAG 知识库、人工确认和安全边界" actions={<Space><Button icon={<SafetyCertificateOutlined />}>安全策略</Button><Button type="primary" icon={<RobotOutlined />}>新建 AI 任务</Button></Space>} /><Alert showIcon type="warning" title="AI 不得自动设置正式价格、发送正式报价、确认订单、核销回款或覆盖客户关键资料。" /><Row gutter={[16, 16]}><Col xs={24} xl={16}><Card variant="borderless" title="AI 任务队列"><Table columns={columns} dataSource={aiTasks} scroll={{ x: 1000 }} /></Card></Col><Col xs={24} xl={8}><Card variant="borderless" title="硬边界规则"><Space orientation="vertical" size={12} style={{ width: '100%' }}>{riskRules.map((rule) => <div className="crm-card-soft" key={rule.key}><Text strong>{rule.rule}</Text><br /><Text type="secondary">责任方：{rule.owner} · 动作：{rule.action}</Text></div>)}</Space></Card></Col></Row></Space></AppShell>
}

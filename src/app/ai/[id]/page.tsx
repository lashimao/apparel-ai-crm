'use client'

import { Alert, Button, Card, Col, Descriptions, Row, Space, Steps, Tag, Typography } from 'antd'
import { ArrowLeftOutlined, CheckCircleOutlined, RobotOutlined } from '@ant-design/icons'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusTag } from '@/components/common/StatusTag'
import { aiTasks } from '@/frontend/mockData'

const { Paragraph, Text } = Typography

export default function AiTaskDetailPage() {
  const params = useParams<{ id: string }>()
  const task = aiTasks.find((item) => item.key === params.id) || aiTasks[0]
  return <AppShell><Space direction="vertical" size={20} style={{ width: '100%' }}><PageHeader title={task.title} subtitle="AI 任务详情、输入输出、模型路由、风险提示和人工确认" actions={<Space><Link href="/ai"><Button icon={<ArrowLeftOutlined />}>返回 AI 中心</Button></Link><Button icon={<RobotOutlined />}>重新运行</Button><Button type="primary" icon={<CheckCircleOutlined />}>人工确认</Button></Space>} /><Alert showIcon type="warning" message="AI 输出只能作为草稿/建议/风险提示。正式业务动作必须由人确认。" /><Row gutter={[16, 16]}><Col xs={24} xl={15}><Card bordered={false} title="任务信息"><Descriptions bordered size="small" column={2} items={[{ key: 'module', label: '模块', children: task.module }, { key: 'mode', label: '模式', children: <Tag color={task.mode === '云端' ? 'blue' : task.mode === '本地' ? 'green' : 'purple'}>{task.mode}</Tag> }, { key: 'status', label: '状态', children: <StatusTag value={task.status} /> }, { key: 'desc', label: '说明', children: task.desc }]} /></Card><Card bordered={false} title="AI 输出预览" style={{ marginTop: 16 }}><Paragraph>这里展示 AI 生成的草稿、摘要、报价建议或风险提示。当前内容仅用于前端预览，不能直接发送或改变正式业务状态。</Paragraph><div className="crm-card-soft"><Text strong>风险提示</Text><br /><Text type="secondary">涉及报价、客户资料、付款凭证的输出必须经过人工确认，敏感数据默认不静默发往云端。</Text></div></Card></Col><Col xs={24} xl={9}><Card bordered={false} title="执行流程"><Steps direction="vertical" current={2} items={[{ title: '创建任务' }, { title: '选择模型路由' }, { title: '生成输出' }, { title: '人工确认' }, { title: '写入业务草稿' }]} /></Card></Col></Row></Space></AppShell>
}

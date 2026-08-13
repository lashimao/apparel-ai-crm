'use client'

import { Alert, Button, Card, Col, Descriptions, Progress, Row, Space, Steps, Tag, Timeline, Typography } from 'antd'
import { ArrowLeftOutlined, MessageOutlined, UserAddOutlined } from '@ant-design/icons'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/common/PageHeader'
import { socialLeads } from '@/frontend/mockData'

const { Paragraph, Text } = Typography

export default function SocialLeadDetailPage() {
  const params = useParams<{ id: string }>()
  const lead = socialLeads.find((item) => item.key === params.id) || socialLeads[0]
  return <AppShell><Space direction="vertical" size={20} style={{ width: '100%' }}><PageHeader title={lead.name} subtitle="社媒线索详情、意向评分、触达建议和转客户入口" actions={<Space><Link href="/social"><Button icon={<ArrowLeftOutlined />}>返回线索</Button></Link><Button icon={<MessageOutlined />}>生成私信</Button><Button type="primary" icon={<UserAddOutlined />}>转为客户</Button></Space>} /><Alert showIcon type="info" message="AI 可生成触达建议，但不得自动群发，不得编造案例、收益承诺或虚假稀缺性。" /><Row gutter={[16, 16]}><Col xs={24} xl={15}><Card bordered={false} title="线索档案"><Descriptions bordered size="small" column={2} items={[{ key: 'platform', label: '平台', children: <Tag color="blue">{lead.platform}</Tag> }, { key: 'company', label: '公司', children: lead.company }, { key: 'country', label: '国家', children: lead.country }, { key: 'status', label: '状态', children: lead.status }, { key: 'owner', label: '负责人', children: lead.owner }, { key: 'intent', label: '意向分', children: <Progress percent={lead.intent} /> }]} /></Card><Card bordered={false} title="AI 触达草稿" style={{ marginTop: 16 }}><Paragraph>Hi {lead.name}, I noticed your interest in 3D printing supplies. NexFab provides stable filament supply and export documentation support. If you are evaluating new suppliers, I can share product specs and MOQ options.</Paragraph><Button type="primary">复制草稿</Button></Card></Col><Col xs={24} xl={9}><Card bordered={false} title="转化流程"><Steps direction="vertical" current={1} items={[{ title: '发现线索' }, { title: 'AI 评分' }, { title: '人工触达' }, { title: '转询盘/客户' }, { title: '报价跟进' }]} /></Card><Card bordered={false} title="互动时间线" style={{ marginTop: 16 }}><Timeline items={[{ children: '社媒互动被记录' }, { children: `意向评分 ${lead.intent}` }, { children: '建议人工触达并确认需求' }]} /></Card></Col></Row></Space></AppShell>
}

'use client'

import { Alert, Button, Card, Col, Progress, Row, Segmented, Space, Statistic, Table, Tag, Timeline, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { CheckCircleOutlined, ClockCircleOutlined, DollarOutlined, FundProjectionScreenOutlined, MailOutlined, PlusOutlined, RobotOutlined, SafetyCertificateOutlined, SearchOutlined, SendOutlined, ShoppingCartOutlined, TeamOutlined, ThunderboltOutlined, WarningOutlined } from '@ant-design/icons'
import { AppShell } from '@/components/layout/AppShell'
import { KpiCard } from '@/components/common/KpiCard'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusTag } from '@/components/common/StatusTag'
import { aiTasks, customers, inquiries, kpis, pipeline, roleCards, salesCashTodos } from '@/frontend/mockData'

const { Text, Title } = Typography

const inquiryColumns: ColumnsType<(typeof inquiries)[number]> = [
  { title: '询盘', dataIndex: 'inquiryNo', render: (value, record) => <Space direction="vertical" size={0}><Text strong>{value}</Text><Text type="secondary">{record.customer}</Text></Space> },
  { title: '国家/来源', render: (_, record) => <Space direction="vertical" size={0}><Text>{record.country}</Text><Text type="secondary">{record.source}</Text></Space> },
  { title: '优先级', dataIndex: 'priority', render: (priority) => <Tag color={priority === 'urgent' ? 'red' : priority === 'high' ? 'orange' : 'blue'}>{priority === 'urgent' ? '紧急' : priority === 'high' ? '高' : '普通'}</Tag> },
  { title: 'AI 评分', dataIndex: 'aiScore', render: (score) => <Progress percent={score} size="small" strokeColor="#1677ff" /> },
  { title: '负责人', dataIndex: 'owner' },
  { title: '动作', render: () => <Button size="small" type="primary" icon={<RobotOutlined />}>生成回复</Button> },
]

const customerColumns: ColumnsType<(typeof customers)[number]> = [
  { title: '客户', dataIndex: 'company', render: (value, record) => <Space direction="vertical" size={0}><Text strong>{value}</Text><Text type="secondary">{record.country} · {record.value}</Text></Space> },
  { title: '阶段', dataIndex: 'stage' },
  { title: '下步动作', dataIndex: 'nextAction' },
  { title: '风险', dataIndex: 'risk', render: (value) => <Tag color={value.includes('逾期') || value.includes('低') ? 'red' : 'gold'}>{value}</Tag> },
]

const todoColumns: ColumnsType<(typeof salesCashTodos)[number]> = [
  { title: '节点', dataIndex: 'node', render: (node) => <Tag color={node === 'quote' ? 'blue' : node === 'order' ? 'purple' : 'green'}>{node === 'quote' ? '报价' : node === 'order' ? '订单' : '回款'}</Tag> },
  { title: '单号/客户', render: (_, record) => <Space direction="vertical" size={0}><Text strong>{record.no}</Text><Text type="secondary">{record.customer}</Text></Space> },
  { title: '金额', dataIndex: 'amount' },
  { title: '状态', dataIndex: 'status' },
  { title: '风险', dataIndex: 'risk', render: (risk) => <Tag color={risk.includes('逾期') || risk.includes('低') ? 'red' : 'gold'}>{risk}</Tag> },
  { title: '负责人', dataIndex: 'owner' },
]

export default function DashboardPage() {
  return (
    <AppShell>
      <Space direction="vertical" size={20} style={{ width: '100%' }}>
        <PageHeader
          title="外贸 AI CRM 工作台"
          subtitle="客户开发、询盘跟进、报价审批、订单交付、回款核销和 AI 任务统一入口"
          actions={<Space wrap><Segmented defaultValue="today" options={[{ label: '今日', value: 'today' }, { label: '本周', value: 'week' }, { label: '本月', value: 'month' }]} /><Button icon={<SearchOutlined />}>查重</Button><Button type="primary" icon={<PlusOutlined />}>新建询盘</Button></Space>}
        />

        <Alert showIcon type="warning" icon={<WarningOutlined />} message="有 2 份报价触发毛利底线提醒，AI 建议只能作为草稿，发送前必须人工确认。" action={<Button size="small">查看报价</Button>} />

        <Row gutter={[16, 16]}>{kpis.map((item) => <Col xs={24} sm={12} xl={6} key={item.title}><KpiCard {...item} prefix={item.title.includes('客户') ? <TeamOutlined /> : item.title.includes('询盘') ? <MailOutlined /> : item.title.includes('订单') ? <ShoppingCartOutlined /> : <DollarOutlined />} /></Col>)}</Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} xl={15}>
            <Card bordered={false} title={<Space><FundProjectionScreenOutlined /> 询盘转化漏斗</Space>} extra={<Button type="link">进入分析</Button>}>
              <Row gutter={[16, 16]}>{pipeline.map((step) => <Col xs={12} md={6} key={step.label}><div className="crm-card-soft"><Text type="secondary">{step.label}</Text><Title level={3} style={{ color: step.color, margin: '6px 0' }}>{step.value}</Title><Progress percent={Math.round((step.value / pipeline[0].value) * 100)} strokeColor={step.color} showInfo={false} /></div></Col>)}</Row>
            </Card>
          </Col>
          <Col xs={24} xl={9}>
            <Card bordered={false} title={<Space><SafetyCertificateOutlined /> 系统状态</Space>}>
              <Timeline items={[{ dot: <CheckCircleOutlined style={{ color: '#52c41a' }} />, children: '前端框架：角色导航与核心模块已搭建' }, { dot: <CheckCircleOutlined style={{ color: '#52c41a' }} />, children: 'AI 输出统一标记为草稿/建议/风险提示' }, { dot: <ClockCircleOutlined style={{ color: '#faad14' }} />, children: '后端落库接口后续再接入真实数据' }, { dot: <WarningOutlined style={{ color: '#ff4d4f' }} />, children: '正式报价、审批、发送和核销必须人工确认' }]} />
            </Card>
          </Col>
        </Row>

        <Card bordered={false} title={<Space><DollarOutlined /> 报价 → 订单 → 回款闭环待办</Space>} extra={<Button type="link">进入销售到回款看板</Button>}>
          <Alert style={{ marginBottom: 16 }} type="warning" showIcon message="正式价格、低毛利审批、报价发送和回款核销均不得由 AI 自动生效，必须进入人工确认/审批链。" />
          <Table columns={todoColumns} dataSource={salesCashTodos} pagination={false} scroll={{ x: 900 }} />
        </Card>

        <Row gutter={[16, 16]}>
          <Col xs={24} xl={15}><Card bordered={false} title={<Space><MailOutlined /> 今日重点询盘</Space>} extra={<Button icon={<SendOutlined />}>批量分配</Button>}><Table columns={inquiryColumns} dataSource={inquiries} pagination={false} scroll={{ x: 900 }} /></Card></Col>
          <Col xs={24} xl={9}><Card bordered={false} title={<Space><RobotOutlined /> AI 审核队列</Space>}><Space direction="vertical" size={12} style={{ width: '100%' }}>{aiTasks.map((task) => <div key={task.key} className="crm-card-soft"><Space align="start"><Button shape="circle" icon={task.icon} /><Space direction="vertical" size={0} style={{ flex: 1 }}><Text strong>{task.title}</Text><Text type="secondary">{task.desc}</Text></Space><StatusTag value={task.status} /></Space></div>)}</Space></Card></Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} xl={15}><Card bordered={false} title={<Space><TeamOutlined /> 关键客户提醒</Space>}><Table columns={customerColumns} dataSource={customers} pagination={false} scroll={{ x: 900 }} /></Card></Col>
          <Col xs={24} xl={9}><Card bordered={false} title={<Space><ThunderboltOutlined /> 角色工作台</Space>}><Space direction="vertical" size={12} style={{ width: '100%' }}>{roleCards.map((role) => <div key={role.role} className="crm-card-soft"><Text strong>{role.role}</Text><br /><Text type="secondary">{role.focus}</Text><div style={{ marginTop: 8 }}>{role.todos.map((todo) => <Tag key={todo}>{todo}</Tag>)}</div></div>)}</Space></Card></Col>
        </Row>
      </Space>
    </AppShell>
  )
}

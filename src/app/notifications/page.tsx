'use client'

import { Button, Card, Col, Row, Segmented, Space, Statistic, Tag, Typography } from 'antd'
import { BellOutlined, CheckCircleOutlined, ClockCircleOutlined, WarningOutlined } from '@ant-design/icons'
import Link from 'next/link'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusTag } from '@/components/common/StatusTag'
import { notificationItems } from '@/frontend/mockData'

const { Text, Paragraph } = Typography

const iconByLevel = {
  high: <WarningOutlined style={{ color: '#cf1322' }} />,
  normal: <ClockCircleOutlined style={{ color: '#d46b08' }} />,
  low: <CheckCircleOutlined style={{ color: '#0f6e56' }} />,
}

export default function NotificationsPage() {
  const high = notificationItems.filter((item) => item.level === 'high').length
  const overdue = notificationItems.filter((item) => item.status === 'overdue').length

  return (
    <AppShell>
      <Space orientation="vertical" size={20} style={{ width: '100%' }}>
        <PageHeader
          title="通知中心"
          subtitle="审批、回款、订单阻断、AI 待确认和单证校验的统一入口"
          actions={<Space><Segmented defaultValue="all" options={[{ label: '全部', value: 'all' }, { label: '高优先级', value: 'high' }, { label: '我负责', value: 'mine' }]} /><Button type="primary" icon={<BellOutlined />}>全部标为已读</Button></Space>}
        />

        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}><Card variant="borderless"><Statistic title="待处理通知" value={notificationItems.length} suffix="条" /></Card></Col>
          <Col xs={24} md={8}><Card variant="borderless"><Statistic title="高优先级" value={high} suffix="条" styles={{ content: { color: '#cf1322' } }} /></Card></Col>
          <Col xs={24} md={8}><Card variant="borderless"><Statistic title="逾期/阻断" value={overdue} suffix="条" styles={{ content: { color: '#d46b08' } }} /></Card></Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} xl={16}>
            <Card variant="borderless" title="通知列表">
              <Space orientation="vertical" size={12} style={{ width: '100%' }}>
                {notificationItems.map((item) => (
                  <div className="crm-action-row" key={item.key}>
                    <Space align="start" style={{ width: '100%', justifyContent: 'space-between' }}>
                      <Space align="start">
                        {iconByLevel[item.level as keyof typeof iconByLevel] || iconByLevel.normal}
                        <div>
                          <Space wrap><Text strong>{item.title}</Text><StatusTag value={item.status} /><Tag color={item.level === 'high' ? 'red' : 'blue'}>{item.owner}</Tag></Space><br />
                          <Text type="secondary">{item.refNo} · {item.customer} · 截止：{item.due}</Text>
                        </div>
                      </Space>
                      <Link href={item.href}><Button size="small">去处理</Button></Link>
                    </Space>
                  </div>
                ))}
              </Space>
            </Card>
          </Col>

          <Col xs={24} xl={8}>
            <Card variant="borderless" title="通知规则">
              <Space orientation="vertical" size={12}>
                <div className="crm-card-soft"><Text strong>高优先级</Text><Paragraph type="secondary" style={{ marginBottom: 0 }}>低毛利审批、回款逾期、发货阻断默认置顶。</Paragraph></div>
                <div className="crm-card-soft"><Text strong>AI 待确认</Text><Paragraph type="secondary" style={{ marginBottom: 0 }}>AI 草稿、建议价、单证 OCR 结果必须进入人工确认队列。</Paragraph></div>
                <div className="crm-card-soft"><Text strong>闭环提醒</Text><Paragraph type="secondary" style={{ marginBottom: 0 }}>询盘、报价、订单、回款的跨模块待办统一聚合，避免漏处理。</Paragraph></div>
              </Space>
            </Card>
          </Col>
        </Row>
      </Space>
    </AppShell>
  )
}

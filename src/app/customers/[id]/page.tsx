'use client'

import { Button, Card, Col, Descriptions, Form, Input, Modal, Row, Space, Statistic, Table, Tabs, Tag, Timeline, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { ArrowLeftOutlined, DollarOutlined, MailOutlined, PlusOutlined, RobotOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusTag } from '@/components/common/StatusTag'
import { NextActionPanel } from '@/components/common/NextActionPanel'
import { customerContacts, customerFollowUps, customers, inquiries, orders, payments, quotations } from '@/frontend/mockData'

const { Text, Paragraph } = Typography

type ContactRecord = (typeof customerContacts)[number]
type FollowRecord = (typeof customerFollowUps)[number]

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>()
  const [followOpen, setFollowOpen] = useState(false)
  const customer = customers.find((item) => item.key === params.id) || customers[0]
  const contacts = customerContacts.filter((item) => item.customerKey === customer.key)
  const followUps = customerFollowUps.filter((item) => item.customerKey === customer.key)
  const customerInquiries = inquiries.filter((item) => item.customer === customer.company)
  const customerQuotes = quotations.filter((item) => item.customer === customer.company)
  const customerOrders = orders.filter((item) => item.customer === customer.company)
  const customerPayments = payments.filter((item) => item.customer === customer.company)

  const businessRows = useMemo(() => [
    ...customerInquiries.map((item) => ({ key: item.key, type: '询盘', no: item.inquiryNo, amount: '待报价', status: item.status, href: `/inquiries/${item.key}` })),
    ...customerQuotes.map((item) => ({ key: item.key, type: '报价', no: item.quoteNo, amount: `${item.currency} ${item.amount.toLocaleString()}`, status: item.status, href: `/quotations/${item.key}` })),
    ...customerOrders.map((item) => ({ key: item.key, type: '订单', no: item.orderNo, amount: item.amount, status: item.status, href: `/orders/${item.key}` })),
    ...customerPayments.map((item) => ({ key: item.key, type: '回款', no: item.paymentNo, amount: item.planned, status: item.status, href: '/payments' })),
  ], [customerInquiries, customerOrders, customerPayments, customerQuotes])

  const contactColumns: ColumnsType<ContactRecord> = [
    { title: '联系人', dataIndex: 'name', render: (value, record) => <Space orientation="vertical" size={0}><Text strong>{value}</Text><Text type="secondary">{record.role}</Text></Space> },
    { title: '邮箱', dataIndex: 'email' },
    { title: '电话 / WhatsApp', render: (_, record) => <Space orientation="vertical" size={0}><Text>{record.phone}</Text><Text type="secondary">{record.whatsapp}</Text></Space> },
    { title: '沟通偏好', dataIndex: 'preference' },
    { title: '决策角色', dataIndex: 'decision', render: (value) => <Tag color={value.includes('核心') ? 'green' : 'blue'}>{value}</Tag> },
  ]

  const followColumns: ColumnsType<FollowRecord> = [
    { title: '时间', dataIndex: 'time', width: 150 },
    { title: '方式', dataIndex: 'type', width: 110, render: (value) => <Tag color="blue">{value}</Tag> },
    { title: '内容', dataIndex: 'content' },
    { title: '下步动作', dataIndex: 'next' },
    { title: '情绪', dataIndex: 'sentiment', width: 110, render: (value) => <Tag color={value.includes('积极') ? 'green' : value.includes('敏感') || value.includes('催促') ? 'orange' : 'default'}>{value}</Tag> },
  ]

  return (
    <AppShell>
      <Space orientation="vertical" size={20} style={{ width: '100%' }}>
        <PageHeader
          title={customer.company}
          subtitle="客户详情、联系人、跟进、询盘、报价、订单、回款和 AI 摘要"
          actions={(
            <Space wrap>
              <Link href="/customers"><Button icon={<ArrowLeftOutlined />}>返回客户</Button></Link>
              <Button icon={<RobotOutlined />}>生成客户摘要</Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setFollowOpen(true)}>新建跟进</Button>
            </Space>
          )}
        />

        <Row gutter={[16, 16]}>
          <Col xs={12} lg={6}><Card variant="borderless"><Statistic title="客户等级" value={`${customer.level} 级`} prefix={<SafetyCertificateOutlined />} styles={{ content: { color: customer.level === 'A' ? '#0f6e56' : '#185fa5' } }} /></Card></Col>
          <Col xs={12} lg={6}><Card variant="borderless"><Statistic title="累计价值" value={customer.value.replace('USD ', '')} prefix={<DollarOutlined />} suffix="USD" /></Card></Col>
          <Col xs={12} lg={6}><Card variant="borderless"><Statistic title="业务记录" value={businessRows.length} suffix="条" /></Card></Col>
          <Col xs={12} lg={6}><Card variant="borderless"><Statistic title="联系人" value={contacts.length || 1} suffix="位" /></Card></Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} xl={16}>
            <Card variant="borderless" title="客户档案">
              <Descriptions bordered column={2} size="small" items={[
                { key: 'country', label: '国家', children: customer.country },
                { key: 'source', label: '来源', children: customer.source },
                { key: 'owner', label: '负责人', children: customer.owner },
                { key: 'last', label: '最近联系', children: customer.lastContact },
                { key: 'value', label: '累计价值', children: customer.value },
                { key: 'stage', label: '当前阶段', children: <StatusTag value={customer.stage} /> },
                { key: 'next', label: '下步动作', span: 2, children: customer.nextAction },
                { key: 'risk', label: '风险', span: 2, children: <Tag color={customer.risk.includes('逾期') || customer.risk.includes('低') ? 'red' : 'orange'}>{customer.risk}</Tag> },
              ]} />
            </Card>

            <Card variant="borderless" style={{ marginTop: 16 }}>
              <Tabs
                items={[
                  {
                    key: 'contacts',
                    label: '联系人',
                    children: <Table size="small" pagination={false} columns={contactColumns} dataSource={contacts.length ? contacts : customerContacts.slice(0, 1)} scroll={{ x: 900 }} />,
                  },
                  {
                    key: 'business',
                    label: '业务记录',
                    children: <Table size="small" pagination={false} dataSource={businessRows} columns={[
                      { title: '类型', dataIndex: 'type', render: (value) => <Tag>{value}</Tag> },
                      { title: '单号', dataIndex: 'no', render: (value, record) => <Link href={record.href}>{value}</Link> },
                      { title: '金额', dataIndex: 'amount' },
                      { title: '状态', dataIndex: 'status', render: (value) => <StatusTag value={value} /> },
                    ]} />,
                  },
                  {
                    key: 'follow',
                    label: '跟进记录',
                    children: <Table size="small" pagination={false} columns={followColumns} dataSource={followUps.length ? followUps : customerFollowUps.slice(0, 2)} scroll={{ x: 1000 }} />,
                  },
                ]}
              />
            </Card>
          </Col>

          <Col xs={24} xl={8}>
            <Card variant="borderless" title="AI 客户摘要">
              <Space orientation="vertical" size={12}>
                <Paragraph>客户处于「{customer.stage}」阶段，当前关键动作是：<Text strong>{customer.nextAction}</Text>。</Paragraph>
                <div className="crm-card-soft"><Text strong>风险提示</Text><br /><Text type="secondary">{customer.risk}。建议业务员今天内补充沟通记录，并确认是否需要主管或财务介入。</Text></div>
                <div className="crm-card-soft"><Text strong>推荐动作</Text><br /><Text type="secondary">优先补齐联系人职责、报价条件和回款计划，所有 AI 草稿仅作为建议，不能自动对外发送。</Text></div>
              </Space>
            </Card>

            <div style={{ marginTop: 16 }}><NextActionPanel items={[{ key: 'n1', title: customer.nextAction, desc: '根据客户当前阶段生成，完成后应写入跟进记录。', owner: customer.owner, level: customer.risk.includes('逾期') ? 'risk' : 'warning' }, { key: 'n2', title: '补齐联系人与付款偏好', desc: '避免报价、PI、收款节点无人确认。', owner: '销售', level: 'normal' }, { key: 'n3', title: '检查是否需要主管/财务介入', desc: '低毛利、逾期尾款、异常账期需进入审批或核销流程。', owner: '主管/财务', level: 'warning' }]} /></div>

            <Card variant="borderless" title="客户旅程" style={{ marginTop: 16 }}>
              <Timeline items={[
                { color: 'blue', content: '线索建档 / 客户查重' },
                { color: 'blue', content: '询盘识别与需求补齐' },
                { color: customerQuotes.length ? 'green' : 'gray', content: '报价核算与人工锁价' },
                { color: customerOrders.length ? 'green' : 'gray', content: '订单履约与单证归档' },
                { color: customerPayments.length ? 'orange' : 'gray', content: '回款计划与财务核销' },
              ]} />
            </Card>

            <Card variant="borderless" title="快捷动作" style={{ marginTop: 16 }}>
              <Space wrap>
                <Button icon={<MailOutlined />}>写邮件</Button>
                <Link href="/quotations/new"><Button>新报价</Button></Link>
                <Button>客户查重</Button>
                <Button onClick={() => setFollowOpen(true)}>记录跟进</Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </Space>

      <Modal title="新建客户跟进" open={followOpen} onCancel={() => setFollowOpen(false)} okText="保存跟进" cancelText="取消" onOk={() => setFollowOpen(false)}>
        <Form layout="vertical">
          <Form.Item label="跟进方式"><Input placeholder="Email / WhatsApp / Call / Meeting" /></Form.Item>
          <Form.Item label="沟通内容"><Input.TextArea rows={4} placeholder="记录客户反馈、承诺事项、价格/交期/付款等关键信息" /></Form.Item>
          <Form.Item label="下一步动作"><Input placeholder="例如：明天确认定金到账；补发 DDP 报价拆分" /></Form.Item>
        </Form>
      </Modal>
    </AppShell>
  )
}

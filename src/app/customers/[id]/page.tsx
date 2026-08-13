'use client'

import { Button, Card, Col, Descriptions, Row, Space, Table, Tag, Timeline, Typography } from 'antd'
import { ArrowLeftOutlined, MailOutlined, PlusOutlined, RobotOutlined } from '@ant-design/icons'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/common/PageHeader'
import { customers, inquiries, orders, payments, quotations } from '@/frontend/mockData'

const { Text } = Typography

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>()
  const customer = customers.find((item) => item.key === params.id) || customers[0]
  const customerQuotes = quotations.filter((item) => item.customer === customer.company)
  const customerOrders = orders.filter((item) => item.customer === customer.company)
  const customerPayments = payments.filter((item) => item.customer === customer.company)

  return (
    <AppShell>
      <Space direction="vertical" size={20} style={{ width: '100%' }}>
        <PageHeader
          title={customer.company}
          subtitle="客户详情、联系人、询盘、报价、订单、回款和 AI 摘要"
          actions={<Space><Link href="/customers"><Button icon={<ArrowLeftOutlined />}>返回客户</Button></Link><Button icon={<RobotOutlined />}>生成客户摘要</Button><Button type="primary" icon={<PlusOutlined />}>新建跟进</Button></Space>}
        />
        <Row gutter={[16, 16]}>
          <Col xs={24} xl={16}>
            <Card bordered={false} title="客户档案">
              <Descriptions bordered column={2} size="small" items={[
                { key: 'level', label: '客户等级', children: <Tag color={customer.level === 'A' ? 'green' : 'blue'}>{customer.level} 级</Tag> },
                { key: 'country', label: '国家', children: customer.country },
                { key: 'source', label: '来源', children: customer.source },
                { key: 'owner', label: '负责人', children: customer.owner },
                { key: 'value', label: '累计价值', children: customer.value },
                { key: 'stage', label: '当前阶段', children: customer.stage },
                { key: 'next', label: '下步动作', children: customer.nextAction },
                { key: 'risk', label: '风险', children: <Tag color={customer.risk.includes('逾期') || customer.risk.includes('低') ? 'red' : 'orange'}>{customer.risk}</Tag> },
              ]} />
            </Card>
            <Card bordered={false} title="相关业务记录" style={{ marginTop: 16 }}>
              <Table size="small" pagination={false} dataSource={[...customerQuotes.map((q) => ({ key: q.key, type: '报价', no: q.quoteNo, amount: `${q.currency} ${q.amount.toLocaleString()}`, status: q.status })), ...customerOrders.map((o) => ({ key: o.key, type: '订单', no: o.orderNo, amount: o.amount, status: o.status })), ...customerPayments.map((p) => ({ key: p.key, type: '回款', no: p.paymentNo, amount: p.planned, status: p.status }))]} columns={[{ title: '类型', dataIndex: 'type' }, { title: '单号', dataIndex: 'no' }, { title: '金额', dataIndex: 'amount' }, { title: '状态', dataIndex: 'status' }]} />
            </Card>
          </Col>
          <Col xs={24} xl={8}>
            <Card bordered={false} title="AI 客户摘要">
              <Space direction="vertical" size={12}>
                <Text>客户处于「{customer.stage}」阶段，当前关键动作是：{customer.nextAction}。</Text>
                <div className="crm-card-soft"><Text strong>风险提示</Text><br /><Text type="secondary">{customer.risk}。建议业务员今天内补充沟通记录，并确认是否需要主管介入。</Text></div>
              </Space>
            </Card>
            <Card bordered={false} title="跟进时间线" style={{ marginTop: 16 }}>
              <Timeline items={[
                { children: '收到客户询盘并完成 AI 摘要' },
                { children: '生成报价草稿，等待人工锁价' },
                { children: '提醒下一步：' + customer.nextAction },
              ]} />
            </Card>
            <Card bordered={false} title="快捷动作" style={{ marginTop: 16 }}><Space wrap><Button icon={<MailOutlined />}>写邮件</Button><Button>新报价</Button><Button>查重</Button></Space></Card>
          </Col>
        </Row>
      </Space>
    </AppShell>
  )
}

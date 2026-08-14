'use client'

import { Alert, Button, Card, Col, Descriptions, Form, Input, Modal, Progress, Row, Space, Steps, Table, Tag, Timeline, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { ArrowLeftOutlined, FileDoneOutlined, TruckOutlined } from '@ant-design/icons'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusTag } from '@/components/common/StatusTag'
import { NextActionPanel } from '@/components/common/NextActionPanel'
import { documents, orderMilestones, orderProducts, orders, payments } from '@/frontend/mockData'

const { Text, Paragraph } = Typography

type OrderProduct = (typeof orderProducts)[number]
type OrderMilestone = (typeof orderMilestones)[number]

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>()
  const [progressOpen, setProgressOpen] = useState(false)
  const order = orders.find((item) => item.key === params.id) || orders[0]
  const orderPayments = payments.filter((item) => item.orderNo === order.orderNo)
  const orderDocs = documents.filter((item) => item.orderNo === order.orderNo)
  const products = orderProducts.filter((item) => item.orderKey === order.key)
  const milestones = orderMilestones.filter((item) => item.orderKey === order.key)
  const hasPaymentRisk = orderPayments.some((item) => item.status === 'overdue' || item.status === 'partial') || order.risk.includes('尾款') || order.risk.includes('定金')

  const productColumns: ColumnsType<OrderProduct> = [
    { title: 'SKU', dataIndex: 'sku', width: 140 },
    { title: '产品', dataIndex: 'product' },
    { title: '订单数量', render: (_, record) => `${record.qty.toLocaleString()} ${record.unit}` },
    { title: '已发货', render: (_, record) => `${record.shipped.toLocaleString()} ${record.unit}` },
    { title: '状态', dataIndex: 'status', render: (value) => <Tag color={value.includes('生产') ? 'purple' : value.includes('发货') ? 'gold' : 'blue'}>{value}</Tag> },
  ]

  const milestoneColumns: ColumnsType<OrderMilestone> = [
    { title: '节点', dataIndex: 'title' },
    { title: '日期', dataIndex: 'date' },
    { title: '负责人', dataIndex: 'owner' },
    { title: '状态', dataIndex: 'status', render: (value) => <StatusTag value={value} /> },
    { title: '说明', dataIndex: 'note' },
  ]

  return (
    <AppShell>
      <Space orientation="vertical" size={20} style={{ width: '100%' }}>
        <PageHeader
          title={order.orderNo}
          subtitle="订单详情、产品履约、生产进度、收款计划、单证和发货风险"
          actions={(
            <Space wrap>
              <Link href="/orders"><Button icon={<ArrowLeftOutlined />}>返回订单</Button></Link>
              <Button icon={<FileDoneOutlined />}>生成单证</Button>
              <Button type="primary" icon={<TruckOutlined />} onClick={() => setProgressOpen(true)}>更新进度</Button>
            </Space>
          )}
        />

        <Alert showIcon type={hasPaymentRisk ? 'warning' : 'info'} title={hasPaymentRisk ? '存在收款风险：发货前必须完成对应款项核销，并保留财务确认记录。' : '订单完结必须满足：已发货、尾款已核销、关键单证已归档。'} />

        <Row gutter={[16, 16]}>
          <Col xs={24} xl={16}>
            <Card variant="borderless" title="订单摘要">
              <Descriptions bordered size="small" column={2} items={[
                { key: 'customer', label: '客户', children: order.customer },
                { key: 'amount', label: '金额', children: order.amount },
                { key: 'status', label: '状态', children: <StatusTag value={order.status} /> },
                { key: 'progress', label: '履约进度', children: <Progress percent={order.progress} /> },
                { key: 'delivery', label: '交期', children: order.deliveryDate },
                { key: 'owner', label: '负责人', children: order.owner },
                { key: 'risk', label: '风险', span: 2, children: <Tag color={order.risk === '正常' ? 'green' : 'orange'}>{order.risk}</Tag> },
              ]} />
            </Card>

            <Card variant="borderless" title="产品履约" style={{ marginTop: 16 }}>
              <Table size="small" pagination={false} dataSource={products.length ? products : orderProducts.slice(0, 2)} columns={productColumns} />
            </Card>

            <Card variant="borderless" title="回款计划" style={{ marginTop: 16 }} extra={<Link href="/payments"><Button size="small">去核销</Button></Link>}>
              <Table size="small" pagination={false} dataSource={orderPayments} columns={[
                { title: '编号', dataIndex: 'paymentNo' },
                { title: '类型', dataIndex: 'type' },
                { title: '计划', dataIndex: 'planned' },
                { title: '实际', dataIndex: 'actual' },
                { title: '计划日期', dataIndex: 'plannedDate' },
                { title: '状态', dataIndex: 'status', render: (value) => <StatusTag value={value} /> },
              ]} />
            </Card>

            <Card variant="borderless" title="单证归档" style={{ marginTop: 16 }}>
              <Table size="small" pagination={false} dataSource={orderDocs} columns={[
                { title: '单证号', dataIndex: 'docNo', render: (value, record) => <Link href={`/documents/${record.key}`}>{value}</Link> },
                { title: '类型', dataIndex: 'type' },
                { title: '状态', dataIndex: 'status', render: (value) => <StatusTag value={value} /> },
                { title: 'AI 生成', dataIndex: 'ai', render: (value) => <Tag color={value ? 'purple' : 'default'}>{value ? '是' : '否'}</Tag> },
              ]} />
            </Card>
          </Col>

          <Col xs={24} xl={8}>
            <Card variant="borderless" title="履约流程">
              <Steps orientation="vertical" current={order.status === 'ready_to_ship' ? 4 : 3} items={[
                { title: '待确认' },
                { title: '已确认' },
                { title: '定金已核销' },
                { title: '生产中' },
                { title: '待发货' },
                { title: '已发货' },
                { title: '已完成' },
              ]} />
            </Card>

            <Card variant="borderless" title="订单里程碑" style={{ marginTop: 16 }}>
              <Timeline items={(milestones.length ? milestones : orderMilestones.slice(0, 4)).map((item) => ({
                color: item.status === 'completed' ? 'green' : item.status === 'risk' ? 'red' : item.status === 'processing' ? 'blue' : 'gray',
                content: <Space orientation="vertical" size={2}><Text strong>{item.title} · {item.date}</Text><Text type="secondary">{item.note}</Text></Space>,
              }))} />
            </Card>

            <div style={{ marginTop: 16 }}><NextActionPanel items={[{ key: 'o1', title: '确认收款是否可放行', desc: hasPaymentRisk ? '存在收款风险，发货动作前必须由财务确认。' : '收款暂无阻断风险，继续检查单证。', owner: '财务', level: hasPaymentRisk ? 'risk' : 'done', href: '/payments' }, { key: 'o2', title: '同步生产进度', desc: `当前履约进度 ${order.progress}%，需保持交期和产能同步。`, owner: order.owner, level: 'normal' }, { key: 'o3', title: '检查关键单证归档', desc: 'PI / CI / PL / BL 缺失会影响发货与收款闭环。', owner: '单证', level: 'warning', href: '/documents' }]} /></div>

            <Card variant="borderless" title="AI 风险摘要" style={{ marginTop: 16 }}>
              <Paragraph>当前进度 <Text strong>{order.progress}%</Text>，交期为 <Text strong>{order.deliveryDate}</Text>。</Paragraph>
              <Paragraph type="secondary">如存在尾款、定金或单证缺失风险，系统应在发货动作前阻断并要求责任人确认。</Paragraph>
            </Card>
          </Col>
        </Row>

        <Card variant="borderless" title="里程碑明细">
          <Table size="small" pagination={false} dataSource={milestones.length ? milestones : orderMilestones.slice(0, 4)} columns={milestoneColumns} />
        </Card>
      </Space>

      <Modal title="更新订单进度" open={progressOpen} onCancel={() => setProgressOpen(false)} okText="保存进度" cancelText="取消" onOk={() => setProgressOpen(false)}>
        <Form layout="vertical">
          <Form.Item label="当前节点"><Input defaultValue={order.status === 'ready_to_ship' ? '待发货' : '生产中'} /></Form.Item>
          <Form.Item label="进度百分比"><Input defaultValue={`${order.progress}%`} /></Form.Item>
          <Form.Item label="进度说明"><Input.TextArea rows={4} defaultValue={`当前风险：${order.risk}。请同步生产、财务、单证三方状态。`} /></Form.Item>
        </Form>
      </Modal>
    </AppShell>
  )
}

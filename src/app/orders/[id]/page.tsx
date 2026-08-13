'use client'

import { Alert, Button, Card, Col, Descriptions, Progress, Row, Space, Steps, Table, Tag, Timeline, Typography } from 'antd'
import { ArrowLeftOutlined, FileDoneOutlined, TruckOutlined } from '@ant-design/icons'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusTag } from '@/components/common/StatusTag'
import { documents, orders, payments } from '@/frontend/mockData'

const { Text } = Typography

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>()
  const order = orders.find((item) => item.key === params.id) || orders[0]
  const orderPayments = payments.filter((item) => item.orderNo === order.orderNo)
  const orderDocs = documents.filter((item) => item.orderNo === order.orderNo)
  return <AppShell><Space direction="vertical" size={20} style={{ width: '100%' }}><PageHeader title={order.orderNo} subtitle="订单详情、生产进度、收款计划、单证和发货风险" actions={<Space><Link href="/orders"><Button icon={<ArrowLeftOutlined />}>返回订单</Button></Link><Button icon={<FileDoneOutlined />}>生成单证</Button><Button type="primary" icon={<TruckOutlined />}>更新进度</Button></Space>} /><Alert showIcon type="warning" message="订单完结必须满足：已发货、尾款已核销、关键单证已归档。" /><Row gutter={[16, 16]}><Col xs={24} xl={16}><Card bordered={false} title="订单摘要"><Descriptions bordered size="small" column={2} items={[{ key: 'customer', label: '客户', children: order.customer }, { key: 'amount', label: '金额', children: order.amount }, { key: 'status', label: '状态', children: <StatusTag value={order.status} /> }, { key: 'progress', label: '履约进度', children: <Progress percent={order.progress} /> }, { key: 'delivery', label: '交期', children: order.deliveryDate }, { key: 'risk', label: '风险', children: <Tag color={order.risk === '正常' ? 'green' : 'orange'}>{order.risk}</Tag> }]} /></Card><Card bordered={false} title="回款计划" style={{ marginTop: 16 }}><Table size="small" pagination={false} dataSource={orderPayments} columns={[{ title: '编号', dataIndex: 'paymentNo' }, { title: '类型', dataIndex: 'type' }, { title: '计划', dataIndex: 'planned' }, { title: '实际', dataIndex: 'actual' }, { title: '状态', dataIndex: 'status', render: (v) => <StatusTag value={v} /> }]} /></Card><Card bordered={false} title="单证归档" style={{ marginTop: 16 }}><Table size="small" pagination={false} dataSource={orderDocs} columns={[{ title: '单证号', dataIndex: 'docNo' }, { title: '类型', dataIndex: 'type' }, { title: '状态', dataIndex: 'status', render: (v) => <StatusTag value={v} /> }, { title: 'AI 生成', dataIndex: 'ai', render: (v) => <Tag color={v ? 'purple' : 'default'}>{v ? '是' : '否'}</Tag> }]} /></Card></Col><Col xs={24} xl={8}><Card bordered={false} title="履约流程"><Steps direction="vertical" current={order.status === 'ready_to_ship' ? 4 : 3} items={[{ title: '待确认' }, { title: '已确认' }, { title: '定金已收' }, { title: '生产中' }, { title: '待发货' }, { title: '已发货' }, { title: '已完成' }]} /></Card><Card bordered={false} title="操作时间线" style={{ marginTop: 16 }}><Timeline items={[{ children: '报价转订单，生成收款计划' }, { children: '定金节点提醒财务核销' }, { children: '生产进度更新到 ' + order.progress + '%' }, { children: '交期预警：' + order.risk }]} /></Card></Col></Row></Space></AppShell>
}

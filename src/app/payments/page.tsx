'use client'

import { Alert, Button, Card, Col, Descriptions, Modal, Progress, Row, Space, Table, Typography, Upload } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { BankOutlined, UploadOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusTag } from '@/components/common/StatusTag'
import { payments } from '@/frontend/mockData'

const { Text } = Typography

type PaymentRecord = (typeof payments)[number]

export default function PaymentsPage() {
  const [selected, setSelected] = useState<PaymentRecord | null>(null)
  const columns: ColumnsType<PaymentRecord> = [
    { title: '回款编号', dataIndex: 'paymentNo', render: (value, record) => <Space direction="vertical" size={0}><Text strong>{value}</Text><Text type="secondary">{record.orderNo}</Text></Space> },
    { title: '客户', dataIndex: 'customer' },
    { title: '类型', dataIndex: 'type' },
    { title: '计划金额', dataIndex: 'planned' },
    { title: '实际金额', dataIndex: 'actual' },
    { title: '计划日期', dataIndex: 'plannedDate' },
    { title: '状态', dataIndex: 'status', render: (status) => <StatusTag value={status} /> },
    { title: '动作', render: (_, record) => <Space><Button size="small" onClick={() => setSelected(record)}>上传水单</Button><Button size="small" type="primary" onClick={() => setSelected(record)}>核销</Button></Space> },
  ]

  return <AppShell><Space direction="vertical" size={20} style={{ width: '100%' }}><PageHeader title="回款中心" subtitle="定金、尾款、运费、手续费、逾期预警和财务核销" actions={<Button type="primary" icon={<BankOutlined />}>登记回款</Button>} /><Alert showIcon type="warning" message="上传水单不等于已核销，必须由财务确认到账后才进入 verified 状态。" /><Row gutter={[16, 16]}><Col xs={24} xl={17}><Card bordered={false} title="收款计划"><Table columns={columns} dataSource={payments} scroll={{ x: 1100 }} /></Card></Col><Col xs={24} xl={7}><Card bordered={false} title="应收健康度"><Space direction="vertical" style={{ width: '100%' }}><Text>本月回款达成</Text><Progress percent={76} /><Text>逾期金额占比</Text><Progress percent={12} status="exception" /><Text>待核销水单</Text><Progress percent={38} strokeColor="#faad14" /></Space></Card></Col></Row><Modal title="回款核销" open={Boolean(selected)} onCancel={() => setSelected(null)} okText="确认核销" cancelText="取消" onOk={() => setSelected(null)}><Space direction="vertical" size={16} style={{ width: '100%' }}>{selected ? <Descriptions bordered size="small" column={1} items={[{ key: 'paymentNo', label: '回款编号', children: selected.paymentNo }, { key: 'orderNo', label: '订单号', children: selected.orderNo }, { key: 'customer', label: '客户', children: selected.customer }, { key: 'planned', label: '计划金额', children: selected.planned }, { key: 'actual', label: '实际金额', children: selected.actual }, { key: 'status', label: '状态', children: <StatusTag value={selected.status} /> }]} /> : null}<Upload beforeUpload={() => false}><Button icon={<UploadOutlined />}>上传水单/银行凭证</Button></Upload><Alert showIcon type="info" message="核销动作必须由财务角色完成，并在后台接入后写入审计日志。" /></Space></Modal></Space></AppShell>
}

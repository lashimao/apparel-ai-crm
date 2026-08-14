'use client'

import { Alert, Button, Card, Checkbox, Col, Descriptions, Form, Input, InputNumber, Modal, Progress, Row, Space, Table, Tag, Typography, Upload } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { AuditOutlined, BankOutlined, UploadOutlined } from '@ant-design/icons'
import { useMemo, useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusTag } from '@/components/common/StatusTag'
import { paymentReceipts, payments, paymentVerificationChecklist } from '@/frontend/mockData'

const { Text, Paragraph } = Typography

type PaymentRecord = (typeof payments)[number]
type ReceiptRecord = (typeof paymentReceipts)[number]

function moneyToNumber(value: string) {
  return Number(value.replace(/[^0-9.-]/g, '')) || 0
}

export default function PaymentsPage() {
  const [selected, setSelected] = useState<PaymentRecord | null>(null)
  const [registerOpen, setRegisterOpen] = useState(false)
  const selectedReceipts = selected ? paymentReceipts.filter((item) => item.paymentKey === selected.key) : []
  const variance = useMemo(() => {
    if (!selected) return 0
    return moneyToNumber(selected.actual) - moneyToNumber(selected.planned)
  }, [selected])

  const columns: ColumnsType<PaymentRecord> = [
    { title: '回款编号', dataIndex: 'paymentNo', fixed: 'left', width: 190, render: (value, record) => <Space direction="vertical" size={0}><Text strong>{value}</Text><Text type="secondary">{record.orderNo}</Text></Space> },
    { title: '客户', dataIndex: 'customer', width: 180 },
    { title: '类型', dataIndex: 'type', width: 100, render: (value) => <Tag>{value === 'deposit' ? '定金' : '尾款'}</Tag> },
    { title: '计划金额', dataIndex: 'planned', width: 130 },
    { title: '实际金额', dataIndex: 'actual', width: 130 },
    { title: '计划日期', dataIndex: 'plannedDate', width: 130 },
    { title: '负责人', dataIndex: 'owner', width: 110 },
    { title: '状态', dataIndex: 'status', width: 120, render: (status) => <StatusTag value={status} /> },
    { title: '动作', fixed: 'right', width: 170, render: (_, record) => <Space><Button size="small" onClick={() => setSelected(record)}>上传水单</Button><Button size="small" type="primary" onClick={() => setSelected(record)}>核销</Button></Space> },
  ]

  const receiptColumns: ColumnsType<ReceiptRecord> = [
    { title: '凭证', dataIndex: 'file' },
    { title: '金额', dataIndex: 'amount', width: 120 },
    { title: '上传时间', dataIndex: 'uploadedAt', width: 150 },
    { title: '状态', dataIndex: 'status', width: 110, render: (value) => <StatusTag value={value} /> },
  ]

  return (
    <AppShell>
      <Space direction="vertical" size={20} style={{ width: '100%' }}>
        <PageHeader title="回款中心" subtitle="定金、尾款、运费、手续费、逾期预警、水单上传和财务核销" actions={<Button type="primary" icon={<BankOutlined />} onClick={() => setRegisterOpen(true)}>登记回款</Button>} />
        <Alert showIcon type="warning" message="上传水单不等于已核销，必须由财务确认银行到账后才进入已核销状态，并写入审计日志。" />

        <Row gutter={[16, 16]}>
          <Col xs={24} xl={17}>
            <Card bordered={false} title="收款计划">
              <Table columns={columns} dataSource={payments} scroll={{ x: 1250 }} />
            </Card>
          </Col>
          <Col xs={24} xl={7}>
            <Card bordered={false} title="应收健康度">
              <Space direction="vertical" style={{ width: '100%' }} size={14}>
                <Text>本月回款达成</Text><Progress percent={76} />
                <Text>逾期金额占比</Text><Progress percent={12} status="exception" />
                <Text>待核销水单</Text><Progress percent={38} strokeColor="#faad14" />
                <div className="crm-card-soft"><Text strong>财务提醒</Text><br /><Text type="secondary">核销前确认付款主体、到账金额、手续费、汇差和对应订单，异常款项需复核。</Text></div>
              </Space>
            </Card>
          </Col>
        </Row>

        <Modal width={760} title="回款核销" open={Boolean(selected)} onCancel={() => setSelected(null)} okText="确认核销" cancelText="取消" onOk={() => setSelected(null)}>
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            {selected ? (
              <Descriptions bordered size="small" column={2} items={[
                { key: 'paymentNo', label: '回款编号', children: selected.paymentNo },
                { key: 'orderNo', label: '订单号', children: selected.orderNo },
                { key: 'customer', label: '客户', children: selected.customer },
                { key: 'type', label: '类型', children: selected.type === 'deposit' ? '定金' : '尾款' },
                { key: 'planned', label: '计划金额', children: selected.planned },
                { key: 'actual', label: '实际金额', children: selected.actual },
                { key: 'variance', label: '差额', children: <Text type={variance < 0 ? 'danger' : undefined}>{variance === 0 ? 'USD 0' : `USD ${variance.toLocaleString()}`}</Text> },
                { key: 'status', label: '状态', children: <StatusTag value={selected.status} /> },
              ]} />
            ) : null}

            <Card size="small" title="水单/到账凭证" extra={<Upload beforeUpload={() => false}><Button size="small" icon={<UploadOutlined />}>上传凭证</Button></Upload>}>
              <Table size="small" pagination={false} columns={receiptColumns} dataSource={selectedReceipts.length ? selectedReceipts : paymentReceipts.slice(0, 1)} />
            </Card>

            <Card size="small" title="核销检查清单">
              <Space direction="vertical">
                {paymentVerificationChecklist.map((item) => <Checkbox key={item.key} defaultChecked={!item.required || selected?.status === 'paid'}>{item.label}{item.required ? <Text type="danger"> *</Text> : null}</Checkbox>)}
              </Space>
            </Card>

            <Form layout="vertical">
              <Row gutter={16}>
                <Col xs={24} md={12}><Form.Item label="本次核销金额"><InputNumber prefix="USD" style={{ width: '100%' }} defaultValue={selected ? moneyToNumber(selected.actual) || moneyToNumber(selected.planned) : 0} /></Form.Item></Col>
                <Col xs={24} md={12}><Form.Item label="手续费/汇差"><InputNumber prefix="USD" style={{ width: '100%' }} defaultValue={0} /></Form.Item></Col>
                <Col xs={24}><Form.Item label="差额或异常说明"><Input.TextArea rows={3} placeholder="如短付、手续费扣减、第三方付款、重复付款等，请写明原因" /></Form.Item></Col>
              </Row>
            </Form>

            <Alert showIcon type="info" icon={<AuditOutlined />} message="核销动作必须由财务角色完成；后台接入后需要记录操作者、时间、凭证、金额和订单关联。" />
          </Space>
        </Modal>

        <Modal title="登记回款" open={registerOpen} onCancel={() => setRegisterOpen(false)} okText="保存登记" cancelText="取消" onOk={() => setRegisterOpen(false)}>
          <Form layout="vertical">
            <Form.Item label="订单号"><Input placeholder="选择或输入订单号" /></Form.Item>
            <Form.Item label="客户"><Input placeholder="客户名称" /></Form.Item>
            <Form.Item label="到账金额"><InputNumber prefix="USD" style={{ width: '100%' }} /></Form.Item>
            <Form.Item label="备注"><Input.TextArea rows={3} placeholder="付款主体、银行流水号、手续费等" /></Form.Item>
          </Form>
          <Paragraph type="secondary">登记仅创建待核销记录，仍需上传凭证并由财务确认到账。</Paragraph>
        </Modal>
      </Space>
    </AppShell>
  )
}

'use client'

import { Alert, Button, Card, Checkbox, Col, Descriptions, Form, Input, InputNumber, Row, Select, Space, Steps, Table, Tag, Typography } from 'antd'
import { ArrowLeftOutlined, FileDoneOutlined, ShoppingCartOutlined } from '@ant-design/icons'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusTag } from '@/components/common/StatusTag'
import { NextActionPanel } from '@/components/common/NextActionPanel'
import { quoteToOrderChecklist, quotationLineItems, quotations } from '@/frontend/mockData'

const { Text, Paragraph } = Typography

export default function QuoteConvertPage() {
  const params = useParams<{ id: string }>()
  const quote = quotations.find((item) => item.key === params.id) || quotations[0]
  const items = quotationLineItems.filter((item) => item.quoteKey === quote.key)
  const blockedByApproval = quote.profitRate < quote.minProfitRate && quote.approvalStatus !== 'approved'
  const blockedByLock = items.some((item) => !item.locked)

  const productRows = items.length ? items : quotationLineItems.slice(0, 2)

  return (
    <AppShell>
      <Space orientation="vertical" size={20} style={{ width: '100%' }}>
        <PageHeader
          title={`报价转订单：${quote.quoteNo}`}
          subtitle="客户确认、锁价审批、订单草稿、收款计划和单证准备"
          actions={(
            <Space wrap>
              <Link href={`/quotations/${quote.key}`}><Button icon={<ArrowLeftOutlined />}>返回报价</Button></Link>
              <Button icon={<FileDoneOutlined />}>生成 PI 草稿</Button>
              <Button type="primary" icon={<ShoppingCartOutlined />} disabled={blockedByApproval || blockedByLock}>确认生成订单</Button>
            </Space>
          )}
        />

        {(blockedByApproval || blockedByLock) ? (
          <Alert showIcon type="error" title="当前报价仍存在阻断项：低毛利审批未通过或明细未全部锁价，不能生成正式订单。" />
        ) : (
          <Alert showIcon type="success" title="当前报价满足转订单前置条件；生成订单前仍需人工确认客户书面回复和付款条款。" />
        )}

        <Row gutter={[16, 16]}>
          <Col xs={24} xl={16}>
            <Card variant="borderless" title="报价与客户确认">
              <Descriptions bordered size="small" column={2} items={[
                { key: 'customer', label: '客户', children: quote.customer },
                { key: 'quoteNo', label: '报价号', children: quote.quoteNo },
                { key: 'amount', label: '报价金额', children: `${quote.currency} ${quote.amount.toLocaleString()}` },
                { key: 'profit', label: '毛利率', children: <Tag color={quote.profitRate < quote.minProfitRate ? 'red' : 'green'}>{quote.profitRate}%</Tag> },
                { key: 'approval', label: '审批状态', children: <StatusTag value={quote.approvalStatus} /> },
                { key: 'valid', label: '报价有效期', children: quote.validUntil },
              ]} />
            </Card>

            <Card variant="borderless" title="订单产品草稿" style={{ marginTop: 16 }}>
              <Table
                size="small"
                pagination={false}
                dataSource={productRows}
                columns={[
                  { title: '产品', dataIndex: 'product', render: (value, record) => <Space orientation="vertical" size={0}><Text strong>{value}</Text><Text type="secondary">{record.spec}</Text></Space> },
                  { title: '数量', render: (_, record) => `${record.qty.toLocaleString()} ${record.unit}` },
                  { title: '单价', dataIndex: 'price', render: (value) => `USD ${value}` },
                  { title: '锁价', dataIndex: 'locked', render: (value) => <Tag color={value ? 'green' : 'red'}>{value ? '已锁价' : '待锁价'}</Tag> },
                  { title: '毛利率', dataIndex: 'profitRate', render: (value) => <Tag color={value < quote.minProfitRate ? 'red' : 'green'}>{value}%</Tag> },
                ]}
              />
            </Card>

            <Card variant="borderless" title="订单基础信息" style={{ marginTop: 16 }}>
              <Form layout="vertical">
                <Row gutter={16}>
                  <Col xs={24} md={12}><Form.Item label="订单编号"><Input defaultValue="SO-2026-0814-DRAFT" /></Form.Item></Col>
                  <Col xs={24} md={12}><Form.Item label="订单负责人"><Input defaultValue={quote.owner} /></Form.Item></Col>
                  <Col xs={24} md={12}><Form.Item label="贸易条款"><Select defaultValue="DDP" options={[{ value: 'FOB' }, { value: 'CIF' }, { value: 'DDP' }, { value: 'EXW' }]} /></Form.Item></Col>
                  <Col xs={24} md={12}><Form.Item label="预计交期"><Input defaultValue="30-35 days after deposit" /></Form.Item></Col>
                  <Col xs={24} md={12}><Form.Item label="定金比例"><InputNumber defaultValue={30} suffix="%" style={{ width: '100%' }} /></Form.Item></Col>
                  <Col xs={24} md={12}><Form.Item label="尾款节点"><Select defaultValue="before_shipment" options={[{ label: '发货前付清', value: 'before_shipment' }, { label: '见提单副本付款', value: 'bl_copy' }, { label: '异常账期审批', value: 'credit' }]} /></Form.Item></Col>
                </Row>
              </Form>
            </Card>
          </Col>

          <Col xs={24} xl={8}>
            <Card variant="borderless" title="转订单流程">
              <Steps orientation="vertical" current={blockedByApproval || blockedByLock ? 2 : 4} items={[
                { title: '客户确认报价', content: '价格、数量、规格、交期' },
                { title: '锁价与审批检查', content: blockedByApproval || blockedByLock ? '仍有阻断项' : '已满足' },
                { title: '生成订单草稿', content: 'SO / PI / 收款计划' },
                { title: '人工确认订单', content: '业务员最终确认' },
                { title: '进入履约', content: '定金、生产、单证、发货' },
              ]} />
            </Card>

            <Card variant="borderless" title="转订单检查清单" style={{ marginTop: 16 }}>
              <Space orientation="vertical" size={10}>
                {quoteToOrderChecklist.map((item) => (
                  <Checkbox key={item.key} defaultChecked={!blockedByApproval && !blockedByLock && item.required}>{item.label}<Tag style={{ marginLeft: 8 }}>{item.owner}</Tag>{item.required ? <Text type="danger"> *</Text> : null}</Checkbox>
                ))}
              </Space>
            </Card>

            <div style={{ marginTop: 16 }}>
              <NextActionPanel items={[
                { key: 'c1', title: blockedByApproval ? '先完成低毛利审批' : '确认客户书面回复', desc: blockedByApproval ? '审批未通过前不得生成正式订单。' : '邮件、WhatsApp 或合同确认均需归档。', owner: blockedByApproval ? '销售主管' : quote.owner, level: blockedByApproval ? 'risk' : 'warning', href: blockedByApproval ? '/approvals/A001' : undefined },
                { key: 'c2', title: blockedByLock ? '锁定全部报价明细' : '准备 PI 与收款计划', desc: blockedByLock ? '仍有产品行待锁价。' : '定金、尾款和单证节点将进入订单。', owner: '销售/财务', level: blockedByLock ? 'risk' : 'normal' },
              ]} />
            </div>
          </Col>
        </Row>
      </Space>
    </AppShell>
  )
}

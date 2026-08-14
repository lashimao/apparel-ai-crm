'use client'

import { Alert, Button, Card, Checkbox, Col, Divider, Form, Input, InputNumber, Modal, Row, Select, Space, Statistic, Table, Tabs, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { ArrowLeftOutlined, AuditOutlined, CalculatorOutlined, LockOutlined, SaveOutlined, SendOutlined } from '@ant-design/icons'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusTag } from '@/components/common/StatusTag'
import { formatMoney, quotationCostItems, quotationLineItems, quotations } from '@/frontend/mockData'

const { Text, Paragraph } = Typography

type LineItem = (typeof quotationLineItems)[number]
type CostItem = (typeof quotationCostItems)[number]

export default function QuotationEditPage() {
  const params = useParams<{ id: string }>()
  const [approvalOpen, setApprovalOpen] = useState(false)
  const [sendOpen, setSendOpen] = useState(false)
  const quote = quotations.find((item) => item.key === params.id) || quotations[0]
  const lineItems = quotationLineItems.filter((item) => item.quoteKey === quote.key)
  const costItems = quotationCostItems.filter((item) => item.quoteKey === quote.key)
  const requiresApproval = quote.profitRate < quote.minProfitRate

  const totals = useMemo(() => {
    const revenue = lineItems.reduce((sum, item) => sum + item.qty * item.price, 0)
    const cost = lineItems.reduce((sum, item) => sum + item.qty * (item.cost + item.freight + item.fee), 0)
    const profit = revenue - cost
    return { revenue, cost, profit, rate: revenue ? (profit / revenue) * 100 : 0 }
  }, [lineItems])

  const lineColumns: ColumnsType<LineItem> = [
    { title: '产品', dataIndex: 'product', fixed: 'left', width: 190, render: (value, record) => <Space orientation="vertical" size={0}><Text strong>{value}</Text><Text type="secondary">{record.spec}</Text></Space> },
    { title: '数量', dataIndex: 'qty', width: 120, render: (value, record) => <InputNumber defaultValue={value} suffix={record.unit} style={{ width: 110 }} /> },
    { title: '成本', dataIndex: 'cost', width: 110, render: (value) => <InputNumber defaultValue={value} prefix="$" precision={2} style={{ width: 100 }} /> },
    { title: '运费', dataIndex: 'freight', width: 110, render: (value) => <InputNumber defaultValue={value} prefix="$" precision={2} style={{ width: 100 }} /> },
    { title: '杂费', dataIndex: 'fee', width: 110, render: (value) => <InputNumber defaultValue={value} prefix="$" precision={2} style={{ width: 100 }} /> },
    { title: '报价', dataIndex: 'price', width: 120, render: (value) => <InputNumber defaultValue={value} prefix="$" precision={2} style={{ width: 110 }} /> },
    { title: '毛利率', dataIndex: 'profitRate', width: 110, render: (value) => <Tag color={value < quote.minProfitRate ? 'red' : 'green'}>{value}%</Tag> },
    { title: '锁价', dataIndex: 'locked', width: 110, render: (value) => <Tag color={value ? 'green' : 'orange'} icon={value ? <LockOutlined /> : undefined}>{value ? '已锁价' : '待锁价'}</Tag> },
  ]

  const costColumns: ColumnsType<CostItem> = [
    { title: '费用项', dataIndex: 'name' },
    { title: '金额', dataIndex: 'amount', render: (value) => formatMoney(value) },
    { title: '说明', dataIndex: 'note' },
  ]

  return (
    <AppShell>
      <Space orientation="vertical" size={20} style={{ width: '100%' }}>
        <PageHeader
          title={`编辑报价：${quote.quoteNo}`}
          subtitle="产品明细、成本费用、目标毛利、审批理由、人工锁价和发送前检查"
          actions={(
            <Space wrap>
              <Link href={`/quotations/${quote.key}`}><Button icon={<ArrowLeftOutlined />}>返回详情</Button></Link>
              <Button icon={<CalculatorOutlined />}>重新核价</Button>
              <Button icon={<SaveOutlined />}>保存草稿</Button>
              <Button icon={<AuditOutlined />} danger={requiresApproval} onClick={() => setApprovalOpen(true)}>提交审批</Button>
              <Button type="primary" icon={<SendOutlined />} onClick={() => setSendOpen(true)}>发送前校验</Button>
            </Space>
          )}
        />

        {requiresApproval ? <Alert showIcon type="error" title={`当前毛利率 ${quote.profitRate}% 低于底线 ${quote.minProfitRate}%，必须填写原因并完成主管审批后才能发送。`} /> : <Alert showIcon type="success" title="当前报价满足毛利底线，但仍需人工锁价和发送前校验。" />}

        <Row gutter={[16, 16]}>
          <Col xs={12} lg={6}><Card variant="borderless"><Statistic title="报价金额" value={quote.amount} prefix={quote.currency} /></Card></Col>
          <Col xs={12} lg={6}><Card variant="borderless"><Statistic title="测算收入" value={Math.round(totals.revenue)} prefix="USD" /></Card></Col>
          <Col xs={12} lg={6}><Card variant="borderless"><Statistic title="测算毛利" value={Math.round(totals.profit)} prefix="USD" styles={{ content: { color: totals.rate < quote.minProfitRate ? '#cf1322' : '#0f6e56' } }} /></Card></Col>
          <Col xs={12} lg={6}><Card variant="borderless"><Statistic title="综合毛利率" value={totals.rate.toFixed(1)} suffix="%" styles={{ content: { color: totals.rate < quote.minProfitRate ? '#cf1322' : '#0f6e56' } }} /></Card></Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} xl={16}>
            <Card variant="borderless">
              <Tabs items={[
                {
                  key: 'items',
                  label: '报价明细',
                  children: (
                    <Space orientation="vertical" size={12} style={{ width: '100%' }}>
                      {lineItems.map((item) => {
                        const lineRevenue = item.qty * item.price
                        const lineCost = item.qty * (item.cost + item.freight + item.fee)
                        return (
                          <Card key={item.key} size="small" className="crm-line-card">
                            <Row gutter={[12, 12]} align="middle">
                              <Col xs={24} lg={6}>
                                <Text strong>{item.product}</Text><br />
                                <Text type="secondary">{item.spec}</Text>
                              </Col>
                              <Col xs={12} lg={4}><Text type="secondary">数量</Text><br /><InputNumber defaultValue={item.qty} suffix={item.unit} style={{ width: '100%', minWidth: 108 }} /></Col>
                              <Col xs={12} lg={3}><Text type="secondary">成本</Text><br /><InputNumber defaultValue={item.cost} prefix="$" precision={2} style={{ width: '100%' }} /></Col>
                              <Col xs={12} lg={3}><Text type="secondary">运杂费</Text><br /><InputNumber defaultValue={item.freight + item.fee} prefix="$" precision={2} style={{ width: '100%' }} /></Col>
                              <Col xs={12} lg={3}><Text type="secondary">报价</Text><br /><InputNumber defaultValue={item.price} prefix="$" precision={2} style={{ width: '100%' }} /></Col>
                              <Col xs={12} lg={3}><Text type="secondary">毛利率</Text><br /><Tag color={item.profitRate < quote.minProfitRate ? 'red' : 'green'}>{item.profitRate}%</Tag></Col>
                              <Col xs={12} lg={3}><Text type="secondary">锁价</Text><br /><Tag color={item.locked ? 'green' : 'orange'}>{item.locked ? '已锁价' : '待锁价'}</Tag></Col>
                              <Col xs={24}>
                                <div className="crm-line-summary">
                                  <Text type="secondary">本行收入：USD {Math.round(lineRevenue).toLocaleString()} · 本行成本：USD {Math.round(lineCost).toLocaleString()} · 风险：{item.profitRate < quote.minProfitRate ? '低于毛利底线，需审批' : '毛利正常'}</Text>
                                </div>
                              </Col>
                            </Row>
                          </Card>
                        )
                      })}
                    </Space>
                  ),
                },
                {
                  key: 'costs',
                  label: '成本费用',
                  children: <Table size="small" pagination={false} columns={costColumns} dataSource={costItems.length ? costItems : quotationCostItems.slice(0, 4)} />,
                },
                {
                  key: 'terms',
                  label: '报价条款',
                  children: (
                    <Form layout="vertical">
                      <Row gutter={16}>
                        <Col xs={24} md={12}><Form.Item label="贸易条款"><Select defaultValue="DDP" options={[{ value: 'FOB' }, { value: 'CIF' }, { value: 'DDP' }, { value: 'EXW' }]} /></Form.Item></Col>
                        <Col xs={24} md={12}><Form.Item label="报价有效期"><Input defaultValue={quote.validUntil} /></Form.Item></Col>
                        <Col xs={24} md={12}><Form.Item label="付款条款"><Input defaultValue="30% deposit, 70% before shipment" /></Form.Item></Col>
                        <Col xs={24} md={12}><Form.Item label="交期"><Input defaultValue="25-35 days after deposit" /></Form.Item></Col>
                        <Col xs={24}><Form.Item label="备注"><Input.TextArea rows={4} defaultValue="Price is subject to final confirmation before official PI. AI suggestions are for reference only." /></Form.Item></Col>
                      </Row>
                    </Form>
                  ),
                },
              ]} />
            </Card>
          </Col>

          <Col xs={24} xl={8}>
            <Card variant="borderless" title="报价状态">
              <Space orientation="vertical" size={12} style={{ width: '100%' }}>
                <div><Text type="secondary">客户</Text><br /><Text strong>{quote.customer}</Text></div>
                <div><Text type="secondary">当前状态</Text><br /><StatusTag value={quote.status} /></div>
                <div><Text type="secondary">审批状态</Text><br /><StatusTag value={quote.approvalStatus} /></div>
                <div><Text type="secondary">风险</Text><br /><Tag color={requiresApproval ? 'red' : 'orange'}>{quote.risk}</Tag></div>
                <Divider />
                <Paragraph type="secondary">硬规则：低毛利必须审批；报价明细必须人工锁价；AI 不能代替业务员发送正式报价。</Paragraph>
              </Space>
            </Card>

            <Card variant="borderless" title="发送前检查" style={{ marginTop: 16 }}>
              <Space orientation="vertical">
                <Checkbox defaultChecked={lineItems.every((item) => item.locked)}>报价明细已人工锁价</Checkbox>
                <Checkbox defaultChecked={!requiresApproval}>毛利底线已满足或已审批</Checkbox>
                <Checkbox defaultChecked>报价有效期已填写</Checkbox>
                <Checkbox>客户付款条款已确认</Checkbox>
                <Checkbox>附件和 PI 草稿已归档</Checkbox>
              </Space>
            </Card>
          </Col>
        </Row>
      </Space>

      <Modal title="提交低毛利审批" open={approvalOpen} onCancel={() => setApprovalOpen(false)} okText="提交审批" cancelText="取消" onOk={() => setApprovalOpen(false)}>
        <Form layout="vertical">
          <Form.Item label="审批原因" required><Input.TextArea rows={4} defaultValue="客户要求 DDP 总价，运费上涨导致综合毛利低于底线。建议主管复核后决定是否保留该客户报价。" /></Form.Item>
          <Form.Item label="可接受最低毛利"><InputNumber defaultValue={quote.profitRate} suffix="%" style={{ width: '100%' }} /></Form.Item>
        </Form>
      </Modal>

      <Modal title="发送前校验" open={sendOpen} onCancel={() => setSendOpen(false)} okText="确认，进入发送" cancelText="继续编辑" onOk={() => setSendOpen(false)}>
        <Alert showIcon type={requiresApproval ? 'error' : 'info'} title={requiresApproval ? '仍存在低毛利审批风险，当前版本不能直接发送。' : '校验通过后仍需业务员最终确认发送。'} />
      </Modal>
    </AppShell>
  )
}

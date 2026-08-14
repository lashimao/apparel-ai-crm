'use client'

import { Alert, Button, Card, Checkbox, Col, Descriptions, Drawer, Form, Input, Progress, Row, Space, Steps, Table, Tag, Timeline, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { ArrowLeftOutlined, CalculatorOutlined, RobotOutlined, SendOutlined } from '@ant-design/icons'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusTag } from '@/components/common/StatusTag'
import { NextActionPanel } from '@/components/common/NextActionPanel'
import { inquiries, inquiryMessages, inquiryRequirements } from '@/frontend/mockData'

const { Paragraph, Text } = Typography
const { TextArea } = Input

type Requirement = (typeof inquiryRequirements)[number]

export default function InquiryDetailPage() {
  const params = useParams<{ id: string }>()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const inquiry = inquiries.find((item) => item.key === params.id) || inquiries[0]
  const requirements = inquiryRequirements.filter((item) => item.inquiryKey === inquiry.key)
  const messages = inquiryMessages.filter((item) => item.inquiryKey === inquiry.key)
  const missingCount = requirements.filter((item) => item.status !== 'completed').length

  const requirementColumns: ColumnsType<Requirement> = [
    { title: '报价条件', dataIndex: 'field', width: 120, render: (value) => <Text strong>{value}</Text> },
    { title: '当前值', dataIndex: 'value' },
    { title: '来源', dataIndex: 'source', width: 150 },
    { title: '状态', dataIndex: 'status', width: 120, render: (value) => <StatusTag value={value} /> },
  ]

  return (
    <AppShell>
      <Space orientation="vertical" size={20} style={{ width: '100%' }}>
        <PageHeader
          title={inquiry.inquiryNo}
          subtitle="询盘详情、原文翻译、AI 识别、回复草稿、条件补齐和转报价入口"
          actions={(
            <Space wrap>
              <Link href="/inquiries"><Button icon={<ArrowLeftOutlined />}>返回询盘</Button></Link>
              <Button icon={<RobotOutlined />}>重新分析</Button>
              <Button icon={<CalculatorOutlined />} onClick={() => setDrawerOpen(true)}>转报价</Button>
              <Button type="primary" icon={<SendOutlined />}>人工确认后发送</Button>
            </Space>
          )}
        />

        <Alert showIcon type="warning" title="AI 回复草稿不能自动发送；缺少数量、目的港、包装或付款条款时必须先补充确认。" />

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={8}><Card variant="borderless"><Text type="secondary">AI 成交评分</Text><Progress percent={inquiry.aiScore} strokeColor={inquiry.aiScore >= 85 ? '#52c41a' : '#faad14'} /></Card></Col>
          <Col xs={24} lg={8}><Card variant="borderless"><Text type="secondary">缺失报价条件</Text><div style={{ fontSize: 28, fontWeight: 700, color: missingCount ? '#cf1322' : '#0f6e56' }}>{missingCount} 项</div></Card></Col>
          <Col xs={24} lg={8}><Card variant="borderless"><Text type="secondary">处理状态</Text><div style={{ marginTop: 10 }}><StatusTag value={inquiry.status} /></div></Card></Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} xl={15}>
            <Card variant="borderless" title="询盘信息">
              <Descriptions bordered column={2} size="small" items={[
                { key: 'customer', label: '客户', children: inquiry.customer },
                { key: 'country', label: '国家', children: inquiry.country },
                { key: 'source', label: '来源', children: inquiry.source },
                { key: 'product', label: '产品', children: inquiry.product },
                { key: 'priority', label: '优先级', children: <Tag color={inquiry.priority === 'urgent' ? 'red' : 'orange'}>{inquiry.priority}</Tag> },
                { key: 'owner', label: '负责人', children: inquiry.owner },
              ]} />
            </Card>

            <Card variant="borderless" title="报价条件核对" style={{ marginTop: 16 }} extra={<Button size="small" onClick={() => setDrawerOpen(true)}>补齐并转报价</Button>}>
              <Table size="small" pagination={false} columns={requirementColumns} dataSource={requirements} />
            </Card>

            <Card variant="borderless" title="AI 回复草稿" style={{ marginTop: 16 }}>
              <TextArea rows={9} defaultValue={`Dear customer,\n\nThanks for your inquiry about ${inquiry.product}. We can provide FOB/CIF/DDP quotation after confirming the following details:\n1. Estimated order quantity\n2. Destination port / delivery address\n3. Packaging requirement\n4. Target lead time and payment terms\n\nOnce confirmed, our sales team will prepare an official quotation for your manual approval.\n\nBest regards,\nNexFab Sales Team`} />
              <Space style={{ marginTop: 12 }} wrap>
                <Button>保存草稿</Button>
                <Button>插入产品参数</Button>
                <Button type="primary">人工确认后发送</Button>
              </Space>
            </Card>
          </Col>

          <Col xs={24} xl={9}>
            <Card variant="borderless" title="处理流程">
              <Steps orientation="vertical" current={missingCount ? 2 : 3} items={[
                { title: '接收询盘', content: inquiry.receivedAt },
                { title: 'AI 翻译/识别', content: `${inquiry.aiScore}% 成交评分` },
                { title: '补齐报价条件', content: missingCount ? `仍缺 ${missingCount} 项` : '已满足转报价' },
                { title: '生成报价', content: '进入报价编辑页' },
                { title: '客户确认', content: '确认后转订单' },
              ]} />
            </Card>

            <Card variant="borderless" title="原文与 AI 记录" style={{ marginTop: 16 }}>
              <Timeline items={(messages.length ? messages : inquiryMessages.slice(0, 2)).map((item) => ({
                color: item.sender === 'customer' ? 'blue' : 'purple',
                content: <Space orientation="vertical" size={2}><Text strong>{item.channel} · {item.time}</Text><Paragraph style={{ marginBottom: 0 }}>{item.content}</Paragraph></Space>,
              }))} />
            </Card>

            <div style={{ marginTop: 16 }}><NextActionPanel items={[{ key: 'i1', title: '补齐缺失报价条件', desc: missingCount ? `仍缺 ${missingCount} 项，不能直接生成正式报价。` : '报价条件已满足，可进入报价编辑。', owner: inquiry.owner, level: missingCount ? 'risk' : 'done' }, { key: 'i2', title: '人工确认回复草稿', desc: 'AI 草稿不能自动发送，需业务员确认语气、价格边界和承诺内容。', owner: '销售', level: 'warning' }, { key: 'i3', title: '转报价并锁定成本口径', desc: '进入报价编辑后再做毛利和运费测算。', owner: '销售', level: 'normal', href: '/quotations/new' }]} /></div>

            <Card variant="borderless" title="AI 识别结果" style={{ marginTop: 16 }}>
              <Paragraph><Text strong>产品：</Text>{inquiry.product}</Paragraph>
              <Paragraph><Text strong>客户意图：</Text>询价 + 交期确认 + 批量采购评估。</Paragraph>
              <Paragraph><Text strong>边界：</Text>AI 只生成草稿和风险提示，正式报价与对外发送必须人工确认。</Paragraph>
            </Card>
          </Col>
        </Row>
      </Space>

      <Drawer title="补齐条件并转报价" open={drawerOpen} onClose={() => setDrawerOpen(false)} size={520} extra={<Link href="/quotations/new"><Button type="primary">生成报价草稿</Button></Link>}>
        <Form layout="vertical">
          <Form.Item label="产品与规格"><Input defaultValue={inquiry.product} /></Form.Item>
          <Form.Item label="数量"><Input placeholder="例如：3000 kg / 1x40HQ" /></Form.Item>
          <Form.Item label="贸易条款"><Input placeholder="FOB / CIF / DDP" /></Form.Item>
          <Form.Item label="目的港/地址"><Input placeholder="例如：Hamburg, Germany" /></Form.Item>
          <Form.Item label="包装要求"><Input placeholder="中性包装 / OEM 彩盒 / 托盘" /></Form.Item>
          <Form.Item label="生成报价前检查">
            <Space orientation="vertical">
              <Checkbox>报价条件已补齐</Checkbox>
              <Checkbox>客户未与其他业务员撞单</Checkbox>
              <Checkbox>AI 草稿仅作为参考，报价由业务员确认</Checkbox>
            </Space>
          </Form.Item>
        </Form>
      </Drawer>
    </AppShell>
  )
}

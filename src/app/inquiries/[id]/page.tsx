'use client'

import { Alert, Button, Card, Col, Descriptions, Input, Row, Space, Steps, Tag, Typography } from 'antd'
import { ArrowLeftOutlined, RobotOutlined, SendOutlined } from '@ant-design/icons'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/common/PageHeader'
import { inquiries } from '@/frontend/mockData'

const { Paragraph, Text } = Typography
const { TextArea } = Input

export default function InquiryDetailPage() {
  const params = useParams<{ id: string }>()
  const inquiry = inquiries.find((item) => item.key === params.id) || inquiries[0]
  return <AppShell><Space direction="vertical" size={20} style={{ width: '100%' }}><PageHeader title={inquiry.inquiryNo} subtitle="询盘详情、原文翻译、AI 识别、回复草稿和转报价入口" actions={<Space><Link href="/inquiries"><Button icon={<ArrowLeftOutlined />}>返回询盘</Button></Link><Button icon={<RobotOutlined />}>重新分析</Button><Button type="primary" icon={<SendOutlined />}>确认发送</Button></Space>} /><Alert showIcon type="warning" message="AI 回复草稿不能自动发送；缺少数量、目的港、包装或付款条款时必须先补充确认。" /><Row gutter={[16, 16]}><Col xs={24} xl={15}><Card bordered={false} title="询盘信息"><Descriptions bordered column={2} size="small" items={[{ key: 'customer', label: '客户', children: inquiry.customer }, { key: 'country', label: '国家', children: inquiry.country }, { key: 'source', label: '来源', children: inquiry.source }, { key: 'product', label: '产品', children: inquiry.product }, { key: 'priority', label: '优先级', children: <Tag color="red">{inquiry.priority}</Tag> }, { key: 'score', label: 'AI 成交评分', children: `${inquiry.aiScore}%` }]} /></Card><Card bordered={false} title="AI 回复草稿" style={{ marginTop: 16 }}><TextArea rows={8} defaultValue={`Dear customer,\n\nThanks for your inquiry about ${inquiry.product}. We can provide FOB/CIF quotation after confirming quantity, color, packaging and destination port.\n\nBest regards,\nNexFab Sales Team`} /><Space style={{ marginTop: 12 }}><Button>保存草稿</Button><Button type="primary">人工确认后发送</Button></Space></Card></Col><Col xs={24} xl={9}><Card bordered={false} title="处理流程"><Steps direction="vertical" current={2} items={[{ title: '接收询盘' }, { title: 'AI 翻译/识别' }, { title: '业务员确认回复' }, { title: '生成报价' }, { title: '客户确认' }]} /></Card><Card bordered={false} title="AI 识别结果" style={{ marginTop: 16 }}><Paragraph><Text strong>产品：</Text>{inquiry.product}</Paragraph><Paragraph><Text strong>缺失信息：</Text>数量、目的港、包装方式、付款条款。</Paragraph><Paragraph><Text strong>建议：</Text>先补齐报价必要条件，再进入核价。</Paragraph></Card></Col></Row></Space></AppShell>
}

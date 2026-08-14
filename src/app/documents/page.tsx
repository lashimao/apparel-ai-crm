'use client'

import { Alert, Button, Card, Col, Row, Space, Table, Tag, Typography } from 'antd'
import Link from 'next/link'
import type { ColumnsType } from 'antd/es/table'
import { FileDoneOutlined, FileSearchOutlined } from '@ant-design/icons'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusTag } from '@/components/common/StatusTag'
import { documents } from '@/frontend/mockData'

const { Text } = Typography

const columns: ColumnsType<(typeof documents)[number]> = [
  { title: '单证号', dataIndex: 'docNo', render: (value, record) => <Space orientation="vertical" size={0}><Link href={`/documents/${record.key}`}><Text strong>{value}</Text></Link><Text type="secondary">{record.orderNo}</Text></Space> },
  { title: '类型', dataIndex: 'type', render: (type) => <Tag color="blue">{type}</Tag> },
  { title: '客户', dataIndex: 'customer' },
  { title: '状态', dataIndex: 'status', render: (status) => <StatusTag value={status} /> },
  { title: 'AI 生成', dataIndex: 'ai', render: (ai) => <Tag color={ai ? 'purple' : 'default'}>{ai ? '是' : '否'}</Tag> },
  { title: '负责人', dataIndex: 'owner' },
  { title: '动作', render: () => <Space><Button size="small">预览</Button><Button size="small" type="primary">人工校验</Button></Space> },
]

export default function DocumentsPage() {
  return <AppShell><Space orientation="vertical" size={20} style={{ width: '100%' }}><PageHeader title="单证中心" subtitle="PI、Sales Contract、Commercial Invoice、Packing List 模板生成与人工校验" actions={<Space><Button icon={<FileSearchOutlined />}>OCR 队列</Button><Button type="primary" icon={<FileDoneOutlined />}>生成单证</Button></Space>} /><Alert showIcon type="info" title="AI 可以生成单证草稿，但关键字段、金额、箱规、收货人和贸易条款必须人工校验。" /><Row gutter={[16, 16]}><Col xs={24} xl={17}><Card variant="borderless" title="单证列表"><Table columns={columns} dataSource={documents} scroll={{ x: 1000 }} /></Card></Col><Col xs={24} xl={7}><Card variant="borderless" title="模板库"><Space orientation="vertical" size={12} style={{ width: '100%' }}>{['PI 模板 v3', 'Sales Contract v2', 'Commercial Invoice v4', 'Packing List v2'].map((item) => <div className="crm-card-soft" key={item}><Text strong>{item}</Text><br /><Text type="secondary">启用中 · 支持版本审计</Text></div>)}</Space></Card></Col></Row></Space></AppShell>
}

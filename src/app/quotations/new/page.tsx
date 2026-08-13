'use client'

import { Alert, Button, Card, Col, Form, Input, InputNumber, Row, Select, Space, Table, Typography } from 'antd'
import { ArrowLeftOutlined, CalculatorOutlined, SaveOutlined } from '@ant-design/icons'
import Link from 'next/link'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/common/PageHeader'

const { Text } = Typography

export default function NewQuotationPage() {
  return <AppShell><Space direction="vertical" size={20} style={{ width: '100%' }}><PageHeader title="新建报价" subtitle="前端报价编辑器框架：客户、产品明细、费用、毛利、审批和发送前校验" actions={<Space><Link href="/quotations"><Button icon={<ArrowLeftOutlined />}>返回报价</Button></Link><Button icon={<CalculatorOutlined />}>核算毛利</Button><Button type="primary" icon={<SaveOutlined />}>保存草稿</Button></Space>} /><Alert showIcon type="info" message="当前为前端框架预览，数据暂不落库。后续接后台时保存草稿会创建 quotation、items、approval、audit_log。" /><Row gutter={[16, 16]}><Col xs={24} xl={16}><Card bordered={false} title="基础信息"><Form layout="vertical"><Row gutter={16}><Col span={12}><Form.Item label="客户"><Select placeholder="选择客户" options={[{ label: 'Pacific Buildmart', value: 'Pacific Buildmart' }, { label: 'Atlas Import LLC', value: 'Atlas Import LLC' }]} /></Form.Item></Col><Col span={12}><Form.Item label="贸易条款"><Select options={['FOB', 'CIF', 'DDP', 'EXW'].map((item) => ({ label: item, value: item }))} /></Form.Item></Col><Col span={12}><Form.Item label="币种"><Select defaultValue="USD" options={[{ label: 'USD', value: 'USD' }, { label: 'CNY', value: 'CNY' }]} /></Form.Item></Col><Col span={12}><Form.Item label="有效天数"><InputNumber defaultValue={14} style={{ width: '100%' }} /></Form.Item></Col></Row></Form></Card><Card bordered={false} title="产品明细" style={{ marginTop: 16 }}><Table pagination={false} dataSource={[{ key: '1', product: 'PLA Filament', qty: 1000, cost: 5.2, price: 6.8 }]} columns={[{ title: '产品', dataIndex: 'product', render: (v) => <Input defaultValue={v} /> }, { title: '数量', dataIndex: 'qty', render: (v) => <InputNumber defaultValue={v} /> }, { title: '成本', dataIndex: 'cost', render: (v) => <InputNumber defaultValue={v} prefix="$" /> }, { title: '报价', dataIndex: 'price', render: (v) => <InputNumber defaultValue={v} prefix="$" /> }]} /></Card></Col><Col xs={24} xl={8}><Card bordered={false} title="报价硬规则"><Space direction="vertical"><Text>1. 未锁价明细不能发送。</Text><Text>2. 低毛利报价必须审批。</Text><Text>3. AI 只能建议价格，不能决定正式价格。</Text><Text>4. 发送前必须人工确认。</Text></Space></Card></Col></Row></Space></AppShell>
}

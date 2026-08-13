'use client'

import { Button, Card, Col, Progress, Row, Segmented, Space, Statistic, Table, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { BarChartOutlined } from '@ant-design/icons'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/common/PageHeader'

const { Text } = Typography

const rows = [
  { key: '1', metric: '询盘转报价率', value: '39.1%', target: '42%', gap: '-2.9%', owner: '销售主管' },
  { key: '2', metric: '报价转订单率', value: '38.8%', target: '35%', gap: '+3.8%', owner: '管理层' },
  { key: '3', metric: '平均毛利率', value: '22.8%', target: '20%', gap: '+2.8%', owner: '管理层' },
  { key: '4', metric: '准时回款率', value: '76%', target: '85%', gap: '-9%', owner: '财务' },
]
const columns: ColumnsType<(typeof rows)[number]> = [{ title: '指标', dataIndex: 'metric' }, { title: '当前值', dataIndex: 'value' }, { title: '目标', dataIndex: 'target' }, { title: '差距', dataIndex: 'gap' }, { title: '责任方', dataIndex: 'owner' }]

export default function AnalyticsPage() {
  return <AppShell><Space direction="vertical" size={20} style={{ width: '100%' }}><PageHeader title="经营分析" subtitle="销售漏斗、客户价值、报价毛利、订单交付、回款风险和 AI 效能" actions={<Space><Segmented defaultValue="month" options={[{ label: '周', value: 'week' }, { label: '月', value: 'month' }, { label: '季', value: 'quarter' }]} /><Button type="primary" icon={<BarChartOutlined />}>生成报告</Button></Space>} /><Row gutter={[16, 16]}><Col xs={24} md={6}><Card bordered={false}><Statistic title="销售额" value={328560} suffix="USD" /><Text type="secondary">同比 +18%</Text></Card></Col><Col xs={24} md={6}><Card bordered={false}><Statistic title="毛利率" value={22.8} suffix="%" /><Text type="secondary">高于底线 4.8%</Text></Card></Col><Col xs={24} md={6}><Card bordered={false}><Statistic title="回款达成" value={76} suffix="%" /><Text type="secondary">低于目标 9%</Text></Card></Col><Col xs={24} md={6}><Card bordered={false}><Statistic title="AI 节省工时" value={38} suffix="小时" /><Text type="secondary">本周估算</Text></Card></Col></Row><Row gutter={[16, 16]}><Col xs={24} xl={15}><Card bordered={false} title="核心指标看板"><Table columns={columns} dataSource={rows} pagination={false} /></Card></Col><Col xs={24} xl={9}><Card bordered={false} title="风险归因"><Space direction="vertical" style={{ width: '100%' }}><Text>回款逾期主要来自尾款节点</Text><Progress percent={64} status="exception" /><Text>低毛利主要来自 DDP 运费波动</Text><Progress percent={46} strokeColor="#faad14" /><Text>询盘响应延迟集中在欧洲时区</Text><Progress percent={32} /></Space></Card></Col></Row></Space></AppShell>
}

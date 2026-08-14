'use client'

import { Button, Card, Col, Input, Row, Space, Table, Tag, Typography } from 'antd'
import Link from 'next/link'
import type { ColumnsType } from 'antd/es/table'
import { ExportOutlined, PlusOutlined, SearchOutlined, TeamOutlined } from '@ant-design/icons'
import { AppShell } from '@/components/layout/AppShell'
import { KpiCard } from '@/components/common/KpiCard'
import { PageHeader } from '@/components/common/PageHeader'
import { customers } from '@/frontend/mockData'

const { Text } = Typography

const columns: ColumnsType<(typeof customers)[number]> = [
  { title: '客户', dataIndex: 'company', render: (value, record) => <Space orientation="vertical" size={0}><Link href={`/customers/${record.key}`}><Text strong>{value}</Text></Link><Text type="secondary">{record.country} · {record.source}</Text></Space> },
  { title: '等级', dataIndex: 'level', render: (level) => <Tag color={level === 'A' ? 'green' : level === 'B' ? 'blue' : 'gold'}>{level} 级</Tag> },
  { title: '负责人', dataIndex: 'owner' },
  { title: '阶段', dataIndex: 'stage' },
  { title: '累计价值', dataIndex: 'value' },
  { title: '下步动作', dataIndex: 'nextAction' },
  { title: '风险', dataIndex: 'risk', render: (risk) => <Tag color={risk.includes('逾期') || risk.includes('低') ? 'red' : 'orange'}>{risk}</Tag> },
  { title: '最近联系', dataIndex: 'lastContact' },
]

export default function CustomersPage() {
  return (
    <AppShell>
      <Space orientation="vertical" size={20} style={{ width: '100%' }}>
        <PageHeader title="客户中心" subtitle="客户档案、联系人、分级、查重、公海池和跟进计划" actions={<Space><Input prefix={<SearchOutlined />} placeholder="搜索客户/国家/负责人" /><Button icon={<ExportOutlined />}>导出</Button><Button type="primary" icon={<PlusOutlined />}>新建客户</Button></Space>} />
        <Row gutter={[16, 16]}><Col xs={24} md={6}><KpiCard title="总客户" value={128} suffix="家" trend="A/B 级占比 46%" prefix={<TeamOutlined />} /></Col><Col xs={24} md={6}><KpiCard title="本周新增" value={18} suffix="家" trend="社媒来源 7 家" color="#0f6e56" /></Col><Col xs={24} md={6}><KpiCard title="待查重" value={9} suffix="条" trend="3 条疑似撞单" color="#fa8c16" /></Col><Col xs={24} md={6}><KpiCard title="高风险客户" value={6} suffix="家" trend="逾期/低毛利/交期" color="#cf1322" /></Col></Row>
        <Row gutter={[16, 16]}>
          <Col xs={24} xl={17}><Card variant="borderless" title="客户列表" extra={<Space><Button>公海池</Button><Button>批量分配</Button></Space>}><Table columns={columns} dataSource={customers} scroll={{ x: 1100 }} /></Card></Col>
          <Col xs={24} xl={7}><Card variant="borderless" title="客户运营规则"><Space orientation="vertical" size={12}><div className="crm-card-soft"><Text strong>查重优先</Text><br /><Text type="secondary">创建客户、询盘建档、社媒线索转客户前先查公司名、邮箱、WhatsApp、域名。</Text></div><div className="crm-card-soft"><Text strong>防撞单</Text><br /><Text type="secondary">同客户归属冲突时先冻结分配，交由销售主管确认。</Text></div><div className="crm-card-soft"><Text strong>AI 边界</Text><br /><Text type="secondary">AI 只能生成客户摘要和风险提示，不可自动覆盖关键资料。</Text></div></Space></Card></Col>
        </Row>
      </Space>
    </AppShell>
  )
}

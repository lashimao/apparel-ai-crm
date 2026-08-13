'use client'

import { Alert, Button, Card, Col, Progress, Row, Segmented, Space, Statistic, Steps, Tag, Timeline, Typography } from 'antd'
import { AuditOutlined, BankOutlined, DollarOutlined, ExportOutlined, FileDoneOutlined, MailOutlined, ShoppingCartOutlined, SwapOutlined } from '@ant-design/icons'
import { AppShell } from '@/components/layout/AppShell'
import { KpiCard } from '@/components/common/KpiCard'
import { PageHeader } from '@/components/common/PageHeader'
import { salesCashBoard, salesCashMilestones } from '@/frontend/mockData'

const { Paragraph, Text, Title } = Typography

function iconForColumn(key: string) {
  if (key === 'inquiry') return <MailOutlined />
  if (key === 'quotation') return <DollarOutlined />
  if (key === 'order') return <ShoppingCartOutlined />
  return <BankOutlined />
}

export default function SalesCashPage() {
  return (
    <AppShell>
      <Space direction="vertical" size={20} style={{ width: '100%' }}>
        <PageHeader
          title="销售到回款闭环看板"
          subtitle="把询盘、报价、审批、订单、单证、回款放在同一张业务地图里，优先暴露阻塞点。"
          actions={<Space wrap><Segmented defaultValue="all" options={[{ label: '全部', value: 'all' }, { label: '我负责', value: 'mine' }, { label: '高风险', value: 'risk' }]} /><Button icon={<ExportOutlined />}>导出</Button><Button type="primary" icon={<SwapOutlined />}>新建闭环任务</Button></Space>}
        />

        <Alert showIcon type="warning" message="闭环看板只展示和推动业务动作；AI 不得自动发送报价、确认订单或核销回款。" />

        <Row gutter={[16, 16]}>
          <Col xs={24} md={6}><KpiCard title="询盘待补字段" value={9} suffix="项" trend="影响 4 份报价" prefix={<MailOutlined />} color="#1677ff" /></Col>
          <Col xs={24} md={6}><KpiCard title="待审批报价" value={2} suffix="份" trend="低毛利/账期异常" prefix={<AuditOutlined />} color="#fa8c16" /></Col>
          <Col xs={24} md={6}><KpiCard title="待发货订单" value={3} suffix="单" trend="2 单缺单证" prefix={<FileDoneOutlined />} color="#722ed1" /></Col>
          <Col xs={24} md={6}><KpiCard title="逾期回款" value={18200} suffix="USD" trend="尾款逾期" prefix={<BankOutlined />} color="#cf1322" /></Col>
        </Row>

        <Row gutter={[16, 16]} align="stretch">
          {salesCashBoard.map((column) => (
            <Col xs={24} md={12} xl={6} key={column.key}>
              <Card
                bordered={false}
                title={<Space>{iconForColumn(column.key)} {column.title}</Space>}
                extra={<Tag color={column.color}>{column.items.length}</Tag>}
                style={{ height: '100%' }}
              >
                <Paragraph type="secondary">{column.summary}</Paragraph>
                <Space direction="vertical" size={12} style={{ width: '100%' }}>
                  {column.items.map((item) => (
                    <div key={item.key} className="crm-card-soft">
                      <Space direction="vertical" size={6} style={{ width: '100%' }}>
                        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                          <Text strong>{item.no}</Text>
                          <Tag color={item.risk.includes('逾期') || item.risk.includes('低') ? 'red' : 'orange'}>{item.risk}</Tag>
                        </Space>
                        <Text>{item.customer}</Text>
                        <Text type="secondary">{item.amount} · {item.owner}</Text>
                        <div>
                          <Text type="secondary">下一步：</Text><Text>{item.next}</Text>
                        </div>
                      </Space>
                    </div>
                  ))}
                </Space>
              </Card>
            </Col>
          ))}
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} xl={15}>
            <Card bordered={false} title="闭环里程碑">
              <Steps
                current={2}
                items={salesCashMilestones.map((item) => ({ title: item.title, description: item.owner }))}
              />
              <Timeline style={{ marginTop: 24 }} items={salesCashMilestones.map((item) => ({ children: <Space direction="vertical" size={0}><Text strong>{item.title}</Text><Text type="secondary">{item.desc}</Text></Space> }))} />
            </Card>
          </Col>
          <Col xs={24} xl={9}>
            <Card bordered={false} title="阻塞归因">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text>低毛利报价</Text><Progress percent={42} status="exception" />
                <Text>客户资料缺失</Text><Progress percent={35} strokeColor="#faad14" />
                <Text>单证未校验</Text><Progress percent={28} strokeColor="#722ed1" />
                <Text>水单待核销</Text><Progress percent={38} strokeColor="#52c41a" />
              </Space>
            </Card>
            <Card bordered={false} title="今日建议" style={{ marginTop: 16 }}>
              <Space direction="vertical" size={12}>
                <div className="crm-card-soft"><Text strong>先处理审批</Text><br /><Text type="secondary">低毛利报价会阻塞后续发送和转订单。</Text></div>
                <div className="crm-card-soft"><Text strong>再处理尾款</Text><br /><Text type="secondary">EuroNova 尾款逾期影响订单完结。</Text></div>
                <div className="crm-card-soft"><Text strong>最后补单证</Text><br /><Text type="secondary">待发货订单需先完成 CI / PL 人工校验。</Text></div>
              </Space>
            </Card>
          </Col>
        </Row>
      </Space>
    </AppShell>
  )
}

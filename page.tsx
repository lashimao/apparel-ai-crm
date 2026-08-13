'use client'

import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Progress,
  Row,
  Segmented,
  Space,
  Statistic,
  Table,
  Tag,
  Timeline,
  Typography,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  FileSearchOutlined,
  FundProjectionScreenOutlined,
  MailOutlined,
  PlusOutlined,
  RobotOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  SendOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  WarningOutlined,
} from '@ant-design/icons'

const { Text, Title } = Typography

type InquiryRecord = {
  key: string
  inquiryNo: string
  customer: string
  country: string
  source: string
  priority: 'urgent' | 'high' | 'normal'
  status: string
  aiScore: number
  owner: string
}

type CustomerRecord = {
  key: string
  company: string
  level: 'A' | 'B' | 'C'
  country: string
  value: string
  nextAction: string
  risk: string
}


type SalesCashRecord = {
  key: string
  node: 'quote' | 'order' | 'payment'
  no: string
  customer: string
  amount: string
  status: string
  risk: string
  owner: string
}

const funnelSteps = [
  { label: '新询盘', value: 46, color: '#1677ff' },
  { label: '已分配', value: 31, color: '#13c2c2' },
  { label: '已报价', value: 18, color: '#faad14' },
  { label: '已成交', value: 7, color: '#52c41a' },
]

const inquiryColumns: ColumnsType<InquiryRecord> = [
  {
    title: '询盘',
    dataIndex: 'inquiryNo',
    render: (value, record) => (
      <Space direction="vertical" size={0}>
        <Text strong>{value}</Text>
        <Text type="secondary">{record.customer}</Text>
      </Space>
    ),
  },
  {
    title: '国家/来源',
    render: (_, record) => (
      <Space direction="vertical" size={0}>
        <Text>{record.country}</Text>
        <Text type="secondary">{record.source}</Text>
      </Space>
    ),
  },
  {
    title: '优先级',
    dataIndex: 'priority',
    render: (priority) => {
      const color = priority === 'urgent' ? 'red' : priority === 'high' ? 'orange' : 'blue'
      const label = priority === 'urgent' ? '紧急' : priority === 'high' ? '高' : '普通'
      return <Tag color={color}>{label}</Tag>
    },
  },
  {
    title: 'AI 评分',
    dataIndex: 'aiScore',
    render: (score) => <Progress percent={score} size="small" strokeColor="#1677ff" />,
  },
  {
    title: '负责人',
    dataIndex: 'owner',
  },
  {
    title: '动作',
    render: () => (
      <Button size="small" type="primary" icon={<RobotOutlined />}>
        生成回复
      </Button>
    ),
  },
]

const inquiryData: InquiryRecord[] = [
  {
    key: '1',
    inquiryNo: 'INQ-2026-0813-018',
    customer: 'Nordic Retail Group',
    country: 'Germany',
    source: 'Alibaba',
    priority: 'urgent',
    status: 'new',
    aiScore: 92,
    owner: 'Lina',
  },
  {
    key: '2',
    inquiryNo: 'INQ-2026-0813-011',
    customer: 'Andes Supply Co.',
    country: 'Chile',
    source: 'Website',
    priority: 'high',
    status: 'assigned',
    aiScore: 84,
    owner: 'Marco',
  },
  {
    key: '3',
    inquiryNo: 'INQ-2026-0812-044',
    customer: 'Gulf Star Trading',
    country: 'UAE',
    source: 'WhatsApp',
    priority: 'normal',
    status: 'quoted',
    aiScore: 71,
    owner: 'Anna',
  },
]

const customerColumns: ColumnsType<CustomerRecord> = [
  {
    title: '客户',
    dataIndex: 'company',
    render: (value, record) => (
      <Space>
        <Badge color={record.level === 'A' ? '#52c41a' : record.level === 'B' ? '#1677ff' : '#faad14'} />
        <Space direction="vertical" size={0}>
          <Text strong>{value}</Text>
          <Text type="secondary">{record.country} · {record.value}</Text>
        </Space>
      </Space>
    ),
  },
  {
    title: '下步动作',
    dataIndex: 'nextAction',
  },
  {
    title: '风险',
    dataIndex: 'risk',
    render: (value) => <Tag color={value === '应收逾期' ? 'red' : 'gold'}>{value}</Tag>,
  },
]

const customerData: CustomerRecord[] = [
  {
    key: '1',
    company: 'Atlas Import LLC',
    level: 'A',
    country: 'United States',
    value: 'USD 186k',
    nextAction: '确认 40HQ 生产排期',
    risk: '交期逼近',
  },
  {
    key: '2',
    company: 'Pacific Buildmart',
    level: 'B',
    country: 'Australia',
    value: 'USD 73k',
    nextAction: '复核 DDP 报价毛利',
    risk: '毛利偏低',
  },
  {
    key: '3',
    company: 'EuroNova GmbH',
    level: 'A',
    country: 'Germany',
    value: 'USD 142k',
    nextAction: '催收尾款水单',
    risk: '应收逾期',
  },
]

const aiTasks = [
  { title: '询盘回复草稿', desc: '4 条高优先级询盘等待业务员确认后发送', status: '实时', icon: <MailOutlined /> },
  { title: '报价建议', desc: '2 份报价低于历史均价，需要复核毛利底线', status: '需人工确认', icon: <DollarOutlined /> },
  { title: '单证 OCR', desc: '7 份 PI / PL 已进入队列，完成后通知审核', status: '队列', icon: <FileSearchOutlined /> },
  { title: '客户评分', desc: '批量更新 128 个客户画像与流失风险', status: '本地', icon: <TeamOutlined /> },
]


const salesCashColumns: ColumnsType<SalesCashRecord> = [
  {
    title: '节点',
    dataIndex: 'node',
    render: (node) => {
      const map = { quote: ['报价', 'blue'], order: ['订单', 'purple'], payment: ['回款', 'green'] } as const
      const [label, color] = map[node as keyof typeof map]
      return <Tag color={color}>{label}</Tag>
    },
  },
  {
    title: '单号/客户',
    render: (_, record) => (
      <Space direction="vertical" size={0}>
        <Text strong>{record.no}</Text>
        <Text type="secondary">{record.customer}</Text>
      </Space>
    ),
  },
  { title: '金额', dataIndex: 'amount' },
  { title: '状态', dataIndex: 'status' },
  {
    title: '风险',
    dataIndex: 'risk',
    render: (risk) => <Tag color={risk.includes('逾期') || risk.includes('低') ? 'red' : 'gold'}>{risk}</Tag>,
  },
  { title: '负责人', dataIndex: 'owner' },
]

const salesCashData: SalesCashRecord[] = [
  { key: '1', node: 'quote', no: 'QT-2026-0813-006', customer: 'Pacific Buildmart', amount: 'USD 42,800', status: '待毛利审批', risk: '毛利偏低', owner: 'Marco' },
  { key: '2', node: 'order', no: 'SO-2026-0809-003', customer: 'Atlas Import LLC', amount: 'USD 86,400', status: '待收定金', risk: '交期锁定前置', owner: 'Lina' },
  { key: '3', node: 'payment', no: 'PAY-2026-0801-014', customer: 'EuroNova GmbH', amount: 'USD 18,200', status: '待核销', risk: '尾款逾期', owner: 'Finance' },
]

export default function DashboardPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#f5f7fb', padding: 24 }}>
      <Space direction="vertical" size={20} style={{ width: '100%' }}>
        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col xs={24} lg={14}>
            <Space direction="vertical" size={4}>
              <Title level={2} style={{ margin: 0 }}>外贸 AI CRM 工作台</Title>
              <Text type="secondary">客户开发、询盘跟进、报价审核、订单交付和 AI 任务统一入口</Text>
            </Space>
          </Col>
          <Col xs={24} lg={10} style={{ textAlign: 'right' }}>
            <Space wrap>
              <Segmented
                defaultValue="today"
                options={[
                  { label: '今日', value: 'today' },
                  { label: '本周', value: 'week' },
                  { label: '本月', value: 'month' },
                ]}
              />
              <Button icon={<SearchOutlined />}>查重</Button>
              <Button type="primary" icon={<PlusOutlined />}>新建询盘</Button>
            </Space>
          </Col>
        </Row>

        <Alert
          showIcon
          type="warning"
          icon={<WarningOutlined />}
          message="有 2 份报价触发毛利底线提醒，AI 建议只能作为草稿，发送前必须人工确认。"
          action={<Button size="small">查看报价</Button>}
        />

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} xl={6}>
            <Card bordered={false}>
              <Statistic title="活跃客户" value={128} prefix={<TeamOutlined />} valueStyle={{ color: '#185fa5' }} />
              <Text type="secondary">A/B 级客户占比 46%</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <Card bordered={false}>
              <Statistic title="待处理询盘" value={12} prefix={<MailOutlined />} valueStyle={{ color: '#0f6e56' }} />
              <Text type="secondary">紧急询盘 3 条</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <Card bordered={false}>
              <Statistic title="进行中订单" value={8} prefix={<ShoppingCartOutlined />} valueStyle={{ color: '#854f0b' }} />
              <Text type="secondary">2 单交期需预警</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <Card bordered={false}>
              <Statistic title="本月销售额" value={328560} precision={0} prefix={<DollarOutlined />} suffix="USD" valueStyle={{ color: '#534ab7' }} />
              <Text type="secondary">毛利率 22.8%</Text>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} xl={15}>
            <Card
              bordered={false}
              title={<Space><FundProjectionScreenOutlined /> 询盘转化漏斗</Space>}
              extra={<Button type="link">进入分析</Button>}
            >
              <Row gutter={[16, 16]}>
                {funnelSteps.map((step) => (
                  <Col xs={12} md={6} key={step.label}>
                    <div style={{ background: '#fbfcff', border: '1px solid #eef1f6', borderRadius: 8, padding: 16 }}>
                      <Space direction="vertical" size={6} style={{ width: '100%' }}>
                        <Text type="secondary">{step.label}</Text>
                        <Title level={3} style={{ color: step.color, margin: 0 }}>{step.value}</Title>
                        <Progress percent={Math.round((step.value / funnelSteps[0].value) * 100)} strokeColor={step.color} showInfo={false} />
                      </Space>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>

          <Col xs={24} xl={9}>
            <Card bordered={false} title={<Space><SafetyCertificateOutlined /> 系统状态</Space>}>
              <Timeline
                items={[
                  { dot: <CheckCircleOutlined style={{ color: '#52c41a' }} />, children: 'PostgreSQL + pgvector 已纳入单机部署规划' },
                  { dot: <CheckCircleOutlined style={{ color: '#52c41a' }} />, children: 'Redis / BullMQ 用于批量 AI 任务队列' },
                  { dot: <ClockCircleOutlined style={{ color: '#faad14' }} />, children: 'OpenAI / Ollama 路由层等待环境变量配置' },
                  { dot: <WarningOutlined style={{ color: '#ff4d4f' }} />, children: '报价锁价、审批、附件和审计日志已纳入数据模型，需随 P0 迁移落库' },
                ]}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} xl={15}>
            <Card bordered={false} title={<Space><MailOutlined /> 今日重点询盘</Space>} extra={<Button icon={<SendOutlined />}>批量分配</Button>}>
              <Table columns={inquiryColumns} dataSource={inquiryData} pagination={false} scroll={{ x: 900 }} />
            </Card>
          </Col>

          <Col xs={24} xl={9}>
            <Card bordered={false} title={<Space><RobotOutlined /> AI 审核队列</Space>}>
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                {aiTasks.map((task) => (
                  <div key={task.title} style={{ background: '#fbfcff', border: '1px solid #eef1f6', borderRadius: 8, padding: 12 }}>
                    <Row align="middle" justify="space-between" gutter={12}>
                      <Col flex="36px">
                        <Button shape="circle" icon={task.icon} />
                      </Col>
                      <Col flex="auto">
                        <Text strong>{task.title}</Text>
                        <br />
                        <Text type="secondary">{task.desc}</Text>
                      </Col>
                      <Col>
                        <Tag color={task.status === '实时' ? 'green' : task.status === '需人工确认' ? 'red' : task.status === '云端' ? 'blue' : 'purple'}>{task.status}</Tag>
                      </Col>
                    </Row>
                  </div>
                ))}
              </Space>
            </Card>
          </Col>
        </Row>



        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Card
              bordered={false}
              title={<Space><DollarOutlined /> 报价 → 订单 → 回款闭环待办</Space>}
              extra={<Button type="link">查看销售到回款看板</Button>}
            >
              <Alert
                style={{ marginBottom: 16 }}
                type="warning"
                showIcon
                message="正式价格、低毛利审批、报价发送和回款核销均不得由 AI 自动生效，必须进入人工确认/审批链。"
              />
              <Table columns={salesCashColumns} dataSource={salesCashData} pagination={false} scroll={{ x: 900 }} />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} xl={15}>
            <Card bordered={false} title={<Space><TeamOutlined /> 关键客户提醒</Space>}>
              <Table columns={customerColumns} dataSource={customerData} pagination={false} />
            </Card>
          </Col>
          <Col xs={24} xl={9}>
            <Card bordered={false} title={<Space><ThunderboltOutlined /> 下一步优先事项</Space>}>
              <Space direction="vertical" size={12}>
                <Alert type="info" showIcon message="P0：认证、客户、询盘、报价、订单主流程先闭环。" />
                <Alert type="success" showIcon message="P1：接入邮件/WhatsApp/平台消息，统一沉淀为渠道消息。" />
                <Alert type="warning" showIcon message="P2：AI 生成内容统一进入人工审核，不自动生效。" />
              </Space>
            </Card>
          </Col>
        </Row>
      </Space>
    </main>
  )
}

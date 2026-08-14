'use client'

import { Alert, Button, Card, Col, Descriptions, Row, Space, Steps, Tag, Typography } from 'antd'
import { ArrowLeftOutlined, CheckCircleOutlined, DownloadOutlined, FileDoneOutlined } from '@ant-design/icons'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusTag } from '@/components/common/StatusTag'
import { documents } from '@/frontend/mockData'

const { Paragraph, Text } = Typography

export default function DocumentDetailPage() {
  const params = useParams<{ id: string }>()
  const doc = documents.find((item) => item.key === params.id) || documents[0]
  return (
    <AppShell>
      <Space orientation="vertical" size={20} style={{ width: '100%' }}>
        <PageHeader
          title={doc.docNo}
          subtitle="单证详情、模板版本、AI 生成内容、人工校验与归档"
          actions={<Space><Link href="/documents"><Button icon={<ArrowLeftOutlined />}>返回单证</Button></Link><Button icon={<DownloadOutlined />}>下载 PDF</Button><Button type="primary" icon={<CheckCircleOutlined />}>人工校验通过</Button></Space>}
        />
        <Alert showIcon type="warning" title="单证可由 AI 生成草稿，但金额、箱规、贸易条款、收发货人、唛头必须人工校验。" />
        <Row gutter={[16, 16]}>
          <Col xs={24} xl={15}>
            <Card variant="borderless" title="单证信息">
              <Descriptions bordered size="small" column={2} items={[{ key: 'type', label: '类型', children: <Tag color="blue">{doc.type}</Tag> }, { key: 'order', label: '订单号', children: doc.orderNo }, { key: 'customer', label: '客户', children: doc.customer }, { key: 'status', label: '状态', children: <StatusTag value={doc.status} /> }, { key: 'ai', label: 'AI 生成', children: <Tag color={doc.ai ? 'purple' : 'default'}>{doc.ai ? '是' : '否'}</Tag> }, { key: 'owner', label: '负责人', children: doc.owner }]} />
            </Card>
            <Card variant="borderless" title="单证预览" style={{ marginTop: 16 }}>
              <div className="crm-card-soft" style={{ minHeight: 360 }}>
                <Space orientation="vertical" size={12} style={{ width: '100%' }}>
                  <Text strong>{doc.type === 'PI' ? 'PROFORMA INVOICE' : doc.type === 'CI' ? 'COMMERCIAL INVOICE' : 'PACKING LIST'}</Text>
                  <Text>Document No: {doc.docNo}</Text>
                  <Text>Order No: {doc.orderNo}</Text>
                  <Text>Buyer: {doc.customer}</Text>
                  <Paragraph className="crm-muted">这里是单证 PDF/HTML 预览区域。后续接模板引擎后，可展示完整 PI、Sales Contract、CI、PL 内容。</Paragraph>
                </Space>
              </div>
            </Card>
          </Col>
          <Col xs={24} xl={9}>
            <Card variant="borderless" title="校验流程"><Steps orientation="vertical" current={2} items={[{ title: '选择模板' }, { title: '订单数据填充' }, { title: 'AI 草稿/OCR' }, { title: '人工校验' }, { title: '归档/发送' }]} /></Card>
            <Card variant="borderless" title={<Space><FileDoneOutlined /> 校验清单</Space>} style={{ marginTop: 16 }}><Space orientation="vertical"><Text>金额与币种一致</Text><Text>箱规/毛净重完整</Text><Text>收发货人准确</Text><Text>贸易条款和目的港准确</Text><Text>唛头和备注无误</Text></Space></Card>
          </Col>
        </Row>
      </Space>
    </AppShell>
  )
}

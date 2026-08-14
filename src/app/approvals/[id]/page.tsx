'use client'

import { Alert, Button, Card, Checkbox, Col, Descriptions, Form, Input, Modal, Row, Space, Tag, Timeline, Typography } from 'antd'
import { ArrowLeftOutlined, CheckOutlined, CloseOutlined, FileSearchOutlined } from '@ant-design/icons'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusTag } from '@/components/common/StatusTag'
import { NextActionPanel } from '@/components/common/NextActionPanel'
import { approvalAuditLogs, approvalChecklist, approvals } from '@/frontend/mockData'

const { Paragraph, Text } = Typography

export default function ApprovalDetailPage() {
  const params = useParams<{ id: string }>()
  const [decision, setDecision] = useState<'approve' | 'reject' | null>(null)
  const approval = approvals.find((item) => item.key === params.id) || approvals[0]
  const logs = approvalAuditLogs.filter((item) => item.approvalKey === approval.key)
  const isLowProfit = approval.type.includes('毛利')

  return (
    <AppShell>
      <Space orientation="vertical" size={20} style={{ width: '100%' }}>
        <PageHeader
          title={`${approval.type} · ${approval.refNo}`}
          subtitle="审批详情、申请原因、规则命中、审计日志和人工决策"
          actions={(
            <Space wrap>
              <Link href="/approvals"><Button icon={<ArrowLeftOutlined />}>返回审批</Button></Link>
              <Button icon={<FileSearchOutlined />}>查看关联单据</Button>
              <Button danger icon={<CloseOutlined />} onClick={() => setDecision('reject')}>拒绝</Button>
              <Button type="primary" icon={<CheckOutlined />} onClick={() => setDecision('approve')}>通过</Button>
            </Space>
          )}
        />

        <Alert showIcon type="warning" title="审批通过只解除流程阻断，不代表系统会自动发送报价、确认订单或改变回款状态。" />

        <Row gutter={[16, 16]}>
          <Col xs={24} xl={16}>
            <Card variant="borderless" title="审批申请">
              <Descriptions bordered size="small" column={2} items={[
                { key: 'type', label: '审批类型', children: approval.type },
                { key: 'refNo', label: '关联单号', children: approval.refNo },
                { key: 'customer', label: '客户', children: approval.customer },
                { key: 'requester', label: '申请人', children: approval.requester },
                { key: 'amount', label: '金额', children: approval.amount },
                { key: 'priority', label: '优先级', children: <Tag color={approval.priority === 'high' ? 'red' : 'blue'}>{approval.priority === 'high' ? '高' : '普通'}</Tag> },
                { key: 'status', label: '状态', children: <StatusTag value={approval.status} /> },
                { key: 'rule', label: '命中规则', children: isLowProfit ? '低于毛利底线，必须主管审批' : '异常账期影响现金流，必须管理层确认' },
                { key: 'reason', label: '申请原因', span: 2, children: approval.reason },
              ]} />
            </Card>

            <Card variant="borderless" title="审批检查清单" style={{ marginTop: 16 }}>
              <Space orientation="vertical" size={10}>
                {approvalChecklist.map((item) => (
                  <Checkbox key={item.key} defaultChecked={item.required}>{item.label}{item.required ? <Text type="danger"> *</Text> : null}</Checkbox>
                ))}
              </Space>
            </Card>

            <Card variant="borderless" title="审批备注" style={{ marginTop: 16 }}>
              <Input.TextArea rows={5} defaultValue={isLowProfit ? '建议要求业务员拆分 DDP 运费与本地派送成本；如保留该报价，需要记录客户策略原因。' : '建议明确尾款延期的信用风险、发货阻断条件和管理层授权范围。'} />
            </Card>
          </Col>

          <Col xs={24} xl={8}>
            <NextActionPanel items={[
              { key: 'a1', title: '复核规则命中原因', desc: approval.reason, owner: '审批人', level: approval.priority === 'high' ? 'risk' : 'warning' },
              { key: 'a2', title: '确认通过后的下一步', desc: '通过后仍需申请人手动发送报价或推进订单。', owner: approval.requester, level: 'normal' },
              { key: 'a3', title: '保留审计备注', desc: '审批意见将作为后续报价、订单、回款追溯依据。', owner: '系统', level: 'warning' },
            ]} />

            <Card variant="borderless" title="审计日志" style={{ marginTop: 16 }}>
              <Timeline items={(logs.length ? logs : approvalAuditLogs.slice(0, 2)).map((item) => ({
                color: item.action.includes('规则') ? 'orange' : item.action.includes('提交') ? 'blue' : 'gray',
                content: <Space orientation="vertical" size={2}><Text strong>{item.action} · {item.actor}</Text><Text type="secondary">{item.time}</Text><Paragraph style={{ marginBottom: 0 }}>{item.note}</Paragraph></Space>,
              }))} />
            </Card>
          </Col>
        </Row>
      </Space>

      <Modal
        title={decision === 'approve' ? '确认审批通过' : '确认拒绝审批'}
        open={Boolean(decision)}
        onCancel={() => setDecision(null)}
        okText={decision === 'approve' ? '通过审批' : '拒绝审批'}
        cancelText="取消"
        okButtonProps={{ danger: decision === 'reject' }}
        onOk={() => setDecision(null)}
      >
        <Space orientation="vertical" size={12} style={{ width: '100%' }}>
          <Alert showIcon type={decision === 'approve' ? 'info' : 'warning'} title={decision === 'approve' ? '通过后仍需人工执行下一步动作。' : '拒绝后需写明原因并通知申请人。'} />
          <Form layout="vertical">
            <Form.Item label="审批意见"><Input.TextArea rows={4} placeholder="请输入审批意见、风险说明或补充条件" /></Form.Item>
          </Form>
        </Space>
      </Modal>
    </AppShell>
  )
}

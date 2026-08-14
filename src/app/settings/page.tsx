'use client'

import { Alert, Button, Card, Col, Row, Segmented, Space, Switch, Table, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { SettingOutlined, TeamOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/common/PageHeader'
import { riskRules, roleOptions, rolePermissionMatrix } from '@/frontend/mockData'

const { Text, Paragraph } = Typography

type RiskRule = (typeof riskRules)[number]
type PermissionRow = (typeof rolePermissionMatrix)[number]

const ruleColumns: ColumnsType<RiskRule> = [
  { title: '规则', dataIndex: 'rule' },
  { title: '责任方', dataIndex: 'owner' },
  { title: '动作', dataIndex: 'action', render: (action) => <Tag color="blue">{action}</Tag> },
  { title: '启用', dataIndex: 'enabled', render: (enabled) => <Switch defaultChecked={enabled} /> },
]

const permissionColumns: ColumnsType<PermissionRow> = [
  { title: '模块', dataIndex: 'module', fixed: 'left', width: 110, render: (value) => <Text strong>{value}</Text> },
  { title: '超级管理员', dataIndex: 'admin', render: (value) => <Tag color="red">{value}</Tag> },
  { title: '管理层', dataIndex: 'management', render: (value) => <Tag color="purple">{value}</Tag> },
  { title: '销售主管', dataIndex: 'sales_manager', render: (value) => <Tag color="blue">{value}</Tag> },
  { title: '销售', dataIndex: 'sales', render: (value) => <Tag color="green">{value}</Tag> },
  { title: '财务', dataIndex: 'finance', render: (value) => <Tag color="orange">{value}</Tag> },
]

export default function SettingsPage() {
  const [role, setRole] = useState('sales')
  const selectedRole = roleOptions.find((item) => item.value === role)

  return (
    <AppShell>
      <Space orientation="vertical" size={20} style={{ width: '100%' }}>
        <PageHeader
          title="系统设置"
          subtitle="角色权限、审批规则、AI 安全、字段权限、数据范围和审计策略"
          actions={<Button type="primary" icon={<SettingOutlined />}>保存配置</Button>}
        />
        <Alert showIcon type="warning" title="配置页是前端框架占位，真正保存前需接入权限校验和审计日志。" />

        <Row gutter={[16, 16]}>
          <Col xs={24} xl={14}>
            <Card variant="borderless" title="风险与审批规则">
              <Table columns={ruleColumns} dataSource={riskRules} pagination={false} />
            </Card>
          </Col>
          <Col xs={24} xl={10}>
            <Card variant="borderless" title="当前角色视图" extra={<TeamOutlined />}>
              <Space orientation="vertical" size={14} style={{ width: '100%' }}>
                <Segmented value={role} onChange={(value) => setRole(String(value))} options={roleOptions.map((item) => ({ label: item.label, value: item.value }))} />
                <div className="crm-card-soft">
                  <Text strong>{selectedRole?.label}</Text><br />
                  <Text type="secondary">以下矩阵用于前端先验证角色差异，后台接入后必须由服务端权限和字段级权限再次校验。</Text>
                </div>
                {rolePermissionMatrix.map((item) => {
                  const value = item[role as keyof PermissionRow]
                  return <div className="crm-action-row" key={item.key}><Space style={{ width: '100%', justifyContent: 'space-between' }}><Text strong>{item.module}</Text><Tag>{String(value)}</Tag></Space></div>
                })}
              </Space>
            </Card>
          </Col>
        </Row>

        <Card variant="borderless" title="角色权限矩阵">
          <Table columns={permissionColumns} dataSource={rolePermissionMatrix} pagination={false} scroll={{ x: 1050 }} />
        </Card>

        <Card variant="borderless" title="权限落地注意事项">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}><div className="crm-card-soft"><Text strong>前端只做展示差异</Text><Paragraph type="secondary" style={{ marginBottom: 0 }}>隐藏按钮不能替代后台鉴权，正式接口必须校验角色、数据范围和字段权限。</Paragraph></div></Col>
            <Col xs={24} md={8}><div className="crm-card-soft"><Text strong>关键动作必须审计</Text><Paragraph type="secondary" style={{ marginBottom: 0 }}>审批、报价发送、订单确认、回款核销需要记录操作者、时间、前后值和原因。</Paragraph></div></Col>
            <Col xs={24} md={8}><div className="crm-card-soft"><Text strong>AI 权限单独控制</Text><Paragraph type="secondary" style={{ marginBottom: 0 }}>敏感数据、云端模型、自动草稿写入都应有独立开关和审批边界。</Paragraph></div></Col>
          </Row>
        </Card>
      </Space>
    </AppShell>
  )
}

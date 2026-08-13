'use client'

import { Alert, Button, Card, Col, Row, Space, Switch, Table, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { SettingOutlined } from '@ant-design/icons'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/common/PageHeader'
import { riskRules, roleOptions } from '@/frontend/mockData'

const { Text } = Typography
const columns: ColumnsType<(typeof riskRules)[number]> = [
  { title: '规则', dataIndex: 'rule' },
  { title: '责任方', dataIndex: 'owner' },
  { title: '动作', dataIndex: 'action', render: (action) => <Tag color="blue">{action}</Tag> },
  { title: '启用', dataIndex: 'enabled', render: (enabled) => <Switch defaultChecked={enabled} /> },
]

export default function SettingsPage() {
  return <AppShell><Space direction="vertical" size={20} style={{ width: '100%' }}><PageHeader title="系统设置" subtitle="角色权限、审批规则、AI 安全、字段权限、数据范围和审计策略" actions={<Button type="primary" icon={<SettingOutlined />}>保存配置</Button>} /><Alert showIcon type="warning" message="配置页是前端框架占位，真正保存前需接入权限校验和审计日志。" /><Row gutter={[16, 16]}><Col xs={24} xl={14}><Card bordered={false} title="风险与审批规则"><Table columns={columns} dataSource={riskRules} pagination={false} /></Card></Col><Col xs={24} xl={10}><Card bordered={false} title="角色权限矩阵"><Space direction="vertical" size={12} style={{ width: '100%' }}>{roleOptions.map((role) => <div className="crm-card-soft" key={role.value}><Text strong>{role.label}</Text><br /><Text type="secondary">客户、询盘、报价、订单、回款、单证、AI 权限按角色分配。</Text></div>)}</Space></Card></Col></Row></Space></AppShell>
}

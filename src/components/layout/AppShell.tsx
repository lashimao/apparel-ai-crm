'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMemo, useState } from 'react'
import {
  Avatar,
  AutoComplete,
  Badge,
  Button,
  Card,
  Divider,
  Drawer,
  Input,
  Layout,
  Menu,
  Select,
  Space,
  Tag,
  Typography,
} from 'antd'
import {
  BellOutlined,
  CheckCircleOutlined,
  MenuFoldOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import { approvals, customers, inquiries, navItems, orders, payments, quotations, riskRules, roleOptions, salesCashTodos } from '@/frontend/mockData'
import { StatusTag } from '@/components/common/StatusTag'

const { Header, Sider, Content } = Layout
const { Text, Title, Paragraph } = Typography

function selectedKeyFromPath(pathname: string) {
  if (pathname === '/') return 'dashboard'
  const first = pathname.split('/').filter(Boolean)[0]
  return first || 'dashboard'
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const selectedKey = selectedKeyFromPath(pathname)
  const [noticeOpen, setNoticeOpen] = useState(false)
  const [boundaryOpen, setBoundaryOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')

  const searchOptions = useMemo(() => {
    const rows = [
      ...customers.map((item) => ({ value: item.company, label: `${item.company} · 客户 · ${item.stage}`, href: `/customers/${item.key}` })),
      ...inquiries.map((item) => ({ value: item.inquiryNo, label: `${item.inquiryNo} · 询盘 · ${item.customer}`, href: `/inquiries/${item.key}` })),
      ...quotations.map((item) => ({ value: item.quoteNo, label: `${item.quoteNo} · 报价 · ${item.customer}`, href: `/quotations/${item.key}` })),
      ...orders.map((item) => ({ value: item.orderNo, label: `${item.orderNo} · 订单 · ${item.customer}`, href: `/orders/${item.key}` })),
      ...payments.map((item) => ({ value: item.paymentNo, label: `${item.paymentNo} · 回款 · ${item.customer}`, href: '/payments' })),
    ]
    const keyword = searchValue.trim().toLowerCase()
    return rows
      .filter((item) => !keyword || item.label.toLowerCase().includes(keyword) || item.value.toLowerCase().includes(keyword))
      .slice(0, 8)
      .map((item) => ({
        value: item.value,
        label: <a href={item.href}>{item.label}</a>,
        href: item.href,
      }))
  }, [searchValue])

  const riskItems = useMemo(() => [
    ...approvals.filter((item) => item.status === 'pending').map((item) => ({ key: item.key, title: item.type, desc: `${item.refNo} · ${item.customer} · ${item.reason}`, status: 'pending', href: '/approvals' })),
    ...payments.filter((item) => item.status === 'overdue' || item.status === 'partial').map((item) => ({ key: item.key, title: item.status === 'overdue' ? '回款逾期' : '部分回款', desc: `${item.paymentNo} · ${item.customer} · ${item.planned}`, status: item.status, href: '/payments' })),
    ...salesCashTodos.map((item) => ({ key: item.key, title: item.status, desc: `${item.no} · ${item.customer} · ${item.risk}`, status: 'risk', href: '/sales-cash' })),
  ], [])

  return (
    <Layout className="crm-page">
      <Sider width={244} breakpoint="lg" collapsedWidth="0" style={{ background: '#0b1f3a' }}>
        <div style={{ height: 72, display: 'flex', alignItems: 'center', padding: '0 20px', color: '#fff' }}>
          <Space>
            <Avatar style={{ background: '#1677ff' }}>N</Avatar>
            <Space orientation="vertical" size={0}>
              <Title level={5} style={{ color: '#fff', margin: 0 }}>NexFab CRM</Title>
              <Text style={{ color: 'rgba(255,255,255,.58)', fontSize: 12 }}>AI 外贸工作台</Text>
            </Space>
          </Space>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          style={{ background: '#0b1f3a', borderInlineEnd: 0 }}
          theme="dark"
          items={navItems.map((item) => ({
            key: item.key,
            icon: item.icon,
            label: <Link href={item.href}>{item.label}</Link>,
          }))}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 20px', borderBottom: '1px solid #edf0f5', height: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%', gap: 16 }}>
            <Space size={12} style={{ flex: 1 }}>
              <Button icon={<MenuFoldOutlined />} />
              <AutoComplete
                options={searchOptions}
                value={searchValue}
                onChange={setSearchValue}
                onSelect={(_, option) => {
                  const target = option as { href?: string }
                  if (target.href) window.location.href = target.href
                }}
                className="crm-header-search"
                style={{ width: 420, maxWidth: '46vw' }}
              >
                <Input prefix={<SearchOutlined />} placeholder="搜索客户、询盘、报价、订单、回款" allowClear />
              </AutoComplete>
            </Space>
            <Space size={12}>
              <Select defaultValue="management" options={roleOptions} style={{ width: 132 }} />
              <Button icon={<SafetyCertificateOutlined />} onClick={() => setBoundaryOpen(true)}>AI 边界</Button>
              <Badge count={riskItems.length} size="small"><Button shape="circle" icon={<BellOutlined />} onClick={() => setNoticeOpen(true)} /></Badge>
              <Avatar style={{ background: '#185fa5' }}>梦</Avatar>
            </Space>
          </div>
        </Header>
        <Content className="crm-content">{children}</Content>
      </Layout>

      <Drawer title="风险与待办" open={noticeOpen} onClose={() => setNoticeOpen(false)} size={520}>
        <Space orientation="vertical" size={16} style={{ width: '100%' }}>
          <Card size="small" className="crm-card-soft">
            <Space align="start">
              <WarningOutlined style={{ color: '#cf1322', marginTop: 3 }} />
              <div>
                <Space style={{ width: '100%', justifyContent: 'space-between' }}><Text strong>销售到回款闭环还有 {riskItems.length} 个待处理点</Text><a href="/notifications">完整通知中心</a></Space>
                <Paragraph type="secondary" style={{ marginBottom: 0 }}>优先处理低毛利审批、逾期尾款、待核销水单和订单发货前阻断项。</Paragraph>
              </div>
            </Space>
          </Card>
          <Space orientation="vertical" size={10} style={{ width: '100%' }}>
            {riskItems.map((item) => (
              <div className="crm-action-row" key={item.key}>
                <Space align="start" style={{ width: '100%', justifyContent: 'space-between' }}>
                  <div><Space><Text strong>{item.title}</Text><StatusTag value={item.status} /></Space><br /><Text type="secondary">{item.desc}</Text></div>
                  <a href={item.href}>去处理</a>
                </Space>
              </div>
            ))}
          </Space>
        </Space>
      </Drawer>

      <Drawer title="AI 使用边界" open={boundaryOpen} onClose={() => setBoundaryOpen(false)} size={560}>
        <Space orientation="vertical" size={16} style={{ width: '100%' }}>
          <AlertLike title="核心原则" desc="AI 只做识别、草稿、建议、风险提示；正式报价、审批、发送、核销必须由人工确认。" />
          <Divider style={{ margin: 0 }} />
          <Space orientation="vertical" size={10} style={{ width: '100%' }}>
            {riskRules.map((item) => (
              <div className="crm-action-row" key={item.key}>
                <Space align="start">
                  {item.enabled ? <CheckCircleOutlined style={{ color: '#0f6e56', marginTop: 4 }} /> : <WarningOutlined />}
                  <div><Space><Text strong>{item.rule}</Text><Tag>{item.owner}</Tag></Space><br /><Text type="secondary">{item.action}</Text></div>
                </Space>
              </div>
            ))}
          </Space>
        </Space>
      </Drawer>
    </Layout>
  )
}

function AlertLike({ title, desc }: { title: string; desc: string }) {
  return <div className="crm-card-soft"><Text strong>{title}</Text><br /><Text type="secondary">{desc}</Text></div>
}

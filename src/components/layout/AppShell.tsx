'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Avatar,
  Badge,
  Button,
  Input,
  Layout,
  Menu,
  Select,
  Space,
  Typography,
} from 'antd'
import {
  BellOutlined,
  MenuFoldOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import { navItems, roleOptions } from '@/frontend/mockData'

const { Header, Sider, Content } = Layout
const { Text, Title } = Typography

function selectedKeyFromPath(pathname: string) {
  if (pathname === '/') return 'dashboard'
  const first = pathname.split('/').filter(Boolean)[0]
  return first || 'dashboard'
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const selectedKey = selectedKeyFromPath(pathname)

  return (
    <Layout className="crm-page">
      <Sider width={244} breakpoint="lg" collapsedWidth="0" style={{ background: '#0b1f3a' }}>
        <div style={{ height: 72, display: 'flex', alignItems: 'center', padding: '0 20px', color: '#fff' }}>
          <Space>
            <Avatar style={{ background: '#1677ff' }}>N</Avatar>
            <Space direction="vertical" size={0}>
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
              <Input prefix={<SearchOutlined />} placeholder="搜索客户、询盘、报价、订单、单证" style={{ width: 360, maxWidth: '42vw' }} />
            </Space>
            <Space size={12}>
              <Select defaultValue="management" options={roleOptions} style={{ width: 132 }} />
              <Button icon={<SafetyCertificateOutlined />}>AI 边界</Button>
              <Badge count={5} size="small"><Button shape="circle" icon={<BellOutlined />} /></Badge>
              <Avatar style={{ background: '#185fa5' }}>梦</Avatar>
            </Space>
          </div>
        </Header>
        <Content className="crm-content">{children}</Content>
      </Layout>
    </Layout>
  )
}

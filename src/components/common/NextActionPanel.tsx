'use client'

import { Button, Card, Space, Tag, Typography } from 'antd'
import { ArrowRightOutlined, CheckCircleOutlined, ClockCircleOutlined, WarningOutlined } from '@ant-design/icons'
import Link from 'next/link'

const { Text } = Typography

export type NextActionItem = {
  key: string
  title: string
  desc: string
  owner: string
  level?: 'risk' | 'warning' | 'normal' | 'done'
  href?: string
}

const iconMap = {
  risk: <WarningOutlined style={{ color: '#cf1322' }} />,
  warning: <ClockCircleOutlined style={{ color: '#d46b08' }} />,
  normal: <ArrowRightOutlined style={{ color: '#185fa5' }} />,
  done: <CheckCircleOutlined style={{ color: '#0f6e56' }} />,
}

const colorMap = {
  risk: 'red',
  warning: 'orange',
  normal: 'blue',
  done: 'green',
}

export function NextActionPanel({ title = '下一步动作', items }: { title?: string; items: NextActionItem[] }) {
  return (
    <Card variant="borderless" title={title}>
      <Space orientation="vertical" size={10} style={{ width: '100%' }}>
        {items.map((item) => (
          <div className="crm-action-row" key={item.key}>
            <Space align="start" style={{ width: '100%', justifyContent: 'space-between' }}>
              <Space align="start">
                {iconMap[item.level || 'normal']}
                <div>
                  <Space wrap><Text strong>{item.title}</Text><Tag color={colorMap[item.level || 'normal']}>{item.owner}</Tag></Space><br />
                  <Text type="secondary">{item.desc}</Text>
                </div>
              </Space>
              {item.href ? <Link href={item.href}><Button size="small">处理</Button></Link> : null}
            </Space>
          </div>
        ))}
      </Space>
    </Card>
  )
}

'use client'

import type { ReactNode } from 'react'
import { Card, Space, Statistic, Typography } from 'antd'

const { Text } = Typography

export function KpiCard({ title, value, suffix, trend, color, prefix }: {
  title: string
  value: number | string
  suffix?: string
  trend?: string
  color?: string
  prefix?: ReactNode
}) {
  return (
    <Card variant="borderless">
      <Statistic title={title} value={value} suffix={suffix} prefix={prefix} styles={{ content: { color: color || '#185fa5' } }} />
      {trend ? <Text type="secondary">{trend}</Text> : null}
    </Card>
  )
}

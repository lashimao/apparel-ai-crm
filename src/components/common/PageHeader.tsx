'use client'

import type { ReactNode } from 'react'
import { Col, Row, Space, Typography } from 'antd'

const { Text, Title } = Typography

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string
  subtitle: string
  actions?: ReactNode
}) {
  return (
    <Row gutter={[16, 16]} align="middle" justify="space-between">
      <Col xs={24} lg={15}>
        <Space direction="vertical" size={4}>
          <Title level={2} style={{ margin: 0 }}>{title}</Title>
          <Text type="secondary">{subtitle}</Text>
        </Space>
      </Col>
      {actions ? <Col xs={24} lg={9} style={{ textAlign: 'right' }}>{actions}</Col> : null}
    </Row>
  )
}

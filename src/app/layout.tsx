import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import 'antd/dist/reset.css'
import './globals.css'

export const metadata: Metadata = {
  title: 'NexFab AI CRM',
  description: '外贸客户、询盘、报价、订单、回款与 AI 工作台',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}

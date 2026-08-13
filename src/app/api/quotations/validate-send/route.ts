import { NextResponse } from 'next/server'
import { validateQuotationCanSend } from '@/domain/salesCashRules'

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const result = validateQuotationCanSend(
      payload.quotation,
      payload.now ? new Date(payload.now) : new Date()
    )

    return NextResponse.json({ ok: true, data: result })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'unknown error' },
      { status: 400 }
    )
  }
}

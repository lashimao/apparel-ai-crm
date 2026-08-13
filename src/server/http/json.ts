import { NextResponse } from 'next/server'

function serializeValue(value: unknown): unknown {
  if (typeof value === 'bigint') return value.toString()
  if (value instanceof Date) return value.toISOString()
  if (Array.isArray(value)) return value.map(serializeValue)
  if (value && typeof value === 'object') {
    if ('toJSON' in value && typeof value.toJSON === 'function') {
      return value.toJSON()
    }

    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, child]) => [key, serializeValue(child)])
    )
  }
  return value
}

export function jsonOk(data: unknown, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data: serializeValue(data) }, init)
}

export function jsonError(error: unknown, status = 400) {
  return NextResponse.json(
    { ok: false, error: error instanceof Error ? error.message : 'unknown error' },
    { status }
  )
}

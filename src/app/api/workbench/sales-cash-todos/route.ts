import { buildSalesCashTodos } from '@/domain/salesCashRules'
import { jsonError, jsonOk } from '@/server/http/json'
import { getSalesCashTodosFromDatabase } from '@/server/services/salesCashService'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const limit = Number(url.searchParams.get('limit') || 20)
    const result = await getSalesCashTodosFromDatabase(Number.isFinite(limit) ? limit : 20)
    return jsonOk(result)
  } catch (error) {
    return jsonError(error)
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const result = buildSalesCashTodos({
      quotations: payload.quotations || [],
      orders: payload.orders || [],
      payments: payload.payments || [],
    })

    return jsonOk(result)
  } catch (error) {
    return jsonError(error)
  }
}

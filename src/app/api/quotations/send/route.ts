import { jsonError, jsonOk } from '@/server/http/json'
import { sendQuotationTransaction } from '@/server/services/salesCashService'

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const result = await sendQuotationTransaction(payload)
    return jsonOk(result)
  } catch (error) {
    return jsonError(error)
  }
}

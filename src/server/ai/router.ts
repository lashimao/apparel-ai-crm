/**
 * AI LLM 统一调用层
 *
 * 核心规则：
 * - AI 只生成草稿、摘要、建议和风险提示，不直接修改正式价格/订单/回款状态。
 * - 涉及 PII、报价、客户合同、付款凭证时，默认禁止静默跨边界降级到云端。
 * - 任何可对外发送的内容必须返回 requiresHumanApproval=true，由业务人员确认后才能发送。
 */

import OpenAI from 'openai'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
const CLOUD_MODEL = process.env.OPENAI_MODEL || 'gpt-4o'
const EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small'

const cloudClient = OPENAI_API_KEY
  ? new OpenAI({ apiKey: OPENAI_API_KEY, baseURL: OPENAI_BASE_URL })
  : null

interface CloudLLMOptions {
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
}

async function callCloud(
  prompt: string,
  options: CloudLLMOptions = {}
): Promise<{ content: string; tokensUsed: number; model: string }> {
  if (!cloudClient) {
    throw new Error('OPENAI_API_KEY is not configured')
  }

  const response = await cloudClient.chat.completions.create({
    model: CLOUD_MODEL,
    messages: [
      ...(options.systemPrompt
        ? [{ role: 'system' as const, content: options.systemPrompt }]
        : []),
      { role: 'user' as const, content: prompt },
    ],
    temperature: options.temperature ?? 0.4,
    max_tokens: options.maxTokens ?? 2000,
  })

  return {
    content: response.choices[0]?.message?.content || '',
    tokensUsed: response.usage?.total_tokens || 0,
    model: CLOUD_MODEL,
  }
}

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434'
const LOCAL_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:14b'

interface LocalLLMOptions {
  temperature?: number
  signal?: AbortSignal
}

async function callLocal(
  prompt: string,
  options: LocalLLMOptions = {}
): Promise<{ content: string; tokensUsed: number; model: string }> {
  const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: options.signal,
    body: JSON.stringify({
      model: LOCAL_MODEL,
      prompt,
      stream: false,
      options: {
        temperature: options.temperature ?? 0.3,
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()

  return {
    content: data.response || '',
    tokensUsed: data.eval_count || 0,
    model: LOCAL_MODEL,
  }
}

async function createEmbedding(text: string): Promise<number[]> {
  if (!cloudClient) {
    throw new Error('OPENAI_API_KEY is not configured')
  }

  const response = await cloudClient.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  })

  return response.data[0].embedding
}

export type AITaskType =
  | 'inquiry_reply'
  | 'quotation_suggest'
  | 'email_compose'
  | 'nl2sql'
  | 'document_draft'
  | 'payment_risk'
  | 'translation'
  | 'classification'
  | 'summarization'
  | 'sentiment'
  | 'duplicate_check'

type AIProvider = 'cloud' | 'local'

type TaskPolicy = {
  defaultProvider: AIProvider
  containsSensitiveData: boolean
  requiresHumanApproval: boolean
  allowCloudFallback: boolean
  maxTokens?: number
  temperature?: number
}

const TASK_POLICIES: Record<AITaskType, TaskPolicy> = {
  inquiry_reply: { defaultProvider: 'cloud', containsSensitiveData: true, requiresHumanApproval: true, allowCloudFallback: false, temperature: 0.3 },
  quotation_suggest: { defaultProvider: 'cloud', containsSensitiveData: true, requiresHumanApproval: true, allowCloudFallback: false, temperature: 0.2 },
  email_compose: { defaultProvider: 'cloud', containsSensitiveData: true, requiresHumanApproval: true, allowCloudFallback: false, temperature: 0.4 },
  nl2sql: { defaultProvider: 'cloud', containsSensitiveData: false, requiresHumanApproval: true, allowCloudFallback: true, temperature: 0.1 },
  document_draft: { defaultProvider: 'local', containsSensitiveData: true, requiresHumanApproval: true, allowCloudFallback: false, temperature: 0.2 },
  payment_risk: { defaultProvider: 'local', containsSensitiveData: true, requiresHumanApproval: true, allowCloudFallback: false, temperature: 0.1 },
  translation: { defaultProvider: 'local', containsSensitiveData: true, requiresHumanApproval: true, allowCloudFallback: false, temperature: 0.2 },
  classification: { defaultProvider: 'local', containsSensitiveData: false, requiresHumanApproval: false, allowCloudFallback: true, temperature: 0.1 },
  summarization: { defaultProvider: 'local', containsSensitiveData: true, requiresHumanApproval: true, allowCloudFallback: false, temperature: 0.2 },
  sentiment: { defaultProvider: 'local', containsSensitiveData: false, requiresHumanApproval: false, allowCloudFallback: true, temperature: 0.1 },
  duplicate_check: { defaultProvider: 'local', containsSensitiveData: true, requiresHumanApproval: false, allowCloudFallback: false, temperature: 0.1 },
}

interface AIRequest {
  taskType: AITaskType
  prompt: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
  forceProvider?: AIProvider
  allowCloudWithSensitiveData?: boolean
}

interface AIResponse {
  content: string
  tokensUsed: number
  model: string
  provider: AIProvider
  cost?: number
  requiresHumanApproval: boolean
  policy: TaskPolicy
  warnings: string[]
}

function estimateCloudCost(tokensUsed: number): number {
  return Number((tokensUsed * 0.00001).toFixed(4))
}

function resolveProvider(request: AIRequest, policy: TaskPolicy): AIProvider {
  if (!request.forceProvider) return policy.defaultProvider

  if (
    request.forceProvider === 'cloud' &&
    policy.containsSensitiveData &&
    !request.allowCloudWithSensitiveData
  ) {
    throw new Error('Sensitive task cannot be forced to cloud without allowCloudWithSensitiveData=true')
  }

  return request.forceProvider
}

export async function callAI(request: AIRequest): Promise<AIResponse> {
  const policy = TASK_POLICIES[request.taskType]
  const provider = resolveProvider(request, policy)
  const temperature = request.temperature ?? policy.temperature
  const maxTokens = request.maxTokens ?? policy.maxTokens
  const warnings: string[] = []

  if (policy.requiresHumanApproval) {
    warnings.push('AI 输出仅可作为草稿/建议，正式发送、报价锁价、订单变更和回款确认必须人工确认。')
  }

  try {
    if (provider === 'cloud') {
      const result = await callCloud(request.prompt, { systemPrompt: request.systemPrompt, temperature, maxTokens })
      return {
        ...result,
        provider: 'cloud',
        cost: estimateCloudCost(result.tokensUsed),
        requiresHumanApproval: policy.requiresHumanApproval,
        policy,
        warnings,
      }
    }

    const result = await callLocal(request.prompt, { temperature })
    return {
      ...result,
      provider: 'local',
      requiresHumanApproval: policy.requiresHumanApproval,
      policy,
      warnings,
    }
  } catch (error) {
    console.error(`AI call failed (${provider}):`, error)

    if (provider === 'cloud') {
      warnings.push('云端调用失败，已尝试本地模型降级；请复核输出质量。')
      const result = await callLocal(request.prompt, { temperature })
      return { ...result, provider: 'local', requiresHumanApproval: true, policy, warnings }
    }

    if (policy.allowCloudFallback && (!policy.containsSensitiveData || request.allowCloudWithSensitiveData)) {
      warnings.push('本地调用失败，已按策略尝试云端模型降级。')
      const result = await callCloud(request.prompt, { systemPrompt: request.systemPrompt, temperature, maxTokens })
      return {
        ...result,
        provider: 'cloud',
        cost: estimateCloudCost(result.tokensUsed),
        requiresHumanApproval: policy.requiresHumanApproval,
        policy,
        warnings,
      }
    }

    throw error
  }
}

export { callCloud, callLocal, createEmbedding, TASK_POLICIES }

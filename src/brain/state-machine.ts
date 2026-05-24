import type { PetState } from './pet-state'
import type { AppCategory } from '../sensors/window-sensor'

export type { PetState }
import OpenAI from 'openai'

export interface PetContext {
  category: AppCategory | null
  idleSeconds: number
  cpuLoad: number
  previousState: PetState
  appName: string
  windowTitle: string
}

// ── Local rules ──────────────────────────────────────

export function localDecide(ctx: PetContext): PetState | null {
  // Wake up from sleep
  if (ctx.previousState === 'sleeping' && ctx.idleSeconds < 10) {
    return 'wakeup'
  }

  // Over 1 min idle → sleep (passive activities like video are exempt)
  if (ctx.idleSeconds > 60 && (!ctx.category || ctx.category === 'idle')) {
    return 'sleeping'
  }

  switch (ctx.category) {
    case 'coding':
      return ctx.cpuLoad > 70 ? 'coding_struggle' : 'coding_focus'
    case 'gaming':
      return 'gaming_hype'
    case 'meeting':
      return 'meeting_nervous'
    case 'video':
      return 'video_watching'
    case 'browsing':
      return 'browsing_scroll'
    case 'writing':
      return 'writing_flow'
    case 'idle':
      return 'idle_breathe'
    default:
      return null // Unknown → DeepSeek fallback
  }
}

// ── DeepSeek fallback ────────────────────────────────

let openaiClient: OpenAI | null = null

function getClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY || 'sk-placeholder',
      baseURL: 'https://api.deepseek.com',
    })
  }
  return openaiClient
}

export async function aiDecide(ctx: PetContext): Promise<PetState> {
  try {
    const client = getClient()
    const response = await client.chat.completions.create({
      model: 'deepseek-chat',
      max_tokens: 20,
      temperature: 0.1,
      messages: [
        {
          role: 'user',
          content: `用户正在使用应用："${ctx.appName}"，窗口标题："${ctx.windowTitle}"。从以下状态中选一个最合适的（只返回状态名）：idle_breathe / coding_focus / gaming_hype / meeting_nervous / video_watching / browsing_scroll / writing_flow`,
        },
      ],
    })

    const state = response.choices[0]?.message?.content?.trim() as PetState | undefined
    return state && Object.keys(STATE_LABELS).includes(state) ? state : 'idle_breathe'
  } catch {
    return 'idle_breathe'
  }
}

// ── State labels ─────────────────────────────────────

const STATE_LABELS: Record<string, string> = {
  idle_breathe: '发呆中...',
  sleeping: '睡着了 zzz',
  coding_focus: '专注写代码',
  coding_struggle: '好像在编译...',
  gaming_hype: '打游戏！',
  meeting_nervous: '开会中',
  video_watching: '看视频',
  browsing_scroll: '刷网页',
  writing_flow: '写东西',
  wakeup: '欸你回来了！',
}

// ── Master decision function ─────────────────────────

export async function decidePetState(ctx: PetContext): Promise<{ state: PetState; label: string }> {
  const local = localDecide(ctx)
  let state: PetState

  if (local) {
    state = local
  } else {
    state = await aiDecide(ctx)
  }

  return { state, label: STATE_LABELS[state] || '发呆中...' }
}

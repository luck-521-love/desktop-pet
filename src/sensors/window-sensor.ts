import activeWin from 'active-win'

export type AppCategory =
  | 'coding'
  | 'gaming'
  | 'meeting'
  | 'video'
  | 'browsing'
  | 'writing'
  | 'idle'

export interface WindowInfo {
  appName: string
  windowTitle: string
}

const APP_MAP: Record<string, AppCategory> = {
  'Visual Studio Code': 'coding',
  'Code': 'coding',
  'Cursor': 'coding',
  'WebStorm': 'coding',
  'PyCharm': 'coding',
  'Xcode': 'coding',
  'Terminal': 'coding',
  'iTerm2': 'coding',
  'Warp': 'coding',
  'WindowsTerminal': 'coding',
  'Alacritty': 'coding',
  'WezTerm': 'coding',
  'Steam': 'gaming',
  'Epic Games': 'gaming',
  'Battle.net': 'gaming',
  'Zoom': 'meeting',
  'Teams': 'meeting',
  'Discord': 'meeting',
  'Lark': 'meeting',
  'DingTalk': 'meeting',
  'TencentMeeting': 'meeting',
  'WeMeet': 'meeting',
  'IINA': 'video',
  'VLC': 'video',
  'QuickTime Player': 'video',
  'MPV': 'video',
  'bilibili': 'video',
  '哔哩哔哩': 'video',
  'Bilibili': 'video',
  'qqlive': 'video',
  '腾讯视频': 'video',
  'QQLive': 'video',
  'iqiyi': 'video',
  '爱奇艺': 'video',
  'iQIYI': 'video',
  'youku': 'video',
  '优酷': 'video',
  'Youku': 'video',
  'mgtv': 'video',
  '芒果TV': 'video',
  'MangoTV': 'video',
  'Notion': 'writing',
  'Obsidian': 'writing',
  'Word': 'writing',
  'Typora': 'writing',
  'Chrome': 'browsing',
  'Safari': 'browsing',
  'Firefox': 'browsing',
  'Arc': 'browsing',
  'Microsoft Edge': 'browsing',
  'Brave': 'browsing',
  'Opera': 'browsing',
	'QQ': 'idle',
  'Finder': 'idle',
}

const BROWSER_TITLE_CLUES: Array<[RegExp, AppCategory]> = [
  [/youtube|bilibili|哔哩哔哩|b站|netflix|twitch|iqiyi|爱奇艺|youku|优酷|v\.qq\.com|腾讯视频|mgtv|mango|芒果|douyin|抖音|prime video|disney\+/i, 'video'],
  [/github|stackoverflow|docs\.|mdn|devdocs|gitlab|bitbucket|npmjs/i, 'coding'],
  [/notion|confluence|google docs|docs\.google|office\.com/i, 'writing'],
]

export function detectCategory(appName: string, windowTitle: string): AppCategory | null {
  // Direct match
  const direct = APP_MAP[appName]
  if (direct && direct !== 'browsing') return direct

  // Browser → check title clues
  if (direct === 'browsing') {
    for (const [pattern, category] of BROWSER_TITLE_CLUES) {
      if (pattern.test(windowTitle)) return category
    }
    return 'browsing'
  }

  // Try partial match
  for (const [mappedName, category] of Object.entries(APP_MAP)) {
    if (appName.toLowerCase().includes(mappedName.toLowerCase()) ||
      mappedName.toLowerCase().includes(appName.toLowerCase())) {
      return category
    }
  }

  return null // Unknown → DeepSeek fallback
}

export class WindowSensor {
  private timer: ReturnType<typeof setInterval> | null = null

  start(
    onUpdate: (category: AppCategory | null, info: WindowInfo) => void,
    intervalMs = 3000,
  ): void {
    this.timer = setInterval(async () => {
      const win = await activeWin()
      if (!win) return
      const category = detectCategory(win.owner.name, win.title)
      onUpdate(category, { appName: win.owner.name, windowTitle: win.title })
    }, intervalMs)
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }
}

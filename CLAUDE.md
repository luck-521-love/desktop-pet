# desktop-pet — CLAUDE.md

## 一句话
Codex Pet 外壳设计，驱动源是用户活动应用，不是 AI Agent。

## 数据流
Windows API 前景窗口检测(1s) → detectCategory → decidePetState(debounce=1) → IPC → PetSprite GIF 动画

## 技术栈
Electron 31 + React 19 + TypeScript + Framer Motion 12
Windows: PowerShell Add-Type + user32.dll (GetForegroundWindow)，输出强制 UTF-8
macOS: osascript + System Events
Linux: xdotool
CPU: systeminformation
AI 兜底: DeepSeek V4 Pro (OpenAI 兼容)

## 运行
npm run dev       # 开发（PowerShell 自动清除 ELECTRON_RUN_AS_NODE）
npm run build     # 生产构建

## 交互
- 悬停宠物 400ms → 状态气泡
- 按住宠物任意位置拖动 → 主进程光标轮询 (screen.getCursorScreenPoint + setInterval 16ms)
- 系统托盘 → 显隐/大小/退出
- 关闭窗口 → 隐藏到托盘（不退出），托盘"退出"才真正退出（forceQuit 机制）

## 状态对应

| 状态 | GIF | 触发 |
|------|-----|------|
| idle_breathe | ✅ | 默认/发呆 |
| sleeping | ✅ | 2分钟无操作 |
| coding_focus | ✅ | VS Code/Cursor/终端 |
| coding_struggle | ✅ | 编码 + CPU>70% |
| gaming_hype | ✅ | Steam/Epic/Battle.net |
| meeting_nervous | ✅ | Zoom/Teams/钉钉/飞书/Discord/QQ |
| video_watching | ✅ | 视频播放器 + 浏览器视频网站 |
| browsing_scroll | 🌀 emoji | 浏览器 |
| writing_flow | ✍️ emoji | Notion/Word/Obsidian |
| wakeup | ✅ | 从睡眠恢复 |

## 视频识别覆盖
**桌面客户端**: bilibili/哔哩哔哩、qqlive(腾讯视频)、iqiyi(爱奇艺)、youku(优酷)、mgtv(芒果TV)、VLC/IINA/MPV/QuickTime
**浏览器标题关键词**: youtube、bilibili/哔哩哔哩/b站、netflix、twitch、iqiyi/爱奇艺、youku/优酷、v.qq.com/腾讯视频、mgtv/mango/芒果、douyin/抖音、prime video、disney+

## 响应性能
- 轮询间隔: 1s
- Debounce 阈值: 1（连续2次确认后切换，最迟 ~2s 生效）
- PowerShell 窗口检测强制 UTF-8 输出，确保中文标题正常解析

## 环境变量
DEEPSEEK_API_KEY=your_key  （可选，不设置则只用本地规则）
ELECTRON_RUN_AS_NODE 必须在运行时清除（dev.ps1 自动处理）

## 目录结构
```
src/
├── main/
│   ├── index.ts              # 主进程驱动循环 (1s 轮询 + forceQuit)
│   └── pet-window.ts         # 浮动窗口 + 托盘 (onQuit 回调)
├── preload/index.ts          # contextBridge
├── renderer/
│   ├── App.tsx               # 容器（drag 区域）
│   ├── PetSprite.tsx         # GIF 精灵 + 状态气泡
│   └── env.d.ts
├── sensors/
│   ├── window-sensor.ts      # 前景窗口检测（多平台 + 中文视频平台）
│   └── idle-sensor.ts        # powerMonitor
├── brain/
│   ├── state-machine.ts      # 本地规则 + DeepSeek 兜底
│   └── pet-state.ts          # PetState 类型定义（共享给 renderer）
pets/                         # 8 张 GIF 精灵图 (300×309px each)
```

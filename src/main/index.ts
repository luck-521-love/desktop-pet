import { app, ipcMain, screen } from 'electron'
import path from 'path'
import { createPetWindow, createTray } from './pet-window'
import { WindowSensor } from '../sensors/window-sensor'
import { getIdleSeconds } from '../sensors/idle-sensor'
import { decidePetState } from '../brain/state-machine'
import type { PetState } from '../brain/state-machine'
import si from 'systeminformation'

app.commandLine.appendSwitch('enable-transparent-visuals')
app.setPath('userData', path.join(app.getPath('appData'), 'desktop-pet'))

app.whenReady().then(() => {
  const petWin = createPetWindow()
  createTray(petWin)

  const sensor = new WindowSensor()
  let previousState: PetState = 'idle_breathe'

  sensor.start(async (category, info) => {
    const cpu = await si.currentLoad()

    const ctx = {
      category,
      idleSeconds: getIdleSeconds(),
      cpuLoad: cpu.currentLoad,
      previousState,
      appName: info.appName,
      windowTitle: info.windowTitle,
    }

    const { state, label } = await decidePetState(ctx)

    if (state !== previousState) {
      previousState = state
      petWin.webContents.send('pet:state-change', state, label)
    }
  })

  // Mouse passthrough control
  ipcMain.on('pet:ignore-mouse', (_e, ignore: boolean) => {
    petWin.setIgnoreMouseEvents(ignore, { forward: true })
  })

  // Drag: main-process tight loop
  let isDragging = false

  ipcMain.on('pet:start-drag', () => {
    isDragging = true
    const cursor = screen.getCursorScreenPoint()
    const [wx, wy] = petWin.getPosition()
    const anchor = { x: cursor.x - wx, y: cursor.y - wy }

    const tick = () => {
      if (!isDragging) return
      const pos = screen.getCursorScreenPoint()
      petWin.setBounds({ x: pos.x - anchor.x, y: pos.y - anchor.y, width: 160, height: 200 })
      setTimeout(tick, 0)
    }
    tick()
  })

  ipcMain.on('pet:stop-drag', () => {
    isDragging = false
    petWin.setSize(160, 200)
  })
})

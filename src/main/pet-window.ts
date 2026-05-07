import { BrowserWindow, screen, Tray, Menu, nativeImage } from 'electron'
import path from 'path'

const PET_WINDOW_WIDTH = 160
const PET_WINDOW_HEIGHT = 200

export function createPetWindow(): BrowserWindow {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  const win = new BrowserWindow({
    width: PET_WINDOW_WIDTH,
    height: PET_WINDOW_HEIGHT,
    x: width - PET_WINDOW_WIDTH - 20,
    y: height - PET_WINDOW_HEIGHT - 20,

    // Codex shell core config
    title: '',
    transparent: true,
    frame: false,
    thickFrame: false,
    backgroundColor: '#00000000',
    alwaysOnTop: true,
    skipTaskbar: true,
    focusable: false,
    resizable: false,
    hasShadow: false,

    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      sandbox: false,
    },
  })

  // Default: mouse passthrough (don't block normal work)
  win.setIgnoreMouseEvents(true, { forward: true })

  if (process.env.NODE_ENV === 'development' || process.env.ELECTRON_RENDERER_URL) {
    win.loadURL(process.env.ELECTRON_RENDERER_URL!)
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  win.show()
  return win
}

export function createTray(petWin: BrowserWindow): Tray {
  const trayIconPath = path.join(__dirname, '../../assets/tray-icon.png')
  let trayImage: Electron.NativeImage

  try {
    trayImage = nativeImage.createFromPath(trayIconPath)
  } catch {
    trayImage = nativeImage.createEmpty()
  }

  if (trayImage.isEmpty()) {
    trayImage = nativeImage.createFromDataURL(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAbwAAAG8B8aLcQwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAEESURBVDiNpZMxDsIwDEV/j4DEwMjKysbGxsbGxsbGxsbGxsbCwMDAwMDAAAMDAwMDAwMDA0P/CFKkSq0q9UtPdpzf2XHsAACKm1PBNQDkALgCYAGAHQBsmPkBgAFqAJD6BhgRs2Rmd4xRESAiCIAHZtb6ANbMfAZAiojec04w8wUABkT0wcyrEICZ3wHQJqLXYDgCIEUuP8zMGADMc84bAJSI6J0C2I+LHAD6RPSKctd6AjAios8f4AtgEW6L13P/AHBARLd5ASPrHH+CEECj9sCQma9jr7Qo14CrIJsvItpGFYJ/i+TuEkCCiLyIAi1WN1bBQ4nrRHTJj0p//wGdFj+KviGJ0gAAAABJRU5ErkJggg=='
    )
  }

  const tray = new Tray(trayImage)
  tray.setToolTip('Desktop Pet')

  const menu = Menu.buildFromTemplate([
    {
      label: '显示/隐藏宠物',
      click: () => {
        petWin.isVisible() ? petWin.hide() : petWin.show()
      },
    },
    {
      label: '宠物大小',
      submenu: [
        { label: '小 (100×130)', click: () => petWin.setSize(100, 130) },
        { label: '中 (160×200)', click: () => petWin.setSize(160, 200) },
        { label: '大 (220×280)', click: () => petWin.setSize(220, 280) },
      ],
    },
    { type: 'separator' },
    { label: '退出', role: 'quit' },
  ])

  tray.setContextMenu(menu)
  return tray
}

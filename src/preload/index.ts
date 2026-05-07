import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('petAPI', {
  onStateChange: (callback: (state: string, label: string) => void) => {
    ipcRenderer.on('pet:state-change', (_event, state: string, label: string) => {
      callback(state, label)
    })
  },
  setIgnoreMouseEvents: (ignore: boolean) => {
    ipcRenderer.send('pet:ignore-mouse', ignore)
  },
  startDrag: () => {
    ipcRenderer.send('pet:start-drag')
  },
  stopDrag: () => {
    ipcRenderer.send('pet:stop-drag')
  },
})

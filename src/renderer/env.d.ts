/// <reference types="vite/client" />

interface Window {
  petAPI: {
    onStateChange: (callback: (state: string, label: string) => void) => void
    setIgnoreMouseEvents: (ignore: boolean) => void
    startDrag: () => void
    stopDrag: () => void
  }
}

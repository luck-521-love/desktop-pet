import { powerMonitor } from 'electron'

export function getIdleSeconds(): number {
  return powerMonitor.getSystemIdleTime()
}

import { useState, useEffect, useCallback } from 'react'
import PetSprite from './PetSprite'
import type { PetState } from '../brain/pet-state'

export default function App() {
  const [state, setState] = useState<PetState>('idle_breathe')
  const [label, setLabel] = useState('发呆中...')

  useEffect(() => {
    window.petAPI.onStateChange((newState: string, newLabel: string) => {
      setState(newState as PetState)
      setLabel(newLabel)
    })
  }, [])

  const onPointerEnter = useCallback(() => {
    window.petAPI.setIgnoreMouseEvents(false)
  }, [])

  const onPointerLeave = useCallback(() => {
    window.petAPI.setIgnoreMouseEvents(true)
  }, [])

  const onPointerDown = useCallback(() => {
    window.petAPI.startDrag()
    const stop = () => {
      window.petAPI.stopDrag()
      window.removeEventListener('pointerup', stop)
    }
    window.addEventListener('pointerup', stop)
  }, [])

  return (
    <div
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onPointerDown={onPointerDown}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'transparent',
      }}
    >
      <PetSprite state={state} label={label} />
    </div>
  )
}

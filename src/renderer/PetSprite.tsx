import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { PetState } from '../brain/pet-state'

const STATE_LABELS: Record<PetState, string> = {
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

const STATE_EMOJI: Record<PetState, string> = {
  idle_breathe: '😌',
  sleeping: '😴',
  coding_focus: '🤔',
  coding_struggle: '😤',
  gaming_hype: '🎮',
  meeting_nervous: '😬',
  video_watching: '🍿',
  browsing_scroll: '🌀',
  writing_flow: '✍️',
  wakeup: '👋',
}

const STATES_WITH_GIF = new Set<PetState>([
  'idle_breathe', 'sleeping', 'coding_focus', 'coding_struggle',
  'gaming_hype', 'meeting_nervous', 'video_watching', 'wakeup',
])

interface PetSpriteProps {
  state: PetState
  label?: string
}

export default function PetSprite({ state, label }: PetSpriteProps) {
  const [showTip, setShowTip] = useState(false)

  return (
    <div style={{ position: 'relative' }}>
      {/* Tooltip bubble */}
      <AnimatePresence>
        {showTip && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: 2,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(20, 20, 20, 0.85)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              color: '#fff',
              padding: '5px 10px',
              borderRadius: 8,
              fontSize: 12,
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            {label || STATE_LABELS[state]}
          </motion.div>
        )}
      </AnimatePresence>

      {/* State transition wrapper */}
      <AnimatePresence mode="wait">
        <motion.div
          key={state}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.85 }}
          transition={{ duration: 0.2 }}
          onHoverStart={() => setShowTip(true)}
          onHoverEnd={() => setShowTip(false)}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))',
          }}
        >
          {STATES_WITH_GIF.has(state) ? (
            <img
              src={`/${state}.gif`}
              alt={state}
              draggable={false}
              style={{
                width: 150,
                height: 155,
              }}
            />
          ) : (
            <span
              style={{
                fontSize: 80,
                lineHeight: 1,
                filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))',
              }}
            >
              {STATE_EMOJI[state]}
            </span>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

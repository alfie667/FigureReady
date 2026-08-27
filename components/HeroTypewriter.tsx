'use client'
import { useEffect, useState } from 'react'

const WORDS = [
  'FTIR spectra',
  'XRD patterns',
  'dose-response data',
  'UV-Vis measurements',
  'scientific data',
]

const TYPE_SPEED  = 55   // ms per character typed
const DELETE_SPEED = 30  // ms per character deleted
const PAUSE_FULL  = 1800 // ms pause when word is complete
const PAUSE_EMPTY = 300  // ms pause before typing next word

export default function HeroTypewriter() {
  const [displayed, setDisplayed] = useState('')
  const [wordIndex, setWordIndex] = useState(0)
  const [phase, setPhase] = useState<'typing' | 'pausing' | 'deleting' | 'waiting'>('typing')

  useEffect(() => {
    const target = WORDS[wordIndex]

    if (phase === 'typing') {
      if (displayed.length < target.length) {
        const t = setTimeout(
          () => setDisplayed(target.slice(0, displayed.length + 1)),
          TYPE_SPEED,
        )
        return () => clearTimeout(t)
      } else {
        const t = setTimeout(() => setPhase('deleting'), PAUSE_FULL)
        return () => clearTimeout(t)
      }
    }

    if (phase === 'deleting') {
      if (displayed.length > 0) {
        const t = setTimeout(
          () => setDisplayed(prev => prev.slice(0, -1)),
          DELETE_SPEED,
        )
        return () => clearTimeout(t)
      } else {
        const t = setTimeout(() => {
          setWordIndex(i => (i + 1) % WORDS.length)
          setPhase('typing')
        }, PAUSE_EMPTY)
        return () => clearTimeout(t)
      }
    }
  }, [displayed, phase, wordIndex])

  return (
    <span className="text-blue-600 whitespace-nowrap">
      {displayed}
      <span
        className="inline-block w-[2px] h-[0.85em] bg-blue-500 ml-[2px] align-middle"
        style={{ animation: 'blink 1s step-end infinite' }}
      />
      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </span>
  )
}
